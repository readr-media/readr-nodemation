# Workflow Route Review Follow-ups Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve the valid workflow route review issue by extracting shared PUT/PATCH update handling, while locking down disputed review comments with regression tests so the Next 16 API contract and current payload semantics do not regress.

**Architecture:** Keep the public route behavior unchanged: dynamic route `params` stay promise-based for Next 16, and PATCH continues to reject `null` for `next_run_at` and `last_run_at` unless product requirements explicitly change. Drive the refactor with tests first by adding focused integration coverage for these contracts, then extract the duplicated PUT/PATCH logic into a small server-only helper and cover that helper with targeted unit tests. Follow Vercel's Next.js guidance for async API routes by preserving async request handling without introducing extra waterfalls or unnecessary abstractions.

**Tech Stack:** Next.js 16 App Router Route Handlers, TypeScript 5, Prisma 6, Zod 3, Vitest 4, pnpm.

---

### Task 1: Add Regression Tests for the Disputed Review Comments

**Files:**
- Modify: `tests/integration/app/api/workflows/[id]/route.test.ts`

**Step 1: Write the failing test for promised route params**

Add a focused test that proves the handlers must await `params`:

```ts
it("awaits promised route params before issuing a PUT update", async () => {
  let resolveParams: ((value: { id: string }) => void) | undefined;
  const params = new Promise<{ id: string }>((resolve) => {
    resolveParams = resolve;
  });

  prisma.workflow.update.mockResolvedValueOnce({ id: "wf-async" });

  const responsePromise = PUT(
    new Request("http://localhost/api/workflows/wf-async", {
      method: "PUT",
      body: JSON.stringify({
        name: "Updated workflow",
        nodes: [],
        edges: [],
        status: "draft",
      }),
      headers: { "Content-Type": "application/json" },
    }),
    { params },
  );

  expect(prisma.workflow.update).not.toHaveBeenCalled();

  resolveParams?.({ id: "wf-async" });

  const response = await responsePromise;

  expect(prisma.workflow.update).toHaveBeenCalledWith({
    where: { id: "wf-async" },
    data: {
      name: "Updated workflow",
      description: null,
      nodes: "[]",
      edges: "[]",
      status: "draft",
      cron_expression: null,
      next_run_at: null,
      last_run_at: null,
    },
  });
  expect(response.status).toBe(200);
});
```

This test should fail if someone changes the handler to treat `params` as a plain object.

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/integration/app/api/workflows/[id]/route.test.ts -t "awaits promised route params before issuing a PUT update"`
Expected: FAIL if the test is written before any supporting changes for the refactor branch. If it passes immediately, tighten the assertion so it proves Prisma is not called before the params promise resolves.

**Step 3: Write the failing tests for PATCH null date rejection**

Add two focused tests that codify the current API contract:

```ts
it("rejects PATCH when next_run_at is null", async () => {
  const response = await PATCH(
    new Request("http://localhost/api/workflows/wf-1", {
      method: "PATCH",
      body: JSON.stringify({ next_run_at: null }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id: "wf-1" }) },
  );

  expect(prisma.workflow.update).not.toHaveBeenCalled();
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Invalid payload",
  });
});

it("rejects PATCH when last_run_at is null", async () => {
  const response = await PATCH(
    new Request("http://localhost/api/workflows/wf-1", {
      method: "PATCH",
      body: JSON.stringify({ last_run_at: null }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id: "wf-1" }) },
  );

  expect(prisma.workflow.update).not.toHaveBeenCalled();
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Invalid payload",
  });
});
```

These tests make the current schema behavior explicit and prevent future accidental acceptance of `null` without a coordinated product change.

**Step 4: Run the new tests to verify they fail for the right reason**

Run: `pnpm exec vitest run tests/integration/app/api/workflows/[id]/route.test.ts -t "rejects PATCH when"`
Expected: FAIL only if the current coverage is missing the assertions. If they pass immediately, keep them and move on; they still serve as the regression guard required by this plan.

**Step 5: Run the full route integration file**

Run: `pnpm exec vitest run tests/integration/app/api/workflows/[id]/route.test.ts`
Expected: PASS. This confirms the new tests describe existing intended behavior before the refactor starts.

**Step 6: Commit**

```bash
git add tests/integration/app/api/workflows/[id]/route.test.ts
git commit -m "test: lock workflow route review regressions"
```

### Task 2: Add Unit Tests for a Shared Workflow Update Handler Helper

**Files:**
- Create: `tests/unit/lib/workflow-route-update.test.ts`
- Create: `lib/workflow-route-update.ts`

**Step 1: Write the failing unit test for the PUT success path**

Create `tests/unit/lib/workflow-route-update.test.ts` and start with a minimal test for the new helper:

```ts
import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { handleWorkflowUpdate } from "@/lib/workflow-route-update";
import { PutWorkflowSchema } from "@/lib/workflow-api-payload";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    workflow: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

describe("handleWorkflowUpdate", () => {
  it("updates a workflow from a valid PUT payload", async () => {
    prisma.workflow.update.mockResolvedValueOnce({ id: "wf-1" });

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated workflow",
          nodes: [],
          edges: [],
          status: "draft",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PutWorkflowSchema,
      "put",
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        name: "Updated workflow",
        description: null,
        nodes: "[]",
        edges: "[]",
        status: "draft",
        cron_expression: null,
        next_run_at: null,
        last_run_at: null,
      },
    });
    expect(response.status).toBe(200);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/workflow-route-update.test.ts -t "updates a workflow from a valid PUT payload"`
Expected: FAIL because `lib/workflow-route-update.ts` does not exist yet.

**Step 3: Add failing tests for all helper branches**

Expand the unit test file with these cases before writing the helper:

- `updates a workflow from a valid PATCH payload`
- `returns 400 when request JSON is malformed`
- `returns 400 when schema validation fails`
- `returns 404 when Prisma raises P2025`
- `returns 500 when Prisma update throws unexpectedly`

Use the real `PutWorkflowSchema` and `PatchWorkflowSchema` in tests. Keep the assertions specific:

- malformed JSON should assert `{ error: "Invalid payload" }`
- schema failure should assert `details` exists
- `P2025` should assert `{ error: "Workflow not found" }`
- unexpected failure should assert `{ error: "Failed to update workflow" }`

**Step 4: Run the unit test file again to verify red**

Run: `pnpm exec vitest run tests/unit/lib/workflow-route-update.test.ts`
Expected: FAIL with missing helper export or unimplemented behavior.

**Step 5: Write the minimal helper implementation**

Create `lib/workflow-route-update.ts` with a server-only helper similar to:

```ts
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildWorkflowUpdateData,
  PatchWorkflowSchema,
  PutWorkflowSchema,
} from "@/lib/workflow-api-payload";

type WorkflowUpdateSchema = typeof PutWorkflowSchema | typeof PatchWorkflowSchema;

export async function handleWorkflowUpdate(
  request: Request,
  params: Promise<{ id: string }>,
  schema: WorkflowUpdateSchema,
  mode: "put" | "patch",
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const workflow = await prisma.workflow.update({
      where: { id },
      data: buildWorkflowUpdateData(parsed.data, mode),
    });

    return Response.json(workflow);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ error: "Workflow not found" }, { status: 404 });
    }

    return Response.json(
      { error: "Failed to update workflow" },
      { status: 500 },
    );
  }
}
```

Notes:

- Keep direct imports; do not introduce a barrel file.
- Keep the helper server-only and narrow in scope.
- Preserve promise-based `params` typing for Next 16.

**Step 6: Run the unit tests to verify green**

Run: `pnpm exec vitest run tests/unit/lib/workflow-route-update.test.ts`
Expected: PASS.

**Step 7: Commit**

```bash
git add tests/unit/lib/workflow-route-update.test.ts lib/workflow-route-update.ts
git commit -m "test: add shared workflow update helper coverage"
```

### Task 3: Refactor PUT and PATCH to Use the Shared Helper

**Files:**
- Modify: `app/api/workflows/[id]/route.ts`
- Modify: `tests/integration/app/api/workflows/[id]/route.test.ts`

**Step 1: Write the failing integration test that proves behavior survives the refactor**

Add one more end-to-end behavior check that spans the helper boundary and guards both validation and update data generation in a single PATCH request:

```ts
it("preserves PATCH error payload details after the shared-handler refactor", async () => {
  const response = await PATCH(
    new Request("http://localhost/api/workflows/wf-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "not-a-valid-status" }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id: "wf-1" }) },
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Invalid payload",
    details: expect.any(Object),
  });
});
```

This catches accidental loss of `details` or mismatched schema wiring while the route delegates to the helper.

**Step 2: Run that test to verify it fails before the route file changes**

Run: `pnpm exec vitest run tests/integration/app/api/workflows/[id]/route.test.ts -t "preserves PATCH error payload details after the shared-handler refactor"`
Expected: If it passes immediately, keep it and continue. The important requirement is that the test exists before the route refactor and remains green after the refactor.

**Step 3: Refactor the route handlers to delegate**

Update `app/api/workflows/[id]/route.ts` so that:

- `DELETE` stays unchanged
- `PUT` becomes a thin wrapper around `handleWorkflowUpdate(request, params, PutWorkflowSchema, "put")`
- `PATCH` becomes a thin wrapper around `handleWorkflowUpdate(request, params, PatchWorkflowSchema, "patch")`

The resulting shape should be close to:

```ts
import { handleWorkflowUpdate } from "@/lib/workflow-route-update";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleWorkflowUpdate(request, params, PutWorkflowSchema, "put");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleWorkflowUpdate(request, params, PatchWorkflowSchema, "patch");
}
```

Do not change public responses, status codes, or params typing in this refactor.

**Step 4: Run the focused integration test**

Run: `pnpm exec vitest run tests/integration/app/api/workflows/[id]/route.test.ts -t "preserves PATCH error payload details after the shared-handler refactor"`
Expected: PASS.

**Step 5: Run the full affected test suites**

Run: `pnpm exec vitest run tests/unit/lib/workflow-route-update.test.ts tests/integration/app/api/workflows/[id]/route.test.ts`
Expected: PASS.

**Step 6: Run the broader workflow-related integration suite**

Run: `pnpm exec vitest run tests/integration/app/api/workflows`
Expected: PASS.

**Step 7: Run lint on the touched files**

Run: `pnpm exec biome check app/api/workflows/[id]/route.ts lib/workflow-route-update.ts tests/integration/app/api/workflows/[id]/route.test.ts tests/unit/lib/workflow-route-update.test.ts`
Expected: PASS with no errors.

**Step 8: Commit**

```bash
git add app/api/workflows/[id]/route.ts lib/workflow-route-update.ts tests/integration/app/api/workflows/[id]/route.test.ts tests/unit/lib/workflow-route-update.test.ts
git commit -m "refactor: share workflow update route handling"
```

### Task 4: Final Verification and Review Readiness

**Files:**
- Review only: `app/api/workflows/[id]/route.ts`
- Review only: `lib/workflow-route-update.ts`
- Review only: `lib/workflow-api-payload.ts`
- Review only: `tests/integration/app/api/workflows/[id]/route.test.ts`
- Review only: `tests/unit/lib/workflow-route-update.test.ts`

**Step 1: Verify the final contract against the review comments**

Check these outcomes explicitly:

- `params` remains `Promise<{ id: string }>` and is awaited
- PATCH still rejects `null` datetime fields with `400`
- PUT/PATCH duplication has been reduced to thin wrappers plus one helper
- Response payloads and statuses match the pre-refactor behavior

**Step 2: Run the final verification commands**

Run: `pnpm exec vitest run tests/unit/lib/workflow-route-update.test.ts tests/integration/app/api/workflows/[id]/route.test.ts`
Expected: PASS.

Run: `pnpm exec biome check app/api/workflows/[id]/route.ts lib/workflow-route-update.ts tests/integration/app/api/workflows/[id]/route.test.ts tests/unit/lib/workflow-route-update.test.ts`
Expected: PASS.

**Step 3: Prepare the review summary**

Summarize the result in terms of the three review threads:

- duplicated PUT/PATCH logic: fixed by shared helper
- promise-based params: preserved and covered by regression test because Next 16 requires async params
- PATCH null datetime concern: clarified by tests that current schema rejects `null`

**Step 4: Commit**

```bash
git status --short
git log --oneline -3
```

Expected: only the planned commits are present and the worktree is clean or only contains unrelated user changes.
