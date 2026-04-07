import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  PatchWorkflowSchema,
  PutWorkflowSchema,
} from "@/lib/workflow-api-payload";
import { handleWorkflowUpdate } from "@/lib/workflow-route-update";

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

  it("updates a workflow from a valid PATCH payload", async () => {
    prisma.workflow.update.mockResolvedValueOnce({ id: "wf-1" });

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
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        name: "Renamed",
        status: "published",
      },
    });
    expect(response.status).toBe(200);
  });

  it("returns 400 when request JSON is malformed", async () => {
    prisma.workflow.update.mockClear();

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
    );

    expect(prisma.workflow.update).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
    });
  });

  it("returns 400 when schema validation fails", async () => {
    prisma.workflow.update.mockClear();

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Only name" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PutWorkflowSchema,
      "put",
    );

    expect(prisma.workflow.update).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
      details: expect.any(Object),
    });
  });

  it("returns 404 when Prisma raises P2025", async () => {
    prisma.workflow.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Workflow not found", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });

  it("returns 500 when Prisma update throws unexpectedly", async () => {
    prisma.workflow.update.mockRejectedValueOnce(new Error("boom"));

    const response = await handleWorkflowUpdate(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed" }),
        headers: { "Content-Type": "application/json" },
      }),
      Promise.resolve({ id: "wf-1" }),
      PatchWorkflowSchema,
      "patch",
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Failed to update workflow",
    });
  });
});
