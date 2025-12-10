# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router workspace. Keep route handlers, layouts, and server actions in `app/`, and colocate UI logic with their routes when practical. Shared UI primitives live in `components/` (ShadCN + custom hooks), while cross-cutting helpers sit in `lib/`, `utils/`, and `constants/`. Client state and IO live in `stores/`, `providers/`, and `graphql/` (generated documents reference `introspection.json`). Static assets belong in `public/`, and configuration for design tokens/components sits in `components.json`. Use the `@/*` path alias defined in `tsconfig.json` for absolute imports.

## Build, Test, and Development Commands
- `pnpm install`: sync dependencies after pulling new GraphQL types or UI packages.
- `pnpm dev`: runs `next dev --webpack` plus `graphql-codegen -w`, so schema or query edits immediately refresh generated hooks in `graphql/`.
- `pnpm build`: production build with Next’s standalone output; run before opening deployment PRs.
- `pnpm start`: serves the build for smoke-testing.
- `pnpm lint` / `pnpm format`: runs Biome’s checker/formatter; CI parity starts with these commands.

## Coding Style & Naming Conventions
Biome (see `biome.json`) enforces 2-space indentation, organized imports, and React/Next best practices—run it before committing. Prefer TypeScript everywhere (`strict: true`) and keep derived types near their usage. Name components with PascalCase (`NodeCanvas.tsx`), hooks with `use` prefixes, and Zustand stores with the `*Store` suffix. Tailwind utility classes should be grouped logically (layout → spacing → color) to match existing components. Keep GraphQL fragments near the consuming component, and do not hand-edit generated files.

## Testing Guidelines
No automated test runner ships yet, so gate changes with `pnpm lint` and manual interaction inside `pnpm dev`. When adding tests, place component specs beside their source as `Component.test.tsx` and stub GraphQL responses (Apollo MockedProvider) to keep flows deterministic. Aim for critical-path coverage (canvas operations, CMS integrations) before merging large workflow updates; note missing coverage in the PR description when unavoidable.

## Commit & Pull Request Guidelines
Git history follows light Conventional Commits (`feat:`, `fix:`, `chore:`). Keep subject lines under 72 chars and describe scope (`feat: add node edge change handling`). PRs should include: purpose summary, screenshots/GIFs for UX changes, schema/codegen impacts, and linked issues. Re-run `pnpm dev` locally if GraphQL documents changed to ensure generated artifacts are updated. Request review from a workflow maintainer when modifying `app/(admin)` or shared providers to avoid regressions.

## Configuration & Security Tips
Secrets (API keys, CMS tokens) belong in `.env.local`; never commit them. Update `graphql/codegen.ts` if schemas move, then re-run `pnpm dev` once to refresh outputs. When introducing new providers, register them via `providers/` and document any required environment variables in the PR. Remove stray `.next` artifacts before committing.
