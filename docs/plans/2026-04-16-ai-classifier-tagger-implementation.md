# AI Classifier Tagger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增一個獨立的 `aiClassifierTagger` workflow node，支援建立、載入、編輯、保存符合規格書的「AI自動分類與標籤」資料。

**Architecture:** 以既有 `aiCall` 為參考，但不共用資料契約。新增專用 node component、zustand slice、settings component 與 loader normalization，並把 module list、flow editor、seed workflow 接上新 `type`。所有步驟都採嚴格 TDD：先寫 failing test，再寫最小實作。

**Tech Stack:** Next.js App Router, React, Zustand, XYFlow, Vitest, Testing Library, Prisma seed script

---

### Task 1: Define aiClassifierTagger store defaults

**Files:**
- Create: `components/flow/nodes/ai-classifier-tagger-node.tsx`
- Create: `stores/flow-editor/slices/ai-classifier-tagger-node-slice.ts`
- Modify: `stores/flow-editor/types.ts`
- Modify: `stores/flow-editor/nodes-store.ts`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

**Step 1: Write the failing test**

Add a new test beside the existing node-default tests that creates a store with the new slice and asserts:

```ts
expect(createdNode).toMatchObject({
  type: "aiClassifierTagger",
  data: {
    title: "AI自動分類與標籤",
    model: "gemini-1.5-flash",
    inputFields: {
      title: "source.title",
      content: "source.content",
    },
    categoryAmount: 1,
    tagAmount: 3,
    responseFormat: {
      type: "json",
      schema: {
        categories: "array[string]",
        tags: "array[string]",
      },
    },
    outputFields: {
      categories: "array[string]",
      tags: "array[string]",
    },
  },
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.ts -t "creates new aiClassifierTagger nodes with the approved defaults"`

Expected: FAIL because the new slice and node type do not exist yet.

**Step 3: Write minimal implementation**

Implement:

- `AiClassifierTaggerNodeData` type and node component file
- `createAiClassifierTaggerNodeData()`
- `createAiClassifierTaggerNode()`
- zustand slice methods:
  - `addAiClassifierTaggerNode()`
  - `updateAiClassifierTaggerNodeData()`
- register the slice in `nodes-store.ts`
- extend `NodesStore` types

Use the exact schema from the design doc. Do not add extra fields.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/app/workflow-builder/workflow-builder-loading.test.ts components/flow/nodes/ai-classifier-tagger-node.tsx stores/flow-editor/slices/ai-classifier-tagger-node-slice.ts stores/flow-editor/types.ts stores/flow-editor/nodes-store.ts
git commit -m "feat: add ai classifier tagger node defaults"
```

### Task 2: Normalize aiClassifierTagger in workflow loading

**Files:**
- Modify: `app/[workflow-builder]/components/workflow-loader.ts`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

**Step 1: Write the failing test**

Add a test that loads a workflow with:

```json
{
  "id": "aiClassifierTagger-node",
  "type": "aiClassifierTagger",
  "data": {
    "label": "舊標籤器",
    "model": "gemini-1.5-pro"
  }
}
```

Assert the hydrated node becomes:

- `type: "aiClassifierTagger"`
- `title: "舊標籤器"` if present, otherwise default title
- missing fields filled from defaults
- `responseFormat` and `outputFields` present and complete

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.ts -t "normalizes aiClassifierTagger workflow nodes before hydrating the stores"`

Expected: FAIL because loader does not recognize `aiClassifierTagger`.

**Step 3: Write minimal implementation**

In `workflow-loader.ts`:

- add `normalizeAiClassifierTaggerData()`
- reuse `createAiClassifierTaggerNodeData()` defaults
- handle `node.type === "aiClassifierTagger"` in `normalizeNode`

Only normalize documented fields.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/workflow-loader.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.ts
git commit -m "feat: normalize ai classifier tagger nodes"
```

### Task 3: Register the new node in the canvas and module list

**Files:**
- Modify: `components/flow/flow-editor.tsx`
- Modify: `app/[workflow-builder]/components/module-list-config.ts`
- Modify: `app/[workflow-builder]/components/module-list.tsx`
- Test: `tests/unit/stores/workflow-editor-store.test.ts`

**Step 1: Write the failing test**

Add a focused test that verifies the module config includes both:

- `aiCall`
- `aiClassifierTagger`

and that invoking the new add action inserts a node with `type: "aiClassifierTagger"`.

If an existing test file is a poor fit, create a dedicated test next to module list code instead of overloading unrelated store tests.

**Step 2: Run test to verify it fails**

Run the new targeted test file only.

Expected: FAIL because the module list config and click handling do not yet support the new node.

**Step 3: Write minimal implementation**

Implement:

- `flow-editor.tsx` nodeTypes registration
- module list config card for `AI自動分類與標籤`
- module list click handler calling `addAiClassifierTaggerNode()`

Keep `aiCall` behavior unchanged.

**Step 4: Run test to verify it passes**

Run the same targeted test.

Expected: PASS

**Step 5: Commit**

```bash
git add components/flow/flow-editor.tsx app/[workflow-builder]/components/module-list-config.ts app/[workflow-builder]/components/module-list.tsx
git add [new-or-updated test file]
git commit -m "feat: add ai classifier tagger module entry"
```

### Task 4: Add the dedicated settings panel

**Files:**
- Create: `app/[workflow-builder]/components/node-settings/ai-classifier-tagger-node-setting.tsx`
- Modify: `app/[workflow-builder]/components/node-setting-sidebar.tsx`
- Test: `tests/unit/app/workflow-builder/ai-classifier-tagger-node-setting.test.tsx`

**Step 1: Write the failing test**

Create a settings test that renders the new component with sample data and verifies:

- heading shows `AI自動分類與標籤設定`
- model select renders current model
- title/content mapping inputs render `source.title` / `source.content`
- category/tag amount inputs render `1` / `3`
- editing those fields calls `updateAiClassifierTaggerNodeData`
- `responseFormat` and `outputFields` are not editable UI controls

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/ai-classifier-tagger-node-setting.test.tsx`

Expected: FAIL because the component and sidebar case do not exist.

**Step 3: Write minimal implementation**

Implement a dedicated settings component with only:

- 模型版本
- 標題欄位 mapping
- 內文欄位 mapping
- Prompt 模板
- 產生分類數量
- 產生標籤數量

Wire the sidebar to render it for `selectedNode.type === "aiClassifierTagger"`.

Do not add UI for `responseFormat` or `outputFields`.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/node-settings/ai-classifier-tagger-node-setting.tsx app/[workflow-builder]/components/node-setting-sidebar.tsx tests/unit/app/workflow-builder/ai-classifier-tagger-node-setting.test.tsx
git commit -m "feat: add ai classifier tagger settings"
```

### Task 5: Update the demo workflow seed

**Files:**
- Modify: `prisma/seed.js`
- Modify: `tests/unit/prisma/seed-demo-workflow.test.ts`

**Step 1: Write the failing test**

Change the seed test expectations so the demo article classification workflow asserts:

- node types are `cmsInput`, `aiClassifierTagger`, `cmsOutput`
- ai node id is `aiClassifierTagger-node`
- ai node data matches the approved schema

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/prisma/seed-demo-workflow.test.ts`

Expected: FAIL because the seed still uses `aiCall`.

**Step 3: Write minimal implementation**

Update `prisma/seed.js` demo workflow nodes and edges to use:

- `id: "aiClassifierTagger-node"`
- `type: "aiClassifierTagger"`
- approved `data` shape

Do not change unrelated seed entries.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add prisma/seed.js tests/unit/prisma/seed-demo-workflow.test.ts
git commit -m "feat: update demo workflow to use ai classifier tagger"
```

### Task 6: Run focused regression verification

**Files:**
- No production file changes expected

**Step 1: Run the focused suite**

Run:

```bash
pnpm vitest run \
  tests/unit/app/workflow-builder/workflow-builder-loading.test.ts \
  tests/unit/app/workflow-builder/ai-classifier-tagger-node-setting.test.tsx \
  tests/unit/prisma/seed-demo-workflow.test.ts \
  tests/unit/app/workflow-builder/cms-node-setting.test.tsx
```

Expected: PASS

**Step 2: Run lint**

Run: `pnpm lint`

Expected: PASS

**Step 3: Commit verification-only changes if needed**

Only commit if you had to adjust tests or formatting during verification.

### Task 7: Prepare the branch for review

**Files:**
- No code changes required unless verification finds issues

**Step 1: Inspect git status**

Run: `git status --short`

Expected: clean working tree

**Step 2: Summarize verification**

Capture:

- exact tests run
- lint result
- any known unrelated build issues

**Step 3: Push and open PR when requested**

Do not push automatically unless the user asks.
