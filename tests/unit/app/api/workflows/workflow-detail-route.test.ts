import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  workflow: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

const repoRoot = path.resolve(__dirname, "../../../../..");
const workflowDetailRoutePath = path.join(
  repoRoot,
  "app/api/workflows/[id]/route.ts",
);

describe("workflow detail route", () => {
  beforeEach(() => {
    prismaMock.workflow.findUnique.mockReset();
    prismaMock.workflow.update.mockReset();
  });

  it("returns a workflow when it exists", async () => {
    const workflow = {
      id: "workflow-123",
      name: "既有流程",
      description: "說明",
      status: "draft",
      nodes: '[{"id":"node-1"}]',
      edges: "[]",
    };
    prismaMock.workflow.findUnique.mockResolvedValue(workflow);

    const { GET } = await import("@/app/api/workflows/[id]/route");
    const response = await GET(new Request("http://localhost/api/workflows/workflow-123"), {
      params: Promise.resolve({ id: "workflow-123" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(workflow);
    expect(prismaMock.workflow.findUnique).toHaveBeenCalledWith({
      where: { id: "workflow-123" },
    });
  });

  it("returns 404 when the workflow is missing", async () => {
    prismaMock.workflow.findUnique.mockResolvedValue(null);

    const { GET } = await import("@/app/api/workflows/[id]/route");
    const response = await GET(new Request("http://localhost/api/workflows/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Workflow not found",
    });
  });

  it("uses Response.json consistently instead of importing NextResponse", () => {
    const source = fs.readFileSync(workflowDetailRoutePath, "utf8");

    expect(source).not.toContain('from "next/server"');
    expect(source).not.toContain("NextResponse.json");
  });

  it("rejects invalid update payloads with 400", async () => {
    const { PUT } = await import("@/app/api/workflows/[id]/route");
    const response = await PUT(
      new Request("http://localhost/api/workflows/workflow-123", {
        method: "PUT",
        body: JSON.stringify({
          name: "",
          status: "draft",
          nodes: [],
          edges: [],
        }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "workflow-123" }) },
    );

    expect(response.status).toBe(400);
    expect(prismaMock.workflow.update).not.toHaveBeenCalled();
  });

  it("updates the targeted workflow when the payload is valid", async () => {
    const updatedWorkflow = {
      id: "workflow-123",
      name: "更新後流程",
      description: "更新後說明",
      status: "published",
      nodes: '[{"id":"node-2"}]',
      edges: '[{"id":"edge-1"}]',
      cron_expression: "0 9 * * *",
      next_run_at: new Date("2026-03-26T09:00:00.000Z"),
      last_run_at: new Date("2026-03-25T09:00:00.000Z"),
    };
    prismaMock.workflow.update.mockResolvedValue(updatedWorkflow);

    const { PUT } = await import("@/app/api/workflows/[id]/route");
    const response = await PUT(
      new Request("http://localhost/api/workflows/workflow-123", {
        method: "PUT",
        body: JSON.stringify({
          name: "更新後流程",
          description: "更新後說明",
          status: "published",
          nodes: [{ id: "node-2" }],
          edges: [{ id: "edge-1" }],
          cron_expression: "0 9 * * *",
          next_run_at: "2026-03-26T09:00:00.000Z",
          last_run_at: "2026-03-25T09:00:00.000Z",
        }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "workflow-123" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ...updatedWorkflow,
      next_run_at: "2026-03-26T09:00:00.000Z",
      last_run_at: "2026-03-25T09:00:00.000Z",
    });
    expect(prismaMock.workflow.update).toHaveBeenCalledWith({
      where: { id: "workflow-123" },
      data: {
        name: "更新後流程",
        description: "更新後說明",
        status: "published",
        nodes: '[{"id":"node-2"}]',
        edges: '[{"id":"edge-1"}]',
        cron_expression: "0 9 * * *",
        next_run_at: new Date("2026-03-26T09:00:00.000Z"),
        last_run_at: new Date("2026-03-25T09:00:00.000Z"),
      },
    });
  });

  it("does not clear scheduling metadata when omitted from a put payload", async () => {
    prismaMock.workflow.update.mockResolvedValue({
      id: "workflow-123",
      name: "更新後流程",
      description: "更新後說明",
      status: "published",
      nodes: '[{"id":"node-2"}]',
      edges: '[{"id":"edge-1"}]',
      cron_expression: "0 9 * * *",
      next_run_at: new Date("2026-03-26T09:00:00.000Z"),
      last_run_at: new Date("2026-03-25T09:00:00.000Z"),
    });

    const { PUT } = await import("@/app/api/workflows/[id]/route");
    const response = await PUT(
      new Request("http://localhost/api/workflows/workflow-123", {
        method: "PUT",
        body: JSON.stringify({
          name: "更新後流程",
          description: "更新後說明",
          status: "published",
          nodes: [{ id: "node-2" }],
          edges: [{ id: "edge-1" }],
          cron_expression: "0 9 * * *",
        }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "workflow-123" }) },
    );

    expect(response.status).toBe(200);
    expect(prismaMock.workflow.update).toHaveBeenCalledWith({
      where: { id: "workflow-123" },
      data: {
        name: "更新後流程",
        description: "更新後說明",
        status: "published",
        nodes: '[{"id":"node-2"}]',
        edges: '[{"id":"edge-1"}]',
        cron_expression: "0 9 * * *",
      },
    });
  });
});
