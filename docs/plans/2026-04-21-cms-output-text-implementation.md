# CMS Output Text Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將現有 `cmsOutput` node 升級成新版「輸出文字到CMS」schema 與設定面，並讓 loader、save path、seed、tests 全部對齊。

**Architecture:** 保留 `type: "cmsOutput"`，但直接替換 `CmsOutputNodeData` 結構與預設值。UI 不再讓使用者自由編輯 mapping rows，而是用 checkbox 決定是否產生 `categories` / `tags` 的固定 mappings；loader 負責把舊 schema 轉成新格式。

**Tech Stack:** Next.js App Router, React, Zustand, XYFlow, Vitest, Prisma seed script

---

### Task 1: Replace cmsOutput defaults with the new schema

**Files:**
- Modify: `components/flow/nodes/cms-output-node.tsx`
- Modify: `stores/flow-editor/slices/cms-output-node-slice.ts`
- Modify: `stores/flow-editor/types.ts` if needed
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

**Step 1: Write the failing test**

Add a new test for creating fresh `cmsOutput` nodes with defaults:

```ts
expect(createdNode).toMatchObject({
  type: "cmsOutput",
  data: {
    title: "輸出文字到CMS",
    cmsConfigId: "",
    cmsName: "Readr CMS",
    cmsList: "Posts",
    cmsPostIds: "",
    cmsPostSlugs: "",
    mappings: [],
    mode: "overwrite",
    postStatus: "draft",
  },
});
```

Also assert `measured: { width: 240, height: 62 }` if the node factory owns it.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.ts -t "creates new cmsOutput nodes with the approved defaults" --exclude '.worktrees/**'`

Expected: FAIL because current `cmsOutput` defaults still use `cmsLocation`, `articleIdOrSlug`, and a default mapping row.

**Step 3: Write minimal implementation**

Update `CmsOutputNodeData` and the `createCmsOutputNode()` defaults to the new schema. Remove old fields from the type and default node data.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add components/flow/nodes/cms-output-node.tsx stores/flow-editor/slices/cms-output-node-slice.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.ts
git commit -m "feat: update cms output node defaults"
```

### Task 2: Normalize legacy cmsOutput payloads into the new schema

**Files:**
- Modify: `app/[workflow-builder]/components/workflow-loader.ts`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

**Step 1: Write the failing test**

Add a loader test with a legacy node payload:

```json
{
  "id": "cmsOutput-node",
  "type": "cmsOutput",
  "data": {
    "label": "CMS 輸出",
    "cmsLocation": "demo-cms",
    "articleIdOrSlug": "3310",
    "mappings": [
      { "sourceField": "{{ ai.tags }}", "targetField": "tags" }
    ],
    "mode": "overwrite"
  }
}
```

Assert it normalizes to:

- `title: "CMS 輸出"` or new default title if no label/title
- `cmsConfigId: ""`
- `cmsName: "Readr CMS"`
- `cmsList: "Posts"`
- `cmsPostIds: ""`
- `cmsPostSlugs: ""`
- preserved `mappings`
- `mode`
- `postStatus: "draft"`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/workflow-builder-loading.test.ts -t "normalizes cmsOutput workflow nodes into the new schema" --exclude '.worktrees/**'`

Expected: FAIL because loader still returns old `cmsOutput` shape.

**Step 3: Write minimal implementation**

Update `normalizeCmsOutputData()` so it returns the new contract and maps legacy fields into approved defaults.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/workflow-loader.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.ts
git commit -m "feat: normalize cms output text schema"
```

### Task 3: Replace the settings panel with the checkbox-driven UI

**Files:**
- Modify: `app/[workflow-builder]/components/node-settings/cms-output-node-setting.tsx`
- Test: `tests/unit/app/workflow-builder/cms-output-node-setting.test.tsx` or create it if missing

**Step 1: Write the failing test**

Add settings tests that verify:

- heading is `輸出文字到 CMS 設定`
- `cmsName` renders as disabled `Readr CMS`
- `cmsList` renders as disabled `Posts`
- `分類` and `標籤` checkboxes are interactive
- other target fields are rendered disabled
- `Draft` / `Published` radio options render

**Step 2: Run test to verify it fails**

Run the focused cms-output settings test file only.

Expected: FAIL because current UI still shows freeform location/article/mapping fields.

**Step 3: Write minimal implementation**

Replace the old UI with:

- disabled CMS name field
- disabled CMS list field
- checkbox group for target fields
- radio group for `postStatus`
- node-level `mode`

Do not display freeform mapping rows or article id/slug fields.

**Step 4: Run test to verify it passes**

Run the same focused test.

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/node-settings/cms-output-node-setting.tsx tests/unit/app/workflow-builder/cms-output-node-setting.test.tsx
git commit -m "feat: redesign cms output settings"
```

### Task 4: Generate mappings from checkbox state

**Files:**
- Modify: `app/[workflow-builder]/components/node-settings/cms-output-node-setting.tsx`
- Test: `tests/unit/app/workflow-builder/cms-output-node-setting.test.tsx`

**Step 1: Write the failing test**

Add focused tests for one behavior at a time:

```ts
test("checking categories creates the ai.categories mapping")
test("checking tags creates the ai.tags mapping")
test("unchecking a selected field removes its mapping")
test("disabled fields do not create mappings")
```

Assert exact mapping payloads:

```ts
{
  sourceField: "{{ ai.categories }}",
  targetField: "categories",
}
```

and

```ts
{
  sourceField: "{{ ai.tags }}",
  targetField: "tags",
}
```

**Step 2: Run test to verify it fails**

Run only the new cms-output settings mapping tests.

Expected: FAIL because the new UI is not yet deriving mappings from checkbox state.

**Step 3: Write minimal implementation**

Implement checkbox handlers that derive `data.mappings` from selected fields. Keep only `categories` and `tags` active this round. Disabled options must not change mappings.

**Step 4: Run test to verify it passes**

Run the same tests.

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/node-settings/cms-output-node-setting.tsx tests/unit/app/workflow-builder/cms-output-node-setting.test.tsx
git commit -m "feat: map cms output fields from selections"
```

### Task 5: Cover save path with the new cmsOutput schema

**Files:**
- Modify: `tests/unit/app/workflow-builder/save-workflow-action.test.ts`

**Step 1: Write the failing test**

Add a test that saves a workflow containing the new `cmsOutput` node and asserts the request body contains:

```ts
{
  type: "cmsOutput",
  data: {
    title: "輸出文字到CMS",
    cmsConfigId: "",
    cmsName: "Readr CMS",
    cmsList: "Posts",
    cmsPostIds: "",
    cmsPostSlugs: "",
    mappings: [
      {
        sourceField: "{{ ai.categories }}",
        targetField: "categories",
      },
    ],
    mode: "overwrite",
    postStatus: "draft",
  },
}
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/app/workflow-builder/save-workflow-action.test.ts -t "persists cmsOutput nodes with the approved schema" --exclude '.worktrees/**'`

Expected: FAIL because the current save-path fixture still uses the old `cmsOutput` shape.

**Step 3: Write minimal implementation**

If save logic itself needs no change, update the test fixtures only. Do not change production code unless the test proves it is necessary.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/app/workflow-builder/save-workflow-action.test.ts
git commit -m "test: cover cms output text save schema"
```

### Task 6: Update the demo workflow seed

**Files:**
- Modify: `prisma/seed.js`
- Modify: `tests/unit/prisma/seed-demo-workflow.test.ts`

**Step 1: Write the failing test**

Change seed expectations so the demo workflow’s `cmsOutput` node must match the new schema and include:

- `cmsConfigId`
- `cmsName`
- `cmsList`
- `cmsPostIds`
- `cmsPostSlugs`
- `mappings`
- `mode`
- `postStatus`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/prisma/seed-demo-workflow.test.ts --exclude '.worktrees/**'`

Expected: FAIL because the seed still uses `cmsLocation` / `articleIdOrSlug`.

**Step 3: Write minimal implementation**

Update only the demo `cmsOutput` seed node to the approved contract.

**Step 4: Run test to verify it passes**

Run the same command.

Expected: PASS

**Step 5: Commit**

```bash
git add prisma/seed.js tests/unit/prisma/seed-demo-workflow.test.ts
git commit -m "feat: update demo cms output schema"
```

### Task 7: Run focused regression verification

**Files:**
- No production file changes expected

**Step 1: Run focused tests**

Run:

```bash
pnpm vitest run \
  tests/unit/app/workflow-builder/workflow-builder-loading.test.ts \
  tests/unit/app/workflow-builder/cms-output-node-setting.test.tsx \
  tests/unit/app/workflow-builder/save-workflow-action.test.ts \
  tests/unit/prisma/seed-demo-workflow.test.ts \
  tests/unit/app/workflow-builder/ai-classifier-tagger-node-setting.test.tsx \
  tests/unit/app/workflow-builder/cms-node-setting.test.tsx \
  --exclude '.worktrees/**'
```

Expected: PASS

**Step 2: Run lint**

Run: `pnpm lint`

Expected: PASS

**Step 3: Commit only if verification required follow-up fixes**

Do not create a no-op commit.

### Task 8: Prepare the branch for review

**Files:**
- No code changes required unless verification finds issues

**Step 1: Inspect git status**

Run: `git status --short`

Expected: clean working tree

**Step 2: Summarize verification**

Capture:

- exact tests run
- lint result
- any known unrelated issues

**Step 3: Push and open PR when requested**

Do not push automatically unless the user asks.
