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

  it("returns 404 when PUT updates a workflow that does not exist", async () => {
    prisma.workflow.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Workflow not found", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await PUT(
      new Request("http://localhost/api/workflows/missing", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated workflow",
          nodes: [{ id: "n1" }],
          edges: [],
          status: "published",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });

  it("returns 500 when PUT update fails unexpectedly", async () => {
    prisma.workflow.update.mockRejectedValueOnce(new Error("boom"));

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

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Failed to update workflow",
    });
  });

  it("awaits promised route params before issuing a PUT update", async () => {
    prisma.workflow.update.mockClear();

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

    await Promise.resolve();
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

  it("rejects PATCH when next_run_at is null", async () => {
    prisma.workflow.update.mockClear();

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
    prisma.workflow.update.mockClear();

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

  it("returns 404 when PATCH updates a workflow that does not exist", async () => {
    prisma.workflow.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Workflow not found", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await PATCH(
      new Request("http://localhost/api/workflows/missing", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "Workflow not found",
    });
  });

  it("returns 500 when PATCH update fails unexpectedly", async () => {
    prisma.workflow.update.mockRejectedValueOnce(new Error("boom"));

    const response = await PATCH(
      new Request("http://localhost/api/workflows/wf-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "wf-1" }) },
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      error: "Failed to update workflow",
    });
  });

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
