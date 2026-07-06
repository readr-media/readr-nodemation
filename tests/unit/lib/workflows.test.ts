import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    workflow: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
// unstable_noStore is a request-scoped cache opt-out; stub it so the function
// under test can run outside a Next.js request context.
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));

import { getUserWorkflows } from "@/lib/workflows";

describe("getUserWorkflows", () => {
  beforeEach(() => {
    prisma.workflow.findMany.mockReset();
  });

  it("returns an empty list without querying when there is no active user", async () => {
    const result = await getUserWorkflows(null);

    expect(result).toEqual([]);
    expect(prisma.workflow.findMany).not.toHaveBeenCalled();
  });

  it("excludes soft-deleted workflows from the listing", async () => {
    prisma.workflow.findMany.mockResolvedValueOnce([]);

    await getUserWorkflows("user-1");

    expect(prisma.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1", deleted_at: null },
      }),
    );
  });
});
