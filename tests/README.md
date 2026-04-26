# Test Layout

All tests are centralized under root `tests/`.

## Folders

- `tests/unit/`: single-module tests (functions, components, store slices).
- `tests/integration/`: cross-module behavior and workflow-level interactions.
- `tests/fixtures/`: static test payloads and snapshots.
- `tests/helpers/`: shared testing utilities (render wrappers, factories, mocks).

## Path Conventions

- Use `<subject>.test.ts` or `<subject>.test.tsx`.
- Mirror source structure when practical.
- Normalize route segment folder names in test paths (for example `[workflow-builder]` -> `workflow-builder`).

## Example

- Source: `app/[workflow-builder]/components/module-list.tsx`
- Test: `tests/unit/app/workflow-builder/components/module-list.test.tsx`

## Commands

- `pnpm run test`
- `pnpm run test:unit`
- `pnpm run test:integration`

## About `.gitkeep`

Some folders in `tests/` may only contain a `.gitkeep` file. This keeps empty
directories tracked in Git, because Git does not store empty directories by
default.
