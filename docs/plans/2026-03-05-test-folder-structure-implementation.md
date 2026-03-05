# Test Folder Structure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize tests under root `tests/` with clear `unit` and `integration` boundaries, and migrate existing tests to the new layout.

**Architecture:** Keep production code paths unchanged and move tests into a normalized, mirrored tree under `tests/unit/**` and `tests/integration/**`. Add minimal test runner scripts and a short contributor guide so new tests follow one convention. Apply TDD discipline for any behavior-affecting adjustments introduced during migration.

**Tech Stack:** Next.js 16, TypeScript 5, Vitest 4, Biome 2, pnpm.

---

### Task 1: Create Canonical Test Directory Skeleton

**Files:**
- Create: `tests/unit/.gitkeep`
- Create: `tests/unit/app/.gitkeep`
- Create: `tests/unit/components/.gitkeep`
- Create: `tests/unit/stores/.gitkeep`
- Create: `tests/unit/lib/.gitkeep`
- Create: `tests/unit/utils/.gitkeep`
- Create: `tests/integration/.gitkeep`
- Create: `tests/integration/app/.gitkeep`
- Create: `tests/integration/workflows/.gitkeep`
- Create: `tests/fixtures/.gitkeep`
- Create: `tests/helpers/.gitkeep`

**Step 1: Write the failing test**

```ts
// tests/unit/app/workflow-builder/components/module-list-config.test.ts
import { describe, expect, it } from "vitest";
import { moduleGroups } from "@/app/[workflow-builder]/components/module-list-config";

describe("module list config", () => {
  it("keeps only export result in content module group", () => {
    const contentGroup = moduleGroups.find(
      (group) => group.title === "內容整理模組",
    );

    expect(contentGroup).toBeDefined();
    expect(contentGroup?.modules).toHaveLength(1);
    expect(contentGroup?.modules[0]).toMatchObject({
      title: "匯出結果",
      nodeType: "exportResult",
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/unit/app/workflow-builder/components/module-list-config.test.ts`  
Expected: FAIL because file/path does not exist yet.

**Step 3: Write minimal implementation**

- Create the directory skeleton and place the migrated test file at:
  `tests/unit/app/workflow-builder/components/module-list-config.test.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/unit/app/workflow-builder/components/module-list-config.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/
git commit -m "test: add centralized tests directory skeleton"
```

### Task 2: Migrate Existing Colocated Test to Centralized Unit Tree

**Files:**
- Delete: `app/[workflow-builder]/components/module-list-config.test.ts`
- Create: `tests/unit/app/workflow-builder/components/module-list-config.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { moduleGroups } from "@/app/[workflow-builder]/components/module-list-config";

describe("module list config", () => {
  it("does not include report record node in content module group", () => {
    const contentGroup = moduleGroups.find(
      (group) => group.title === "內容整理模組",
    );

    const nodeTypes = contentGroup?.modules.map((item) => item.nodeType);
    expect(nodeTypes).not.toContain("reportRecord");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/unit/app/workflow-builder/components/module-list-config.test.ts`  
Expected: FAIL until the migrated test file is created.

**Step 3: Write minimal implementation**

- Move test content from colocated path to centralized path.
- Keep assertions unchanged unless import path normalization is required.

**Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/unit/app/workflow-builder/components/module-list-config.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add app/[workflow-builder]/components/module-list-config.test.ts tests/unit/app/workflow-builder/components/module-list-config.test.ts
git commit -m "test: migrate module list config test to centralized tree"
```

### Task 3: Add Runner Scripts for Consistent Execution

**Files:**
- Modify: `package.json`

**Step 1: Write the failing test**

Run: `pnpm run test:unit`  
Expected: FAIL with missing script before update.

**Step 2: Run test to verify it fails**

Run: `pnpm run test:integration`  
Expected: FAIL with missing script before update.

**Step 3: Write minimal implementation**

Add scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm run test:unit`  
Expected: PASS (or PASS with no tests if none yet, depending on Vitest config).

Run: `pnpm run test:integration`  
Expected: PASS with no tests (initial state) or PASS for existing integration tests.

**Step 5: Commit**

```bash
git add package.json
git commit -m "chore: add standardized test scripts"
```

### Task 4: Document Test Placement Rules for Contributors

**Files:**
- Create: `tests/README.md`
- Modify: `AGENTS.md` (testing guideline section only, if team wants enforcement there too)

**Step 1: Write the failing test**

Run: `test -f tests/README.md`  
Expected: FAIL before file exists.

**Step 2: Run test to verify it fails**

Run: `rg -n "tests/unit|tests/integration" tests/README.md`  
Expected: FAIL before content exists.

**Step 3: Write minimal implementation**

Create `tests/README.md` with:
- folder responsibilities
- naming convention
- path mapping examples
- command examples (`pnpm run test:unit`, `pnpm run test:integration`)

**Step 4: Run test to verify it passes**

Run: `test -f tests/README.md && rg -n "tests/unit|tests/integration" tests/README.md`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/README.md AGENTS.md
git commit -m "docs: define centralized test folder conventions"
```

### Task 5: Full Verification Gate

**Files:**
- Verify only (no file changes expected)

**Step 1: Write the failing test**

Run: `pnpm exec vitest run app/[workflow-builder]/components/module-list-config.test.ts`  
Expected: FAIL because colocated file should be removed.

**Step 2: Run test to verify it fails**

Run: `pnpm run test:unit`  
Expected: PASS.

**Step 3: Write minimal implementation**

- If failures occur, apply minimal path/script/readme corrections only.

**Step 4: Run test to verify it passes**

Run in order:
- `pnpm run test`
- `pnpm run test:unit`
- `pnpm run test:integration`
- `pnpm lint`
- `pnpm exec next typegen`
- `pnpm exec tsc --noEmit`
- `pnpm build`

Expected: all pass, or known pre-existing failures documented with exact output if unrelated.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: finalize centralized test structure verification"
```
