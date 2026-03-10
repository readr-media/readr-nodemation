# Build Fix For Generated GraphQL TS Check Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unblock `pnpm build` by excluding problematic generated GraphQL file(s) from strict TypeScript checks when no GraphQL documents are present.

**Architecture:** Apply the smallest possible TypeScript config exclusion in `tsconfig.json`, starting from `graphql/__generated__/gql.ts`. Re-run strict checks and build to confirm this removes the blocking error without touching runtime code paths or codegen behavior.

**Tech Stack:** TypeScript 5, Next.js 16, GraphQL Codegen, pnpm.

---

### Task 1: Add Narrow TS Exclusion For Generated gql.ts

**Files:**
- Modify: `tsconfig.json`

**Step 1: Write the failing test**

Run: `pnpm exec tsc --noEmit`  
Expected: FAIL on `graphql/__generated__/gql.ts` with implicit `any[]` for `documents`.

**Step 2: Run test to verify it fails**

Run: `pnpm build`  
Expected: FAIL at TypeScript stage with the same generated file error.

**Step 3: Write minimal implementation**

In `tsconfig.json`, add a targeted exclusion:

```json
{
  "exclude": ["node_modules", "graphql/__generated__/gql.ts"]
}
```

If `exclude` already exists, append only this path and keep existing entries intact.

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsc --noEmit`  
Expected: PASS for this specific generated-file blocker.

Run: `pnpm build`  
Expected: No failure caused by `graphql/__generated__/gql.ts`.

**Step 5: Commit**

```bash
git add tsconfig.json
git commit -m "chore: exclude generated gql types from strict ts checks"
```

### Task 2: Verify Scope Minimization And Regression Safety

**Files:**
- Verify only (no file changes expected)

**Step 1: Write the failing test**

Run: `rg -n "graphql/__generated__/gql.ts|graphql/__generated__" tsconfig.json`  
Expected: exactly the intended narrow exclusion path, not broad directory exclusion unless strictly needed.

**Step 2: Run test to verify it fails**

Run: `pnpm lint`  
Expected: PASS or unrelated known failures documented with exact output.

**Step 3: Write minimal implementation**

- If lint or config formatting fails, apply minimal formatting-only fix.
- Do not broaden exclusion unless `tsc` still fails on other generated files.

**Step 4: Run test to verify it passes**

Run:
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `pnpm lint`

Expected: all pass, or remaining failures clearly documented as unrelated pre-existing blockers.

**Step 5: Commit**

```bash
git add tsconfig.json
git commit -m "chore: verify build unblocks with minimal generated ts exclusion"
```
