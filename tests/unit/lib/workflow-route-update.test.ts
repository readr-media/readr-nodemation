import { describe, expect, it, vi } from "vitest";
import {
  PatchWorkflowSchema,
  PutWorkflowSchema,
} from "@/lib/workflow-api-payload";
import { handleWorkflowUpdate } from "@/lib/workflow-route-update";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    workflow: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

describe("handleWorkflowUpdate", () => {
  it("updates a workflow from a valid PUT payload", async () => {
    prisma.workflow.updateMany.mockResolvedValueOnce({ count: 1 });

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
      "user-1",
    );

    expect(prisma.workflow.updateMany).toHaveBeenCalledWith({
      where: { id: "wf-1", user_id: "user-1" },
      data: {
        name: "Updated workflow",
        description: null,
        nodes: "[]",
        edges: "[]",
        status: "draft",
        cron_expression: null,
        updated_at: expect.any(Date),
      },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ count: 1 });
  });

  it("returns the persisted status and timestamps after a successful update", async () => {
    prisma.workflow.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.workflow.findFirst.mockResolvedValueOnce({
      status: "published",
      updated_at: new Date("2026-06-10T03:00:00.000Z"),
      last_run_at: null,
    });

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated workflow",
          nodes: [],
          edges: [],
          status: "published",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PutWorkflowSchema,
      "put",
      "user-1",
    );

    expect(prisma.workflow.findFirst).toHaveBeenCalledWith({
      where: { id: "wf-1", user_id: "user-1" },
      select: { status: true, updated_at: true, last_run_at: true },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      count: 1,
      status: "published",
      updated_at: "2026-06-10T03:00:00.000Z",
      last_run_at: null,
    });
  });

  it("updates a workflow from a valid PATCH payload", async () => {
    prisma.workflow.updateMany.mockResolvedValueOnce({ count: 1 });

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed",
          status: "published",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
      "user-1",
    );

    expect(prisma.workflow.updateMany).toHaveBeenCalledWith({
      where: { id: "wf-1", user_id: "user-1" },
      data: {
        name: "Renamed",
        status: "published",
        updated_at: expect.any(Date),
      },
    });
    expect(response.status).toBe(200);
  });

  it("returns 400 when request JSON is malformed", async () => {
    prisma.workflow.updateMany.mockClear();

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
      "user-1",
    );

    expect(prisma.workflow.updateMany).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
    });
  });

  it("returns 400 when schema validation fails", async () => {
    prisma.workflow.updateMany.mockClear();

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Only name" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PutWorkflowSchema,
      "put",
      "user-1",
    );

    expect(prisma.workflow.updateMany).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
      details: expect.any(Object),
    });
  });

  it("returns 404 when workflow is missing or not owned", async () => {
    prisma.workflow.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
      "user-1",
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });

  it("returns 500 when Prisma updateMany throws unexpectedly", async () => {
    prisma.workflow.updateMany.mockRejectedValueOnce(new Error("boom"));

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
      "user-1",
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Failed to update workflow",
    });
  });
});
