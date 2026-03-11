import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { DELETE, PATCH, PUT } from "@/app/api/workflows/[id]/route";

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

  it("updates a workflow with a complete payload via PUT", async () => {
    prisma.workflow.update.mockResolvedValueOnce({
      id: "wf-1",
      name: "Updated workflow",
      description: "Updated description",
      nodes: '[{"id":"n1"}]',
      edges: "[]",
      status: "published",
      cron_expression: "0 8 * * *",
      next_run_at: new Date("2026-03-11T08:00:00.000Z"),
      last_run_at: null,
    });

    const response = await PUT(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated workflow",
          description: "Updated description",
          nodes: [{ id: "n1" }],
          edges: [],
          status: "published",
          cron_expression: "0 8 * * *",
          next_run_at: "2026-03-11T08:00:00.000Z",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        name: "Updated workflow",
        description: "Updated description",
        nodes: '[{"id":"n1"}]',
        edges: "[]",
        status: "published",
        cron_expression: "0 8 * * *",
        next_run_at: new Date("2026-03-11T08:00:00.000Z"),
        last_run_at: null,
      },
    });
    expect(response.status).toBe(200);
  });

  it("rejects PUT when required workflow fields are missing", async () => {
    const response = await PUT(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({ name: "Only name" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
    });
  });

  it("clears omitted nullable fields via PUT full replacement", async () => {
    prisma.workflow.update.mockResolvedValueOnce({
      id: "wf-1",
    });

    const response = await PUT(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated workflow",
          nodes: [{ id: "n1" }],
          edges: [],
          status: "published",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        name: "Updated workflow",
        description: null,
        nodes: '[{"id":"n1"}]',
        edges: "[]",
        status: "published",
        cron_expression: null,
        next_run_at: null,
        last_run_at: null,
      },
    });
    expect(response.status).toBe(200);
  });

  it("returns 400 when PUT body is malformed JSON", async () => {
    const response = await PUT(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PUT",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
    });
  });

  it("updates only provided workflow fields via PATCH", async () => {
    prisma.workflow.update.mockResolvedValueOnce({
      id: "wf-1",
      name: "Renamed",
      description: "Existing description",
      nodes: "[]",
      edges: "[]",
      status: "draft",
      cron_expression: null,
      next_run_at: null,
      last_run_at: null,
    });

    const response = await PATCH(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed",
          status: "draft",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        name: "Renamed",
        status: "draft",
      },
    });
    expect(response.status).toBe(200);
  });

  it("rejects PATCH when no updatable fields are provided", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid payload",
    });
  });

  it("serializes array and object workflow fields consistently for updates", async () => {
    prisma.workflow.update.mockResolvedValueOnce({ id: "wf-1" });

    await PATCH(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({
          nodes: [{ id: "n1" }],
          edges: [{ id: "e1", source: "n1", target: "n2" }],
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(prisma.workflow.update).toHaveBeenCalledWith({
      where: { id: "wf-1" },
      data: {
        nodes: '[{"id":"n1"}]',
        edges: '[{"id":"e1","source":"n1","target":"n2"}]',
      },
    });
  });
});
