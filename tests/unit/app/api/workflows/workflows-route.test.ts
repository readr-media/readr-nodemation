import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/workflows/route";

const { prisma, getActiveUserId } = vi.hoisted(() => ({
  prisma: {
    workflow: {
      findMany: vi.fn(),
    },
  },
  getActiveUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/active-user", () => ({ getActiveUserId }));

describe("workflows list route", () => {
  beforeEach(() => {
    prisma.workflow.findMany.mockReset();
    getActiveUserId.mockReset();
    getActiveUserId.mockResolvedValue("user-1");
  });

  it("excludes soft-deleted workflows from the list", async () => {
    prisma.workflow.findMany.mockResolvedValueOnce([]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(prisma.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-1", deleted_at: null },
      }),
    );
  });

  it("returns an empty array without querying when there is no active user", async () => {
    getActiveUserId.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(prisma.workflow.findMany).not.toHaveBeenCalled();
  });
});
