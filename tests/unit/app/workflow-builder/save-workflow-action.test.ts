import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it, vi } from "vitest";

import { saveWorkflow } from "@/app/[workflow-builder]/components/save-workflow-action";

const nodes: Node[] = [
  {
    id: "node-1",
    type: "cmsInput",
    position: { x: 0, y: 0 },
    data: { label: "從 CMS 輸入" },
  },
];

const edges: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
  },
];

describe("saveWorkflow", () => {
  it("updates the original workflow with PUT and resets the baseline to the same id", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-123",
          name: "更新後流程",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const resetBaseline = vi.fn();

    const result = await saveWorkflow({
      mode: "update",
      workflowId: "workflow-123",
      name: "更新後流程",
      description: "更新後說明",
      status: "published",
      nodes,
      edges,
      fetchImpl,
      resetBaseline,
    });

    expect(fetchImpl).toHaveBeenCalledWith("/api/workflows/workflow-123", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "更新後流程",
        description: "更新後說明",
        status: "published",
        nodes,
        edges,
      }),
    });
    expect(resetBaseline).toHaveBeenCalledWith({
      workflowId: "workflow-123",
      sourceWorkflowId: "workflow-123",
      nodes,
      edges,
    });
    expect(result).toEqual({
      workflowId: "workflow-123",
      sourceWorkflowId: "workflow-123",
    });
  });

  it("saves as new with POST and resets the baseline to the created workflow id", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-456",
          name: "另存新流程",
        }),
        {
          status: 201,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const resetBaseline = vi.fn();

    const result = await saveWorkflow({
      mode: "save-as-new",
      workflowId: "workflow-123",
      name: "另存新流程",
      description: "另存說明",
      status: "draft",
      nodes,
      edges,
      fetchImpl,
      resetBaseline,
    });

    expect(fetchImpl).toHaveBeenCalledWith("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "另存新流程",
        description: "另存說明",
        status: "draft",
        nodes,
        edges,
      }),
    });
    expect(resetBaseline).toHaveBeenCalledWith({
      workflowId: "workflow-456",
      sourceWorkflowId: "workflow-456",
      nodes,
      edges,
    });
    expect(result).toEqual({
      workflowId: "workflow-456",
      sourceWorkflowId: "workflow-456",
    });
  });
});
