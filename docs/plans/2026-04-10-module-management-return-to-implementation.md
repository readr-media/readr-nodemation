# Module Management Return-To Back Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the module-management back button’s `document.referrer` logic with a safe `returnTo` query-parameter flow that returns users to an in-app path when provided, and otherwise falls back to `/`.

**Architecture:** Treat the return destination as explicit route state instead of inferred browser state. First add a pure helper that validates a `returnTo` value and cover it with TDD. Then update the module-management header to read `returnTo` from the current URL and push the validated destination or `/`. Finally, update the known in-app entry point to include `returnTo` so the back button has a deterministic same-app destination.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, Biome, pnpm

---

### Task 1: Add a pure `returnTo` validation helper with TDD

**Files:**
- Create: `app/module-management/_components/return-to.ts`
- Create: `tests/unit/app/module-management/return-to.test.ts`

**Step 1: Write the failing test file first**

Create `tests/unit/app/module-management/return-to.test.ts` with these tests:

```ts
import { describe, expect, it } from "vitest";

import { getSafeReturnTo } from "@/app/module-management/_components/return-to";

describe("getSafeReturnTo", () => {
  it("returns a valid in-site relative path", () => {
    expect(getSafeReturnTo("/dashboard")).toBe("/dashboard");
  });

  it("returns / for an empty value", () => {
    expect(getSafeReturnTo("")).toBe("/");
  });

  it("returns / when the value is missing", () => {
    expect(getSafeReturnTo(null)).toBe("/");
  });

  it("returns / for an absolute external URL", () => {
    expect(getSafeReturnTo("https://example.com")).toBe("/");
  });

  it("returns / for a protocol-relative URL", () => {
    expect(getSafeReturnTo("//example.com")).toBe("/");
  });

  it("returns / for a non-path string", () => {
    expect(getSafeReturnTo("dashboard")).toBe("/");
  });
});
```

**Step 2: Run the focused test and watch it fail**

Run:

```bash
pnpm exec vitest run tests/unit/app/module-management/return-to.test.ts
```

Expected result:

- FAIL because `return-to.ts` does not exist yet.

**Step 3: Write the minimal helper implementation**

Create `app/module-management/_components/return-to.ts` with:

```ts
export const getSafeReturnTo = (value: string | null): string => {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
};
```

**Step 4: Re-run the focused test and verify green**

Run:

```bash
pnpm exec vitest run tests/unit/app/module-management/return-to.test.ts
```

Expected result:

- PASS for all helper tests.

### Task 2: Add header behavior tests for the `returnTo` flow

**Files:**
- Modify: `tests/unit/app/module-management/header.test.tsx`
- Read: `app/module-management/_components/header.tsx`

**Step 1: Replace the current referrer-based expectations with `returnTo`-based expectations**

Edit `tests/unit/app/module-management/header.test.tsx` so the tests assert:

- `returnTo=/dashboard` causes the button click to call `router.push("/dashboard")`
- missing `returnTo` causes the button click to call `router.push("/")`
- unsafe `returnTo=https://example.com` causes the button click to call `router.push("/")`

The test should no longer expect `router.back()` at all.

**Step 2: Run the focused header test and watch it fail**

Run:

```bash
pnpm exec vitest run tests/unit/app/module-management/header.test.tsx
```

Expected result:

- FAIL because the current production header still uses `document.referrer` and `router.back()`.

**Step 3: Keep the test scope tight**

If the existing test file contains referrer-specific helpers or state, simplify them so the file only supports the new `returnTo` cases. Remove test-only complexity that no longer serves the new behavior.

**Step 4: Re-run the test to confirm the failure is still due to missing production changes**

Run:

```bash
pnpm exec vitest run tests/unit/app/module-management/header.test.tsx
```

Expected result:

- FAIL for the expected `returnTo` behavior mismatch.

### Task 3: Update the module-management header to use `returnTo`

**Files:**
- Modify: `app/module-management/_components/header.tsx`
- Read: `app/module-management/_components/return-to.ts`

**Step 1: Remove the referrer-based helper usage**

In `app/module-management/_components/header.tsx`, stop importing `getBackNavigationAction`.

Add:

```tsx
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeReturnTo } from "./return-to";
```

**Step 2: Replace the click handler with `returnTo` logic**

Use the current search params inside the client component:

```tsx
const router = useRouter();
const searchParams = useSearchParams();
```

Replace the handler body with:

```tsx
const handleBackClick = () => {
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
  router.push(returnTo);
};
```

Keep the button styling and `aria-label` unchanged.

**Step 3: Run the focused tests and verify green**

Run:

```bash
pnpm exec vitest run tests/unit/app/module-management/return-to.test.ts
pnpm exec vitest run tests/unit/app/module-management/header.test.tsx
```

Expected result:

- PASS for the helper tests.
- PASS for the updated header tests.

### Task 4: Update the known in-app entry point and verify lint

**Files:**
- Modify: `app/page.tsx`
- Read: `app/module-management/_components/header.tsx`

**Step 1: Update the current in-app entry link**

Change the home-page entry from:

```tsx
<Link href="/module-management">module-management</Link>
```

to:

```tsx
<Link href="/module-management?returnTo=/">module-management</Link>
```

**Step 2: Run lint for the finished implementation**

Run:

```bash
pnpm lint
```

Expected result:

- Biome passes with no diagnostics.

**Step 3: Review the final diff for scope control**

Run:

```bash
git diff -- app/module-management/_components/header.tsx app/module-management/_components/return-to.ts app/page.tsx tests/unit/app/module-management/return-to.test.ts tests/unit/app/module-management/header.test.tsx
```

Expected result:

- The diff is limited to the `returnTo` helper, the header behavior, the known entry link, and tests.
- No remaining `document.referrer` decision logic exists in the module-management header.
