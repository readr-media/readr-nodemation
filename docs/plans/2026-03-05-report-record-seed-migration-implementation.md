# Report Record Seed Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove "產出報告紀錄" from seed data while preserving existing DB records by setting them inactive.

**Architecture:** Apply a two-part change: stop creating new report-record units via `prisma/seed.js`, then apply a data-only Prisma migration that updates existing `module_unit` rows to `active = false` when `action = '產出報告紀錄'`.

**Tech Stack:** Prisma + SQLite, Node.js, pnpm.

---

### Task 1: Remove report-record unit from seed source

**Files:**
- Modify: `prisma/seed.js`
- Test: `prisma/seed.js` (data shape verification by grep)

**Step 1: Write the failing test**

Run: `rg -n "產出報告紀錄|FileSpreadsheet" prisma/seed.js`  
Expected: FAIL condition for requirement (matches should exist before fix).

**Step 2: Run test to verify it fails**

Run: `node -e "const s=require('fs').readFileSync('prisma/seed.js','utf8'); if(!s.includes('產出報告紀錄')) process.exit(1)"`  
Expected: PASS now (means pre-fix content still includes report record).

**Step 3: Write minimal implementation**

- Remove only the "產出報告紀錄" unit object from the `moduleSeed` array in `內容整理模組`.
- Keep "匯出結果" unchanged.

**Step 4: Run test to verify it passes**

Run: `rg -n "產出報告紀錄|FileSpreadsheet" prisma/seed.js`  
Expected: no matches.

**Step 5: Commit**

```bash
git add prisma/seed.js
git commit -m "chore: remove report record unit from module seed"
```

### Task 2: Add data migration to disable existing report-record units

**Files:**
- Create: `prisma/migrations/<timestamp>_deprecate_report_record_module_unit/migration.sql`

**Step 1: Write the failing test**

Run: `find prisma/migrations -maxdepth 2 -name '*deprecate_report_record_module_unit*'`  
Expected: no result before migration creation.

**Step 2: Run test to verify it fails**

Run: `rg -n "UPDATE\\s+\"?ModuleUnit\"?|UPDATE\\s+module_unit" prisma/migrations -g '**/migration.sql'`  
Expected: no matching migration for this specific deprecation before creation.

**Step 3: Write minimal implementation**

Create migration SQL with a constrained update:

```sql
UPDATE "module_unit"
SET "active" = 0
WHERE "action" = '產出報告紀錄';
```

If the actual SQLite table name is different in prior migrations, use the exact existing table name used by this project.

**Step 4: Run test to verify it passes**

Run: `rg -n "產出報告紀錄|active\\s*=\\s*0" prisma/migrations/*/migration.sql`  
Expected: matches in the new migration.

**Step 5: Commit**

```bash
git add prisma/migrations
git commit -m "chore: deactivate legacy report record module units"
```

### Task 3: Verify migration and seed behavior locally

**Files:**
- Verify runtime behavior (no additional file required)

**Step 1: Write the failing test**

Run: `pnpm prisma migrate dev --name verify_report_record_deprecation`  
Expected: migration runs; if blocked, capture exact error.

**Step 2: Run test to verify it fails**

Run (SQLite quick check via Prisma Studio or SQL client):
- Query: report-record rows should still exist but now `active = false`.
- Query: seed source should not recreate report-record unit.

Expected before reseed: old rows present with `active = false`.

**Step 3: Write minimal implementation**

- If migration fails due to SQL/table naming mismatch, update only migration SQL to match actual table name.
- Do not broaden WHERE clause.

**Step 4: Run test to verify it passes**

Run in order:
- `pnpm prisma migrate dev`
- `pnpm prisma db seed` (or project-equivalent seeding command)
- confirm no new active `產出報告紀錄` rows are created

**Step 5: Commit**

```bash
git add prisma/migrations prisma/seed.js
git commit -m "chore: verify seed and migration consistency for report record deprecation"
```

### Task 4: Final verification gate

**Files:**
- Verify only

**Step 1: Write the failing test**

Run: `pnpm lint`  
Expected: PASS (or capture existing unrelated failures with exact output).

**Step 2: Run test to verify it fails**

Run: `pnpm run test:unit`  
Expected: PASS.

**Step 3: Write minimal implementation**

- If failures appear, apply minimal scoped fixes only related to this change.

**Step 4: Run test to verify it passes**

Run:
- `pnpm lint`
- `pnpm run test:unit`
- `pnpm build` (if environment allows; otherwise report blocker)

Expected: all available checks pass or blockers are explicitly documented.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: finalize verification for report-record seed deprecation"
```
