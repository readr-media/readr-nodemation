import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/workflows/[id]/route";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    workflow: {
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

describe("workflow resource route", () => {
  it("returns 404 when deleting a workflow that does not exist", async () => {
    prisma.workflow.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Workflow not found", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await DELETE(
      new Request("http://localhost/api/workflows/missing", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });

  it("returns 200 with deleted workflow id when deletion succeeds", async () => {
    prisma.workflow.delete.mockResolvedValueOnce({ id: "wf-1" });

    const response = await DELETE(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(prisma.workflow.delete).toHaveBeenCalledWith({
      where: { id: "wf-1" },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "wf-1",
    });
  });
});
