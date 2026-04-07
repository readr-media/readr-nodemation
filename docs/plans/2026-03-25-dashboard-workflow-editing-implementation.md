# Dashboard Workflow Editing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users open an existing workflow from `/dashboard`, edit it in `/workflow-builder`, and save either by updating the original workflow or creating a new workflow.

**Architecture:** Use `workflowId` in the builder URL as the source of truth. Load the full workflow document into the editor from the database, hydrate graph state into the existing flow store, and track workflow metadata and dirty state in a dedicated Zustand editor store. Keep `POST /api/workflows` for save-as-new and add single-workflow read/update routes with shared Zod validation.

**Tech Stack:** Next.js App Router, React, Zustand, Prisma, SQLite, Zod, Vitest

---

### Task 1: Lock dashboard navigation to workflow builder with a failing test

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/_components/user-workflow-card.tsx`
- Create: `tests/unit/app/dashboard/user-workflow-card.test.tsx`

**Step 1: Write the failing test**

Create a unit test that renders `UserWorkflowCard` with a workflow id and expects:
- the card is keyboard/click accessible
- the card links to `/workflow-builder?workflowId=<id>`
- existing card text still renders

Use a real render instead of mocking link behavior.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/dashboard/user-workflow-card.test.tsx`

Expected: FAIL because the card currently does not accept `id` or render a navigation target.

**Step 3: Write minimal implementation**

Update the dashboard flow so:
- `app/dashboard/page.tsx` passes `id` into `UserWorkflowCard`
- `UserWorkflowCard` renders a clickable card using Next `Link`
- the destination is `/workflow-builder?workflowId=<id>`

Keep the current card UI intact.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/app/dashboard/user-workflow-card.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/_components/user-workflow-card.tsx tests/unit/app/dashboard/user-workflow-card.test.tsx
git commit -m "test: lock dashboard workflow navigation"
```

### Task 2: Add workflow detail API coverage before implementation

**Files:**
- Create: `app/api/workflows/[id]/route.ts`
- Create: `lib/workflow-api-schema.ts`
- Create: `tests/unit/app/api/workflows/workflow-detail-route.test.ts`

**Step 1: Write the failing tests**

Create tests that exercise the new single-workflow route behavior:
- `GET /api/workflows/:id` returns the workflow when found
- `GET /api/workflows/:id` returns `404` when missing
- `PUT /api/workflows/:id` rejects invalid payloads with `400`
- `PUT /api/workflows/:id` updates name, description, status, nodes, and edges when payload is valid

Use the same Zod-validated payload shape for update that the builder will later submit.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/api/workflows/workflow-detail-route.test.ts`

Expected: FAIL because the route and shared schema do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- shared workflow payload schema in `lib/workflow-api-schema.ts`
- `GET` handler in `app/api/workflows/[id]/route.ts`
- `PUT` handler in `app/api/workflows/[id]/route.ts`

Requirements:
- reuse the same JSON stringification strategy as existing `POST`
- return `404` for missing workflows
- return `400` for invalid payload
- update only the workflow identified by route id

Do not add node-type-specific deep validation yet.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/app/api/workflows/workflow-detail-route.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add app/api/workflows/[id]/route.ts lib/workflow-api-schema.ts tests/unit/app/api/workflows/workflow-detail-route.test.ts
git commit -m "feat: add workflow detail api"
```

### Task 3: Add workflow editor metadata store with dirty-state coverage

**Files:**
- Create: `stores/workflow-editor/store.ts`
- Create: `tests/unit/stores/workflow-editor-store.test.ts`

**Step 1: Write the failing tests**

Create tests for a dedicated workflow editor store that cover:
- hydrating metadata from a loaded workflow document
- reporting `isDirty = false` immediately after hydration
- flipping `isDirty = true` when name, description, status, nodes, or edges diverge from baseline
- resetting baseline after a successful save
- switching to a new workflow id after save-as-new

Use concrete sample values rather than mocks.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/stores/workflow-editor-store.test.ts`

Expected: FAIL because the store does not exist yet.

**Step 3: Write minimal implementation**

Create a dedicated Zustand store for workflow editor metadata with at least:
- `workflowId`
- `sourceWorkflowId`
- `name`
- `description`
- `status`
- `baseline`
- `isDirty`
- `isHydrating`

Add actions that support:
- hydration from a loaded workflow
- field updates
- graph snapshot dirty checking
- baseline reset after save

Keep it separate from `stores/flow-editor/nodes-store.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/stores/workflow-editor-store.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add stores/workflow-editor/store.ts tests/unit/stores/workflow-editor-store.test.ts
git commit -m "feat: add workflow editor store"
```

### Task 4: Load existing workflows into the builder with a failing integration test

**Files:**
- Modify: `app/[workflow-builder]/page.tsx`
- Modify: `app/[workflow-builder]/components/workflow-builder.tsx`
- Modify: `components/flow/flow-editor.tsx`
- Test: `tests/unit/stores/workflow-editor-store.test.ts`
- Create: `tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

**Step 1: Write the failing test**

Create a test that renders the workflow builder entry point with a `workflowId` and expects:
- loading state while fetching workflow detail
- fetched nodes and edges hydrate into the flow editor
- fetched metadata hydrates into the workflow editor store
- a missing workflow shows an error state instead of an empty editor

Keep the test focused on the builder loading contract, not the full editor UI.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

Expected: FAIL because the builder does not read `workflowId` or hydrate from API data yet.

**Step 3: Write minimal implementation**

Implement builder loading so:
- `app/[workflow-builder]/page.tsx` reads `searchParams.workflowId`
- `WorkflowBuilder` accepts that id
- the builder fetches workflow detail when an id is present
- the flow store loads nodes and edges with `loadSnapshot`
- the workflow editor store hydrates metadata and baseline
- the UI shows loading and missing-workflow states

Do not implement save behavior changes in this task.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/page.tsx app/[workflow-builder]/components/workflow-builder.tsx components/flow/flow-editor.tsx tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx tests/unit/stores/workflow-editor-store.test.ts
git commit -m "feat: load workflows into builder"
```

### Task 5: Lock save intent behavior with failing dialog tests

**Files:**
- Modify: `app/[workflow-builder]/components/save-workflow-dialog.tsx`
- Create: `tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx`

**Step 1: Write the failing tests**

Create tests that cover:
- default primary action is `更新原 workflow` when editing an existing workflow
- update mode sends `PUT /api/workflows/:id`
- save-as-new sends `POST /api/workflows`
- update mode asks for confirmation before submitting
- successful save clears dirty state via store callbacks

Use real form interactions and assert the request destination/method.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx`

Expected: FAIL because the dialog currently only supports create via `POST`.

**Step 3: Write minimal implementation**

Update the save dialog so it:
- reads workflow id and metadata from the workflow editor store
- defaults to update mode when `workflowId` exists
- still supports create mode for brand-new workflows
- provides an explicit save-as-new action
- confirms before updating the original workflow
- resets baseline and editor metadata after successful save
- updates the URL to the new workflow id after save-as-new

Preserve current validation and error handling, but route them through the new save modes.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/save-workflow-dialog.tsx tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx
git commit -m "feat: support workflow update and save as new"
```

### Task 6: Surface loaded workflow metadata in the builder header

**Files:**
- Modify: `app/[workflow-builder]/components/header.tsx`
- Modify: `app/[workflow-builder]/components/workflow-builder.tsx`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

**Step 1: Write the failing test**

Extend builder/header coverage to expect:
- loaded workflow name appears in the header
- loaded workflow status badge matches the stored status
- `未儲存變更` only appears after metadata or graph changes

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

Expected: FAIL because the header still uses hard-coded workflow metadata.

**Step 3: Write minimal implementation**

Connect the header to the workflow editor store so:
- the title is editable but starts from loaded workflow data
- the status badge reflects current metadata
- dirty-state text appears only when appropriate

Avoid adding extra header features not required by this workflow.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/header.tsx app/[workflow-builder]/components/workflow-builder.tsx tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx
git commit -m "feat: bind builder header to workflow state"
```

### Task 7: Run focused regression verification

**Files:**
- Test: `tests/unit/app/dashboard/user-workflow-card.test.tsx`
- Test: `tests/unit/app/api/workflows/workflow-detail-route.test.ts`
- Test: `tests/unit/stores/workflow-editor-store.test.ts`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx`
- Test: `tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx`
- Test: `tests/unit/prisma/seed-demo-workflow.test.ts`
- Test: `tests/unit/lib/prisma-environment.test.ts`
- Test: `tests/unit/package-json/prisma-generate.test.ts`

**Step 1: Run focused tests**

Run:

```bash
pnpm vitest run \
  tests/unit/app/dashboard/user-workflow-card.test.tsx \
  tests/unit/app/api/workflows/workflow-detail-route.test.ts \
  tests/unit/stores/workflow-editor-store.test.ts \
  tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx \
  tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx \
  tests/unit/prisma/seed-demo-workflow.test.ts \
  tests/unit/lib/prisma-environment.test.ts \
  tests/unit/package-json/prisma-generate.test.ts
```

Expected: PASS

**Step 2: Run full test suite**

Run: `pnpm test`

Expected: PASS

**Step 3: Run production build verification**

Run: `DATABASE_URL= pnpm build`

Expected: PASS

**Step 4: Commit**

```bash
git add tests/unit/app/dashboard/user-workflow-card.test.tsx tests/unit/app/api/workflows/workflow-detail-route.test.ts tests/unit/stores/workflow-editor-store.test.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.tsx tests/unit/app/workflow-builder/save-workflow-dialog.test.tsx
git commit -m "chore: verify workflow editing regression coverage"
```

## Verification Log

- 2026-03-31: Ran focused regression coverage with the implemented test set:
  - `pnpm vitest run tests/unit/app/dashboard/user-workflow-card.test.tsx tests/unit/app/api/workflows/workflow-detail-route.test.ts tests/unit/stores/workflow-editor-store.test.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.ts tests/unit/app/workflow-builder/header.test.tsx tests/unit/app/workflow-builder/save-workflow-action.test.ts tests/unit/app/workflow-builder/save-workflow-dialog-state.test.ts tests/unit/prisma/seed-demo-workflow.test.ts tests/unit/lib/prisma-environment.test.ts tests/unit/package-json/prisma-generate.test.ts tests/unit/components/ui/radix-dependencies.test.ts`
  - Result: 11 test files passed, 28 tests passed.
- 2026-03-31: Ran full suite with `pnpm test`.
  - Result: 19 test files passed, 54 tests passed.
- 2026-03-31: Ran production build with `pnpm build`.
  - Result: build succeeded.
