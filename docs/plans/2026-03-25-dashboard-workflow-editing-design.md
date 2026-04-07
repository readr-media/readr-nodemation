# Dashboard Workflow Editing Design

**Date:** 2026-03-25

## Summary

Enable users to click a workflow card on `/dashboard`, open `/workflow-builder` with that workflow loaded into the editor, and save changes either by updating the original workflow or saving a new copy. The default save action should be `更新原 workflow`, while still offering `另存為新 workflow` as the safer secondary path.

## Goals

- Let dashboard users open an existing workflow in the builder.
- Load workflow metadata and React Flow snapshot from the database into the editor.
- Preserve a clear editing source so the builder knows whether it is editing an existing workflow or creating a new one.
- Support two save intents:
  - update the original workflow
  - save the current editor state as a new workflow
- Persist confirmed changes back to the database.

## Non-Goals

- Introducing workflow version tables or revision history.
- Adding collaborative editing.
- Designing a separate draft persistence model.
- Validating every node-specific payload shape at first rollout.

## Current State

- [`app/dashboard/page.tsx`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/app/dashboard/page.tsx) fetches workflow list data and renders cards, but cards are not actionable.
- [`app/dashboard/_components/user-workflow-card.tsx`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/app/dashboard/_components/user-workflow-card.tsx) does not receive workflow id and cannot navigate.
- [`app/[workflow-builder]/page.tsx`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/app/[workflow-builder]/page.tsx) always renders an empty builder with no route-driven loading.
- [`app/[workflow-builder]/components/save-workflow-dialog.tsx`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/app/[workflow-builder]/components/save-workflow-dialog.tsx) only creates workflows with `POST /api/workflows`.
- [`app/api/workflows/route.ts`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/app/api/workflows/route.ts) supports list and create, but not single-workflow read or update.
- Flow graph state already lives in Zustand via [`stores/flow-editor/nodes-store.ts`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/stores/flow-editor/nodes-store.ts).

## Chosen Approach

Use `workflowId` in the builder URL as the source of truth.

- Dashboard cards navigate to `/workflow-builder?workflowId=<id>`.
- The builder reads `workflowId`, fetches the full workflow document, and hydrates the editor state.
- Save UI exposes two explicit intents:
  - primary: `更新原 workflow`
  - secondary: `另存為新 workflow`

This approach avoids carrying full workflow JSON through navigation, survives refreshes, and keeps the builder tied to the latest DB state.

## Alternatives Considered

### Carry workflow JSON through navigation

Pros:
- Fast initial handoff from dashboard to builder.

Cons:
- JSON does not fit cleanly in URL parameters.
- Refresh and shareability become fragile.
- Dashboard list data is not guaranteed to contain the full workflow snapshot.

### Create server-side draft records before editing

Pros:
- Strongest isolation between source workflow and edited state.

Cons:
- Too heavy for current scope.
- Requires extra draft lifecycle, storage, and cleanup rules.

## Data Flow

1. User clicks a workflow card on `/dashboard`.
2. App routes to `/workflow-builder?workflowId=<id>`.
3. Builder loads the workflow document for that id.
4. Builder hydrates:
   - graph state into the flow store
   - metadata into a dedicated editor store
5. User edits nodes, edges, name, description, or status.
6. Dirty state compares current editor data against the initial baseline.
7. On save:
   - `更新原 workflow` sends `PUT /api/workflows/:id`
   - `另存為新 workflow` sends `POST /api/workflows`
8. On success:
   - baseline resets to saved data
   - dirty state clears
   - if saved as new, URL updates to the new workflow id

## State Management

Keep graph state and workflow document state separate.

### Existing store

Continue using [`stores/flow-editor/nodes-store.ts`](/Users/hemalin/work/readr-nodemation/.worktrees/feat/article-auto-classification/stores/flow-editor/nodes-store.ts) for:
- nodes
- edges
- graph interactions

### New editor store

Add a dedicated Zustand store for workflow document metadata:

- `workflowId`
- `sourceWorkflowId`
- `name`
- `description`
- `status`
- `baseline`
- `isDirty`
- `isHydrating`

This keeps graph manipulation isolated from document lifecycle state.

## API Design

Keep Zod validation on every write path.

### Existing route

- `GET /api/workflows`
- `POST /api/workflows`

### New route(s)

- `GET /api/workflows/:id`
- `PUT /api/workflows/:id`

### Validation strategy

Extract reusable Zod schemas for workflow payloads.

First rollout should validate:
- `name`
- `description`
- `status`
- `nodes`
- `edges`

The initial version should validate that nodes and edges are valid JSON arrays or serializable arrays, without trying to fully model every node subtype.

## UX Behavior

### Dashboard

- User workflow cards become clickable.
- Click navigates directly to the builder for that workflow.

### Builder

- If `workflowId` exists, show a loading state until hydration finishes.
- If the workflow is not found, show an error state with a return path to `/dashboard`.
- Surface the current workflow identity in the builder header.
- Show `未儲存變更` only when the editor differs from baseline.

### Save behavior

- Primary action defaults to `更新原 workflow`.
- Secondary action allows `另存為新 workflow`.
- Updating the original workflow should require explicit confirmation.
- Save failure must not discard current editor changes.

## Error Handling

- Invalid `workflowId`: render a friendly not-found state.
- Failed workflow load: show load error and retry/back navigation option.
- Failed update/create request: show a clear error message and preserve current edits.
- Invalid API payload: return `400` with validation details for easier debugging.

## Testing Strategy

### Unit tests

- Dashboard cards include the correct workflow navigation target.
- Workflow detail loading converts stored JSON into editor state correctly.
- Save dialog sends the right request for update vs save-as-new.
- Dirty state flips only when editor data differs from baseline.

### API tests

- `GET /api/workflows/:id` returns the workflow when it exists.
- `GET /api/workflows/:id` returns not found when missing.
- `PUT /api/workflows/:id` updates workflow metadata and snapshot.
- Invalid `PUT` payload returns `400`.
- `POST /api/workflows` still creates a new workflow.

### Regression tests

- Loading an existing workflow hydrates nodes and edges into the builder.
- Updating the original workflow changes the existing DB row.
- Saving as new creates a separate DB row and leaves the source workflow intact.

## Open Implementation Decisions Already Resolved

- Use Zustand for metadata state: yes, but in a separate editor store.
- Use Zod for API validation: yes.
- Default save action: `更新原 workflow`.
- Also support `另存為新 workflow`: yes.
