# CMS Input Article Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the `從CMS輸入文章` workflow node so its saved schema and settings UI match the approved CMS article input spec.

**Architecture:** Keep the node type as `cmsInput`, but replace its existing `data` contract with the new CMS article input payload. Implement the change from the outside in: first encode the new shape in tests, then update node types, defaults, loader normalization, settings UI, and parser utilities for post selector strings.

**Tech Stack:** Next.js App Router, React, TypeScript, Zustand, Vitest, XYFlow

---

### Task 1: Lock the new `cmsInput` data contract in unit tests

**Files:**
- Modify: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`
- Modify: `tests/unit/prisma/seed-demo-workflow.test.ts`
- Modify: `components/flow/nodes/cms-input-node.tsx`

**Step 1: Write the failing test**

Add assertions that `cmsInput` nodes now use:

```ts
data: {
  title: "從CMS輸入",
  cmsConfigId: expect.any(String),
  cmsName: expect.any(String),
  cmsList: "Posts",
  cmsPostIds: expect.any(String),
  cmsPostSlugs: expect.any(String),
  sourceFields: {
    title: expect.any(Boolean),
    category: expect.any(Boolean),
    content: expect.any(Boolean),
    tags: expect.any(Boolean),
  },
  outputFields: {
    title: "string",
    categories: "array[string]",
    content: "string",
    tags: "array[string]",
  },
  outputFormat: "json",
}
```

Also assert the old `entryId`, `fields`, and `author` fields are absent.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/app/workflow-builder/workflow-builder-loading.test.ts tests/unit/prisma/seed-demo-workflow.test.ts`

Expected: FAIL because the current node data shape still uses `entryId` and `fields`.

**Step 3: Write minimal implementation**

Update the `CmsInputNodeData` type in `components/flow/nodes/cms-input-node.tsx` to the new approved schema so the test target is explicit.

**Step 4: Run test to verify it still fails for the right reason**

Run: `pnpm vitest tests/unit/app/workflow-builder/workflow-builder-loading.test.ts tests/unit/prisma/seed-demo-workflow.test.ts`

Expected: FAIL in defaults or normalization rather than in the type definition.

**Step 5: Commit**

```bash
git add tests/unit/app/workflow-builder/workflow-builder-loading.test.ts tests/unit/prisma/seed-demo-workflow.test.ts components/flow/nodes/cms-input-node.tsx
git commit -m "test: lock cms input article schema"
```

### Task 2: Update new-node defaults and workflow loading for the new schema

**Files:**
- Modify: `stores/flow-editor/slices/cms-node-slice.ts`
- Modify: `app/[workflow-builder]/components/workflow-loader.ts`
- Test: `tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

**Step 1: Write the failing test**

Add or extend tests so a newly created `cmsInput` node and a loaded workflow both normalize to:

```ts
{
  title: "從CMS輸入",
  cmsConfigId: "",
  cmsName: "Readr CMS",
  cmsList: "Posts",
  cmsPostIds: "",
  cmsPostSlugs: "",
  sourceFields: {
    title: true,
    category: false,
    content: true,
    tags: false,
  },
  outputFields: {
    title: "string",
    categories: "array[string]",
    content: "string",
    tags: "array[string]",
  },
  outputFormat: "json",
}
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

Expected: FAIL because `normalizeCmsInputData` and the slice defaults still emit the old fields.

**Step 3: Write minimal implementation**

Update:

- `stores/flow-editor/slices/cms-node-slice.ts` to create the new default data payload
- `app/[workflow-builder]/components/workflow-loader.ts` to normalize incoming `cmsInput` nodes into the new structure

Do not add legacy compatibility beyond safe defaulting for missing new fields.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/app/workflow-builder/workflow-builder-loading.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add stores/flow-editor/slices/cms-node-slice.ts app/[workflow-builder]/components/workflow-loader.ts tests/unit/app/workflow-builder/workflow-builder-loading.test.ts
git commit -m "feat: update cms input node defaults"
```

### Task 3: Replace the settings UI with the approved CMS article input fields

**Files:**
- Modify: `app/[workflow-builder]/components/node-settings/cms-node-setting.tsx`
- Modify: `stores/flow-editor/types.ts`
- Modify: `stores/flow-editor/nodes-store.ts`
- Modify: `stores/flow-editor/slices/cms-node-slice.ts`

**Step 1: Write the failing test**

Add a component test for the CMS settings panel covering:

- visible `來源CMS名稱`
- visible `來源CMS List`
- visible `文章ID`
- visible `文章slug`
- field toggles for `標題`, `分類`, `內文`, `標籤`
- absence of the old `作者` toggle

Suggested test file:

```ts
tests/unit/app/workflow-builder/cms-node-setting.test.tsx
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/app/workflow-builder/cms-node-setting.test.tsx`

Expected: FAIL because the current UI still renders the old generic CMS fields.

**Step 3: Write minimal implementation**

Update the settings component to bind directly to:

- `cmsName`
- `cmsList`
- `cmsPostIds`
- `cmsPostSlugs`
- `sourceFields.title`
- `sourceFields.category`
- `sourceFields.content`
- `sourceFields.tags`

Keep `cmsList` non-editable in this phase if the UI choice is read-only display.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/app/workflow-builder/cms-node-setting.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/node-settings/cms-node-setting.tsx stores/flow-editor/types.ts stores/flow-editor/nodes-store.ts stores/flow-editor/slices/cms-node-slice.ts tests/unit/app/workflow-builder/cms-node-setting.test.tsx
git commit -m "feat: update cms input settings ui"
```

### Task 4: Add utilities for comma lists and numeric range selectors

**Files:**
- Create: `lib/cms-post-selectors.ts`
- Create: `lib/__tests__/cms-post-selectors.test.ts`

**Step 1: Write the failing test**

Add tests for:

```ts
parseCmsPostIds("1,2,3,4,7,8,9")
// ["1", "2", "3", "4", "7", "8", "9"]

parseCmsPostIds("1-4,7-9,11,12,13")
// ["1", "2", "3", "4", "7", "8", "9", "11", "12", "13"]

parseCmsPostSlugs("post-a, post-b,post-c")
// ["post-a", "post-b", "post-c"]
```

Also cover whitespace trimming and duplicate suppression.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest lib/__tests__/cms-post-selectors.test.ts`

Expected: FAIL because the utility file does not exist yet.

**Step 3: Write minimal implementation**

Implement small focused helpers:

- `splitDelimitedValues`
- `parseCmsPostIds`
- `parseCmsPostSlugs`

`parseCmsPostIds` must expand ascending numeric ranges and return normalized string arrays.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest lib/__tests__/cms-post-selectors.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/cms-post-selectors.ts lib/__tests__/cms-post-selectors.test.ts
git commit -m "feat: add cms post selector utilities"
```

### Task 5: Update the demo workflow seed and verify saved config output

**Files:**
- Modify: `prisma/seed.js`
- Modify: `tests/unit/prisma/seed-demo-workflow.test.ts`
- Modify: `tests/unit/app/workflow-builder/save-workflow-action.test.ts`

**Step 1: Write the failing test**

Extend save-path coverage so persisted workflow JSON includes the new `cmsInput.data` payload keys and no old keys.

Assert the seed demo workflow also uses the new structure.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/unit/prisma/seed-demo-workflow.test.ts tests/unit/app/workflow-builder/save-workflow-action.test.ts`

Expected: FAIL because the saved JSON and seeded node still use old field names.

**Step 3: Write minimal implementation**

Update:

- `prisma/seed.js` sample workflow node payload
- any save-path assumptions exposed by tests

Do not change unrelated node schemas.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/unit/prisma/seed-demo-workflow.test.ts tests/unit/app/workflow-builder/save-workflow-action.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add prisma/seed.js tests/unit/prisma/seed-demo-workflow.test.ts tests/unit/app/workflow-builder/save-workflow-action.test.ts
git commit -m "feat: persist cms input article schema"
```

### Task 6: Run focused verification and cleanup

**Files:**
- Modify: `docs/plans/2026-04-15-cms-input-article-schema-design.md` if implementation changed an approved assumption

**Step 1: Run focused test suite**

Run:

```bash
pnpm vitest \
  tests/unit/app/workflow-builder/workflow-builder-loading.test.ts \
  tests/unit/app/workflow-builder/save-workflow-action.test.ts \
  tests/unit/prisma/seed-demo-workflow.test.ts \
  tests/unit/app/workflow-builder/cms-node-setting.test.tsx \
  lib/__tests__/cms-post-selectors.test.ts
```

Expected: PASS

**Step 2: Run lint**

Run: `pnpm lint`

Expected: PASS

**Step 3: Run build if schema or serialization changes touched broader app wiring**

Run: `pnpm build`

Expected: PASS

**Step 4: Update design doc only if needed**

If implementation required a spec-faithful adjustment, document it in:

- `docs/plans/2026-04-15-cms-input-article-schema-design.md`

**Step 5: Commit**

```bash
git add docs/plans/2026-04-15-cms-input-article-schema-design.md
git commit -m "chore: verify cms input article schema update"
```
