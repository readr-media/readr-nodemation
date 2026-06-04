import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it, vi } from "vitest";

import { saveWorkflow } from "@/app/[workflow-builder]/components/save-workflow-action";

const nodes: Node[] = [
  {
    id: "node-1",
    type: "cmsInput",
    position: { x: 0, y: 0 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "demo-cms-config",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "3310",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
];

const aiTitleNodes: Node[] = [
  ...nodes,
  {
    id: "node-2",
    type: "aiTitle",
    position: { x: 240, y: 0 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI 文章標題",
      titleStyle: "seo",
      titleTemperature: 0.5,
      titleKeywords: "",
    },
  },
];

const aiClassifierTaggerNodes: Node[] = [
  ...nodes,
  {
    id: "node-2",
    type: "aiClassifierTagger",
    position: { x: 240, y: 0 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI自動分類與標籤",
      inputFields: {
        title: "source.title",
        content: "source.content",
      },
      promptTemplate: "",
      categoryAmount: 1,
      tagAmount: 3,
      responseFormat: {
        type: "json",
        schema: {
          categories: "array[string]",
          tags: "array[string]",
        },
      },
      outputFields: {
        categories: "array[string]",
        tags: "array[string]",
      },
    },
  },
];

const cmsOutputNodes: Node[] = [
  ...aiClassifierTaggerNodes,
  {
    id: "node-3",
    type: "cmsOutput",
    position: { x: 480, y: 0 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "mapping-1",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "mapping-2",
          sourceField: "{{ ai.tags }}",
          targetField: "tags",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
];

const edges: Edge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
  },
];

const cmsOutputEdges: Edge[] = [
  ...edges,
  {
    id: "edge-2",
    source: "node-2",
    target: "node-3",
  },
];

const unscheduledPayload = {
  cronExpression: null,
  nextRunAt: null,
} as const;

type SaveWorkflowRequestBody = {
  name: string;
  description: string;
  status: string;
  nodes: Array<{
    id?: string;
    type: string;
    measured?: { width: number; height: number };
    data?: Record<string, unknown>;
  }>;
  edges: Edge[];
  cron_expression: string | null;
  next_run_at: string | null;
};

const getRequestBodyOrThrow = (fetchImpl: ReturnType<typeof vi.fn>) => {
  const requestInit = fetchImpl.mock.calls[0]?.[1];
  const body = requestInit?.body;
  if (typeof body !== "string") {
    throw new Error("Expected fetch request body to be a JSON string");
  }
  return JSON.parse(body) as SaveWorkflowRequestBody;
};

const getNodeDataOrThrow = (
  requestBody: SaveWorkflowRequestBody,
  index: number,
) => {
  const node = requestBody.nodes[index];
  if (!node?.data) {
    throw new Error(`Expected node data at index ${index}`);
  }
  return node.data;
};

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
      ...unscheduledPayload,
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
        cron_expression: null,
        next_run_at: null,
      }),
    });
    const requestBody = getRequestBodyOrThrow(fetchImpl);
    const firstNodeData = getNodeDataOrThrow(requestBody, 0);

    expect(firstNodeData).toMatchObject({
      title: "從CMS輸入",
      cmsConfigId: expect.any(String),
      cmsName: expect.any(String),
      cmsList: "Posts",
      cmsPostIds: expect.any(String),
      cmsPostSlugs: expect.any(String),
      sourceFields: {
        title: expect.any(Boolean),
        category: expect.any(Boolean),
        content: expect.any(Boolean),
        tags: expect.any(Boolean),
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    });

    expect(firstNodeData).not.toHaveProperty("source");
    expect(firstNodeData).not.toHaveProperty("entryId");
    expect(firstNodeData).not.toHaveProperty("fields");
    expect(firstNodeData).not.toHaveProperty("author");
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
      ...unscheduledPayload,
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
        cron_expression: null,
        next_run_at: null,
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

  it("persists aiTitle nodes with the approved schema in the request body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-aiTitle",
          name: "AI 文章標題流程",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const resetBaseline = vi.fn();

    await saveWorkflow({
      mode: "update",
      workflowId: "workflow-aiTitle",
      name: "AI 文章標題流程",
      description: "含 aiTitle 節點",
      status: "draft",
      nodes: aiTitleNodes,
      edges,
      ...unscheduledPayload,
      fetchImpl,
      resetBaseline,
    });

    const requestBody = getRequestBodyOrThrow(fetchImpl);
    const aiTitleData = getNodeDataOrThrow(requestBody, 1);

    expect(requestBody.nodes[1]).toMatchObject({
      id: "node-2",
      type: "aiTitle",
      measured: { width: 240, height: 62 },
    });
    expect(aiTitleData).toMatchObject({
      title: "AI 文章標題",
      titleStyle: "seo",
      titleTemperature: 0.5,
      titleKeywords: "",
    });
    expect(aiTitleData).not.toHaveProperty("model");
    expect(aiTitleData).not.toHaveProperty("inputs");
    expect(aiTitleData).not.toHaveProperty("cmsField");
  });

  it("persists aiClassifierTagger nodes with the approved schema in the request body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-789",
          name: "AI 自動分類與標籤流程",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const resetBaseline = vi.fn();

    await saveWorkflow({
      mode: "update",
      workflowId: "workflow-789",
      name: "AI 自動分類與標籤流程",
      description: "含 aiClassifierTagger 節點",
      status: "draft",
      nodes: aiClassifierTaggerNodes,
      edges,
      ...unscheduledPayload,
      fetchImpl,
      resetBaseline,
    });

    const requestBody = getRequestBodyOrThrow(fetchImpl);
    const aiClassifierData = getNodeDataOrThrow(requestBody, 1);

    expect(requestBody.nodes[1]).toMatchObject({
      id: "node-2",
      type: "aiClassifierTagger",
      measured: { width: 240, height: 62 },
    });
    expect(aiClassifierData).toMatchObject({
      title: "AI自動分類與標籤",
      inputFields: {
        title: "source.title",
        content: "source.content",
      },
      promptTemplate: "",
      categoryAmount: 1,
      tagAmount: 3,
      responseFormat: {
        type: "json",
        schema: {
          categories: "array[string]",
          tags: "array[string]",
        },
      },
      outputFields: {
        categories: "array[string]",
        tags: "array[string]",
      },
    });
  });

  it("persists cmsOutput nodes with the approved schema in the request body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-999",
          name: "CMS 輸出流程",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    const resetBaseline = vi.fn();

    await saveWorkflow({
      mode: "update",
      workflowId: "workflow-999",
      name: "CMS 輸出流程",
      description: "含 cmsOutput 節點",
      status: "draft",
      nodes: cmsOutputNodes,
      edges: cmsOutputEdges,
      ...unscheduledPayload,
      fetchImpl,
      resetBaseline,
    });

    const requestBody = getRequestBodyOrThrow(fetchImpl);
    const cmsOutputData = getNodeDataOrThrow(requestBody, 2);

    expect(requestBody.nodes[2]).toMatchObject({
      id: "node-3",
      type: "cmsOutput",
      measured: { width: 240, height: 62 },
    });
    expect(cmsOutputData).toMatchObject({
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "mapping-1",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "mapping-2",
          sourceField: "{{ ai.tags }}",
          targetField: "tags",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    });
    expect(cmsOutputData).not.toHaveProperty("cmsLocation");
    expect(cmsOutputData).not.toHaveProperty("articleIdOrSlug");
  });
});
