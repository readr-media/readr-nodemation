# Report Record Seed And Data Consistency Design

**Date:** 2026-03-05  
**Status:** Approved

---

## Goal

Keep database seed data consistent with current workflow-builder behavior by removing the "產出報告紀錄" seed unit, while preserving existing historical records in databases.

## Scope

- Modify `prisma/seed.js` to stop seeding "產出報告紀錄".
- Add a Prisma migration that marks existing "產出報告紀錄" records inactive.
- No schema changes.
- No hard delete.

## Approved Approach

1. Remove the "產出報告紀錄" unit from `moduleSeed` in `prisma/seed.js`.
2. Add a data migration SQL script to update existing records:
   - Target: `module_unit.action = '產出報告紀錄'`
   - Change: `active = 0` (SQLite boolean false)

## Data Consistency Strategy

- New environments: seed no longer creates this unit.
- Existing environments: legacy rows remain for history but are disabled.
- App behavior and seed behavior stay aligned (content module effectively only uses "匯出結果").

## Risks And Mitigation

- Risk: accidental update scope too broad.
  - Mitigation: migration WHERE clause strictly filters `action = '產出報告紀錄'`.
- Risk: manual rollback need.
  - Mitigation: possible follow-up data migration can flip `active` back to `1` for the same filter.

## Verification Plan

1. Run migration locally (`pnpm prisma migrate dev`).
2. Verify legacy rows now have `active = false`.
3. Re-seed (if needed) and verify no new "產出報告紀錄" rows are created.
4. Run standard checks (lint + available tests).

## Non-Goals

- Removing legacy rows from historical databases.
- Adding new feature flags or schema columns.
- Re-introducing report-record behavior in UI/store.
