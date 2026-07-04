# CI/CD Prisma Migrate Deploy — Design

## Problem

`prisma/migrations/` already holds a proper Prisma migration history, but the
deploy pipeline never applies it. `cloudbuild.yaml` only builds the image,
pushes it, and runs `gcloud run deploy`. Applying migrations to the shared dev
Cloud SQL instance (`mirrorlearning-161006:asia-east1:ndx-workflow`) is a manual
step a developer runs locally through `cloud-sql-proxy` (`pnpm db:proxy` +
`prisma migrate deploy`). Consequence: merging a schema PR to `main` does **not**
change the database — the schema and the running code can silently drift.

The worker repo (`readr-nodemation-lagann`) reads/writes this same database via
`pgx` and owns no schema. Prisma here is the sole schema authority, so the
migration-deploy step belongs in this repo's pipeline.

## Goal

Apply pending Prisma migrations to Cloud SQL automatically as part of the
`readr-nodemation-dev` Cloud Build pipeline, so a merge to `main` brings the
database to the schema the new revision expects.

## Approach

Add a `migrate` step to `cloudbuild.yaml` between the image push and the
`gcloud run deploy` step:

```
build  ->  push  ->  migrate  ->  deploy
```

The step:

1. Runs in a `node:22` builder.
2. Downloads the Cloud SQL Auth Proxy and starts it with
   `--unix-socket /cloudsql`, creating
   `/cloudsql/$PROJECT_ID:asia-east1:ndx-workflow/.s.PGSQL.5432`.
3. Waits for the socket, then runs `pnpm install --frozen-lockfile` and
   `pnpm exec prisma migrate deploy`.

`DATABASE_URL` is injected from the existing `database-url-fe` Secret Manager
secret via Cloud Build's `availableSecrets` / `secretEnv`. That secret already
uses the `host=/cloudsql/<INSTANCE>` unix-socket form (it is the same secret the
runtime consumes through `--set-cloudsql-instances`), so the proxy socket path
matches and the secret is reused **unchanged**.

### Why these choices

- **Ordering build -> push -> migrate -> deploy.** The image is ready before we
  touch the DB; the schema is applied immediately before traffic shifts to the
  new revision. If migration fails, Cloud Build aborts and the deploy step never
  runs — the old revision keeps serving, avoiding "new code on old schema".
- **`prisma migrate deploy`** (not `dev`/`push`/`reset`) only applies pending
  migrations and is a no-op when none are pending — safe to run on every build,
  idempotent.
- **Version fidelity.** `pnpm install --frozen-lockfile` + `pnpm exec prisma`
  pins the migration engine to the repo's locked `prisma ^6.19.0` /
  `pnpm@10.33.2` (matches the Dockerfile's proven install), avoiding drift a
  pinned `npx prisma@x` would introduce. Cost: ~30–60s added build time.
- **Reuse `database-url-fe`.** No new secret, no TCP variant — the unix-socket
  path lines up with the runtime mount by construction.
- **Cloud SQL Auth Proxy in-step** rather than a separate Cloud Run Job: a
  single-file change, no new image/job/infra (pragmatic for a dev-only,
  single-DB setup). A dedicated migration Cloud Run Job remains the cleaner
  option if independent on-demand migration runs or multiple environments are
  introduced later.

### Rejected alternatives

- **Entrypoint migration** (`migrate deploy` in the container `CMD`): Cloud Run
  scales to multiple instances → concurrent migrate races; runs on every cold
  start; the Next.js standalone image strips the Prisma CLI and migration files.
- **Manual-only, formalized**: does not meet the goal (still requires a human to
  apply schema).

## IAM

The pipeline runs as the default Cloud Build service account
`1075249966777@cloudbuild.gserviceaccount.com` (the `readr-nodemation-dev`
trigger specifies no custom SA). It needs:

- `roles/cloudsql.client` (project level) — connect through the proxy.
- `roles/secretmanager.secretAccessor` on secret `database-url-fe` — read
  `DATABASE_URL`. Granted at the secret resource level, not project-wide.

This is a production-class change (it lets CI mutate a shared database) and is
applied with explicit approval.

## Verification

1. **Read-only first.** A controlled manual `gcloud builds submit` running
   `prisma migrate status` against dev Cloud SQL, to confirm proxy + secret +
   IAM + Prisma all work and to learn whether any migration is pending —
   **without** a `gcloud run deploy` step (no FE deploy) and without applying
   anything.
2. **No-op deploy path.** If nothing is pending, run the same controlled build
   with `prisma migrate deploy` to exercise the exact production command and
   confirm the "No pending migrations to apply" no-op.
3. **Pending migration is a checkpoint.** If `migrate status` shows a pending
   migration, do not auto-apply it as part of testing — applying real DDL to the
   shared dev DB (which the worker depends on) requires explicit confirmation.
4. **Failure path (reasoned, not executed in prod).** Cloud Build steps are
   sequential; a non-zero `migrate deploy` aborts the build before the deploy
   step, so a bad migration blocks the deploy.

## Scope / out of scope

- In scope: `cloudbuild.yaml` (App repo), the two IAM grants, this doc.
- Out of scope: Dockerfile changes, worker repo changes, rollback automation
  (dev relies on Cloud SQL backups), staging/prod environment split.

## Follow-ups

- After this ships, update the worker repo memory note that currently records
  "App pipeline does NOT run `prisma migrate deploy`".
- The `migrate status` check on first run may reveal migrations applied manually
  but not yet recorded, or vice-versa; reconcile before enabling on `main` if so.
