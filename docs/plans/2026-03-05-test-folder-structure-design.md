# Test Folder Structure Design

**Date:** 2026-03-05  
**Status:** Approved

---

## Goal

Define a clear, centralized test directory strategy under root `tests/` for this codebase, with explicit boundaries between unit and integration tests.

## Constraints

- Test files should not be colocated with production files.
- No e2e folder is required at this stage.
- Structure must stay readable as test volume grows.

## Approved Directory Structure

```txt
tests/
  unit/
    app/
    components/
    stores/
    lib/
    utils/
  integration/
    app/
    workflows/
  fixtures/
  helpers/
```

## Placement Rules

- Put single-module behavior tests in `tests/unit/**`.
- Put cross-component, cross-store, or flow-level tests in `tests/integration/**`.
- Put reusable test data in `tests/fixtures/**`.
- Put reusable render/mocking/factory helpers in `tests/helpers/**`.

## Naming Conventions

- Use `<subject>.test.ts` or `<subject>.test.tsx`.
- Mirror source structure where practical for easy traceability.
- For route segment folders like `[workflow-builder]`, use normalized folder names in tests (for example `workflow-builder`).

## Example Mapping

- Source: `app/[workflow-builder]/components/module-list.tsx`
- Test: `tests/unit/app/workflow-builder/components/module-list.test.tsx`

## Non-Goals

- Defining e2e strategy/tooling.
- Introducing new testing frameworks in this design doc.

## Success Criteria

- Team can decide test location without ambiguity.
- Unit vs integration boundaries are explicit.
- Test tree remains navigable when new suites are added.
