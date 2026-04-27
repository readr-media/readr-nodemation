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

const aiClassifierTaggerNodes: Node[] = [
  ...nodes,
  {
    id: "node-2",
    type: "aiClassifierTagger",
    position: { x: 240, y: 0 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI自動分類與標籤",
      model: "gemini-1.5-flash",
      inputFields: {
        title: "source.title",
        content: "source.content",
      },
      promptTemplate:
        '你是一個新聞編輯助理，請根據文章內容產出分類與標籤。\n\n請嚴格依照以下 JSON 格式輸出，且不要加入任何說明文字：\n\n{\n  "categories": ["string"],\n  "tags": ["string"]\n}\n\n文章標題：{{title}}\n文章內文：{{content}}\n\n請產出 {{categoryAmount}} 個分類與 {{tagAmount}} 個標籤。',
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
    const requestBody = JSON.parse(
      fetchImpl.mock.calls[0]?.[1]?.body as string,
    ) as {
      nodes: Array<{
        type: string;
        data?: Record<string, unknown>;
      }>;
    };
    expect(requestBody.nodes[0].data).toMatchObject({
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
    expect(requestBody.nodes[0].data).not.toHaveProperty("source");
    expect(requestBody.nodes[0].data).not.toHaveProperty("entryId");
    expect(requestBody.nodes[0].data).not.toHaveProperty("fields");
    expect(requestBody.nodes[0].data).not.toHaveProperty("author");
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

  it("persists aiClassifierTagger nodes with the approved schema in the request body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "workflow-789",
          name: "AI 自動分類流程",
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
      name: "AI 自動分類流程",
      description: "含 aiClassifierTagger 節點",
      status: "draft",
      nodes: aiClassifierTaggerNodes,
      edges,
      fetchImpl,
      resetBaseline,
    });

    const requestBody = JSON.parse(
      fetchImpl.mock.calls[0]?.[1]?.body as string,
    ) as {
      nodes: Array<{
        id: string;
        type: string;
        measured?: { width: number; height: number };
        data?: Record<string, unknown>;
      }>;
    };

    expect(requestBody.nodes[1]).toMatchObject({
      id: "node-2",
      type: "aiClassifierTagger",
      measured: { width: 240, height: 62 },
      data: {
        title: "AI自動分類與標籤",
        model: "gemini-1.5-flash",
        inputFields: {
          title: "source.title",
          content: "source.content",
        },
        promptTemplate:
          '你是一個新聞編輯助理，請根據文章內容產出分類與標籤。\n\n請嚴格依照以下 JSON 格式輸出，且不要加入任何說明文字：\n\n{\n  "categories": ["string"],\n  "tags": ["string"]\n}\n\n文章標題：{{title}}\n文章內文：{{content}}\n\n請產出 {{categoryAmount}} 個分類與 {{tagAmount}} 個標籤。',
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
      fetchImpl,
      resetBaseline,
    });

    const requestBody = JSON.parse(
      fetchImpl.mock.calls[0]?.[1]?.body as string,
    ) as {
      nodes: Array<{
        id: string;
        type: string;
        measured?: { width: number; height: number };
        data?: Record<string, unknown>;
      }>;
    };

    expect(requestBody.nodes[2]).toMatchObject({
      id: "node-3",
      type: "cmsOutput",
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
    });
    expect(requestBody.nodes[2].data).not.toHaveProperty("cmsLocation");
    expect(requestBody.nodes[2].data).not.toHaveProperty("articleIdOrSlug");
  });
});
