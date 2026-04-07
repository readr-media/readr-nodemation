import { describe, expect, it, vi } from "vitest";

import { loadWorkflowIntoStores } from "@/app/[workflow-builder]/components/workflow-loader";

describe("loadWorkflowIntoStores", () => {
  it("hydrates the flow and workflow editor stores when a workflow loads successfully", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-123",
          name: "文章自動分類與標記",
          description: "既有流程",
          status: "draft",
          nodes:
            '[{"id":"node-1","type":"cmsInput","position":{"x":0,"y":0},"data":{"label":"從 CMS 輸入"}}]',
          edges: '[{"id":"edge-1","source":"node-1","target":"node-2"}]',
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "workflow-123",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(fetchImpl).toHaveBeenCalledWith("/api/workflows/workflow-123", {
      cache: "no-store",
    });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "node-1",
          type: "cmsInput",
          position: { x: 0, y: 0 },
          data: { label: "從 CMS 輸入" },
        },
      ],
      edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "workflow-123",
      name: "文章自動分類與標記",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "node-1",
          type: "cmsInput",
          position: { x: 0, y: 0 },
          data: { label: "從 CMS 輸入" },
        },
      ],
      edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    });
  });

  it("returns a missing status when the workflow does not exist", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Workflow not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "missing-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "missing" });
    expect(loadSnapshot).not.toHaveBeenCalled();
    expect(hydrateFromWorkflow).not.toHaveBeenCalled();
  });

  it("skips loading when no workflow id is provided", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn();

    const result = await loadWorkflowIntoStores({
      workflowId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "idle" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(loadSnapshot).not.toHaveBeenCalled();
    expect(hydrateFromWorkflow).not.toHaveBeenCalled();
  });
});
