import fs from "node:fs";
import path from "node:path";
import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { createWorkflowEditorStore } from "@/stores/workflow-editor/store";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "cmsInput",
    position: { x: 0, y: 0 },
    data: { label: "讀取 CMS" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
  },
];

const repoRoot = path.resolve(__dirname, "../../..");
const workflowEditorStorePath = path.join(
  repoRoot,
  "stores/workflow-editor/store.ts",
);

describe("workflow editor store", () => {
  it("hydrates metadata and starts clean", () => {
    const store = createWorkflowEditorStore();

    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    expect(store.getState()).toMatchObject({
      workflowId: "workflow-123",
      sourceWorkflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      isDirty: false,
      isHydrating: false,
      baseline: {
        workflowId: "workflow-123",
        sourceWorkflowId: "workflow-123",
        name: "文章自動分類",
        description: "根據 AI 分類文章",
        status: "draft",
        nodes: initialNodes,
        edges: initialEdges,
      },
    });
  });

  it("becomes dirty when metadata or graph diverges from baseline", () => {
    const store = createWorkflowEditorStore();
    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().setName("新的名稱");
    expect(store.getState().isDirty).toBe(true);

    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().setDescription("新的描述");
    expect(store.getState().isDirty).toBe(true);

    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().setStatus("published");
    expect(store.getState().isDirty).toBe(true);

    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().syncGraphSnapshot({
      nodes: [
        ...initialNodes,
        {
          id: "node-2",
          type: "aiCall",
          position: { x: 120, y: 80 },
          data: { label: "AI 分類" },
        },
      ],
      edges: initialEdges,
    });
    expect(store.getState().isDirty).toBe(true);

    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().syncGraphSnapshot({
      nodes: initialNodes,
      edges: [],
    });
    expect(store.getState().isDirty).toBe(true);
  });

  it("resets the baseline after a successful save", () => {
    const store = createWorkflowEditorStore();
    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().setName("更新後名稱");
    store.getState().syncGraphSnapshot({
      nodes: [
        {
          ...initialNodes[0],
          data: { label: "更新節點" },
        },
      ],
      edges: initialEdges,
    });

    expect(store.getState().isDirty).toBe(true);

    store.getState().resetBaseline({
      workflowId: "workflow-123",
      sourceWorkflowId: "workflow-123",
      nodes: [
        {
          ...initialNodes[0],
          data: { label: "更新節點" },
        },
      ],
      edges: initialEdges,
    });

    expect(store.getState().isDirty).toBe(false);
    expect(store.getState().baseline).toMatchObject({
      workflowId: "workflow-123",
      sourceWorkflowId: "workflow-123",
      name: "更新後名稱",
      nodes: [
        {
          ...initialNodes[0],
          data: { label: "更新節點" },
        },
      ],
      edges: initialEdges,
    });
  });

  it("switches to a new workflow id after save as new", () => {
    const store = createWorkflowEditorStore();
    store.getState().hydrateFromWorkflow({
      workflowId: "workflow-123",
      name: "文章自動分類",
      description: "根據 AI 分類文章",
      status: "draft",
      nodes: initialNodes,
      edges: initialEdges,
    });

    store.getState().setName("另存新流程");
    store.getState().resetBaseline({
      workflowId: "workflow-456",
      sourceWorkflowId: "workflow-456",
      nodes: initialNodes,
      edges: initialEdges,
    });

    expect(store.getState()).toMatchObject({
      workflowId: "workflow-456",
      sourceWorkflowId: "workflow-456",
      name: "另存新流程",
      isDirty: false,
      baseline: {
        workflowId: "workflow-456",
        sourceWorkflowId: "workflow-456",
        name: "另存新流程",
      },
    });
  });

  it("uses cached graph fingerprints instead of serializing in computeIsDirty", () => {
    const source = fs.readFileSync(workflowEditorStorePath, "utf8");
    const computeIsDirtySource = source.slice(
      source.indexOf("const computeIsDirty"),
      source.indexOf("const createWorkflowEditorState"),
    );

    expect(computeIsDirtySource).not.toContain("JSON.stringify");
    expect(computeIsDirtySource).toContain("nodesFingerprint");
    expect(computeIsDirtySource).toContain("edgesFingerprint");
  });
});
