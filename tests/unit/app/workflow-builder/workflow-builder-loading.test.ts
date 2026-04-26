import { describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";

import { loadWorkflowIntoStores } from "@/app/[workflow-builder]/components/workflow-loader";
import { createAiClassifierTaggerNodeSlice } from "@/stores/flow-editor/slices/ai-classifier-tagger-node-slice";
import { createCmsNodeSlice } from "@/stores/flow-editor/slices/cms-node-slice";
import { createCmsOutputNodeSlice } from "@/stores/flow-editor/slices/cms-output-node-slice";
import type { NodesStore } from "@/stores/flow-editor/types";

const legacyFileNamePattern = `\${workflow_name}_\${date}.json`;
const approvedAiClassifierTaggerPromptTemplate = `你是一個新聞編輯助理，請根據文章內容產出分類與標籤。\n\n請嚴格依照以下 JSON 格式輸出，且不要加入任何說明文字：\n\n{\n  "categories": ["string"],\n  "tags": ["string"]\n}\n\n文章標題：{{title}}\n文章內文：{{content}}\n\n請產出 {{categoryAmount}} 個分類與 {{tagAmount}} 個標籤。`;

describe("loadWorkflowIntoStores", () => {
  it("normalizes legacy workflow nodes before hydrating the stores", async () => {
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
          data: {
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
          },
        },
      ],
      edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    });
    const firstLoadedNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(firstLoadedNode.data).not.toHaveProperty("entryId");
    expect(firstLoadedNode.data).not.toHaveProperty("fields");
    expect(firstLoadedNode.data).not.toHaveProperty("author");
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
          data: {
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
          },
        },
      ],
      edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    });
  });

  it("creates new cmsInput nodes with the approved defaults", () => {
    const store = createStore<NodesStore>()((set, get, api) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      ...createCmsNodeSlice(set, get, api),
    }));

    store.getState().addCmsNode();

    const [createdNode] = store.getState().nodes;

    expect(createdNode).toMatchObject({
      type: "cmsInput",
      data: {
        title: "從CMS輸入",
        cmsConfigId: "",
        cmsName: "Readr CMS",
        cmsList: "Posts",
        cmsPostIds: "",
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
    });
    expect(store.getState().selectedNodeId).toBe(createdNode.id);
  });

  it("creates new aiClassifierTagger nodes with the approved defaults", () => {
    const store = createStore<NodesStore>()((set, get, api) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      ...createAiClassifierTaggerNodeSlice(set, get, api),
    }));

    store.getState().addAiClassifierTaggerNode();

    const [createdNode] = store.getState().nodes;

    expect(createdNode).toMatchObject({
      type: "aiClassifierTagger",
      data: {
        title: "AI自動分類與標籤",
        model: "gemini-1.5-flash",
        inputFields: {
          title: "source.title",
          content: "source.content",
        },
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
    expect(store.getState().selectedNodeId).toBe(createdNode.id);
  });

  it("creates new cmsOutput nodes with the approved defaults", () => {
    const store = createStore<NodesStore>()((set, get, api) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      ...createCmsOutputNodeSlice(set, get, api),
    }));

    store.getState().addCmsOutputNode();

    const [createdNode] = store.getState().nodes;

    expect(createdNode).toMatchObject({
      type: "cmsOutput",
      measured: {
        width: 240,
        height: 62,
      },
      data: {
        title: "輸出文字到CMS",
        cmsConfigId: "",
        cmsName: "Readr CMS",
        cmsList: "Posts",
        cmsPostIds: "",
        cmsPostSlugs: "",
        mappings: [],
        mode: "overwrite",
        postStatus: "draft",
      },
    });
    expect(store.getState().selectedNodeId).toBe(createdNode.id);
  });

  it("normalizes cmsOutput workflow nodes into the new schema", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "cms-output-workflow",
          name: "CMS 輸出流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "cmsOutput-node",
              type: "cmsOutput",
              position: { x: 640, y: 160 },
              data: {
                label: "CMS 輸出",
                cmsLocation: "demo-cms",
                articleIdOrSlug: "3310",
                mappings: [
                  {
                    sourceField: "{{ ai.tags }}",
                    targetField: "tags",
                  },
                ],
                mode: "append",
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "cms-output-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "cmsOutput-node",
          type: "cmsOutput",
          position: { x: 640, y: 160 },
          data: {
            title: "輸出文字到CMS",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
            cmsPostSlugs: "",
            mappings: [],
            mode: "overwrite",
            postStatus: "draft",
          },
        },
      ],
      edges: [],
    });

    const normalizedNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(normalizedNode.data).not.toHaveProperty("cmsLocation");
    expect(normalizedNode.data).not.toHaveProperty("articleIdOrSlug");
  });

  it("normalizes aiClassifierTagger workflow nodes before hydrating the stores", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-classifier-workflow",
          name: "文章自動分類與標記",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiClassifierTagger-node",
              type: "aiClassifierTagger",
              position: { x: 320, y: 160 },
              data: {
                label: "舊標籤器",
                model: "gemini-1.5-pro",
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "ai-classifier-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiClassifierTagger-node",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "舊標籤器",
            model: "gemini-1.5-pro",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow",
      name: "文章自動分類與標記",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "aiClassifierTagger-node",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "舊標籤器",
            model: "gemini-1.5-pro",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
  });

  it("normalizes aiClassifierTagger workflow nodes when node data is missing or invalid", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-classifier-workflow-missing-data",
          name: "文章自動分類與標記",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiClassifierTagger-node-1",
              type: "aiClassifierTagger",
              position: { x: 320, y: 160 },
            },
            {
              id: "aiClassifierTagger-node-2",
              type: "aiClassifierTagger",
              position: { x: 560, y: 160 },
              data: "legacy-data",
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "ai-classifier-workflow-missing-data",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiClassifierTagger-node-1",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-flash",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
        {
          id: "aiClassifierTagger-node-2",
          type: "aiClassifierTagger",
          position: { x: 560, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-flash",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow-missing-data",
      name: "文章自動分類與標記",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "aiClassifierTagger-node-1",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-flash",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
        {
          id: "aiClassifierTagger-node-2",
          type: "aiClassifierTagger",
          position: { x: 560, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-flash",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
  });

  it("falls back to the default aiClassifierTagger title when title and label are missing", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-classifier-workflow-default-title",
          name: "文章自動分類與標記",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiClassifierTagger-node",
              type: "aiClassifierTagger",
              position: { x: 320, y: 160 },
              data: {
                model: "gemini-1.5-pro",
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "ai-classifier-workflow-default-title",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiClassifierTagger-node",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-pro",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow-default-title",
      name: "文章自動分類與標記",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "aiClassifierTagger-node",
          type: "aiClassifierTagger",
          position: { x: 320, y: 160 },
          data: {
            title: "AI自動分類與標籤",
            model: "gemini-1.5-pro",
            inputFields: {
              title: "source.title",
              content: "source.content",
            },
            promptTemplate: approvedAiClassifierTaggerPromptTemplate,
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
      ],
      edges: [],
    });
  });

  it("maps legacy sample workflow fields into the current node schema", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "sample-workflow-3",
          name: "文章自動分類與標記",
          description: "既有流程",
          status: "published",
          nodes: JSON.stringify([
            {
              id: "cmsInput-node",
              type: "cmsInput",
              position: { x: 80, y: 160 },
              data: {
                label: "CMS 輸入",
                cmsSource: "demo-cms",
                enabledFields: {
                  title: true,
                  content: true,
                },
              },
            },
            {
              id: "aiCall-node",
              type: "aiCall",
              position: { x: 360, y: 160 },
              data: {
                label: "AI 分類與標記",
                provider: "demo-ai",
                model: "gpt-demo",
                prompt: "legacy prompt",
                targetField: "{{ cms.article.content }}",
              },
            },
            {
              id: "cmsOutput-node",
              type: "cmsOutput",
              position: { x: 640, y: 160 },
              data: {
                label: "CMS 輸出",
                cmsDestination: "demo-cms",
                mappings: [
                  {
                    sourceField: "{{ ai.category }}",
                    targetField: "category",
                  },
                  {
                    sourceField: "{{ ai.category }}",
                    targetField: "category",
                  },
                ],
              },
            },
          ]),
          edges: JSON.stringify([
            { id: "e1", source: "cmsInput-node", target: "aiCall-node" },
            { id: "e2", source: "aiCall-node", target: "cmsOutput-node" },
          ]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "sample-workflow-3",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "cmsInput-node",
          type: "cmsInput",
          position: { x: 80, y: 160 },
          data: {
            title: "從CMS輸入",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
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
        {
          id: "aiCall-node",
          type: "aiCall",
          position: { x: 360, y: 160 },
          data: {
            title: "AI 分類與標記",
            model: "gpt-demo",
            inputs: {
              title: true,
              content: true,
              summary: false,
            },
            outputFormat: "JSON",
            promptTemplate: "legacy prompt",
            cmsField: "{{ cms.article.content }}",
            testInput: "",
          },
        },
        {
          id: "cmsOutput-node",
          type: "cmsOutput",
          position: { x: 640, y: 160 },
          data: {
            title: "輸出文字到CMS",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
            cmsPostSlugs: "",
            mappings: [],
            mode: "overwrite",
            postStatus: "draft",
          },
        },
      ],
      edges: [
        { id: "e1", source: "cmsInput-node", target: "aiCall-node" },
        { id: "e2", source: "aiCall-node", target: "cmsOutput-node" },
      ],
    });

    const snapshot = loadSnapshot.mock.calls[0]?.[0];
    const cmsOutputMappings = snapshot.nodes[2].data.mappings;
    expect(cmsOutputMappings).toEqual([]);
  });

  it("falls back to the current cmsInput defaults when legacy field settings are missing", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "legacy-cms-input-workflow",
          name: "legacy cms input",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "cmsInput-node",
              type: "cmsInput",
              position: { x: 80, y: 160 },
              data: {
                label: "CMS 輸入",
                cmsSource: "demo-cms",
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "legacy-cms-input-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "cmsInput-node",
          type: "cmsInput",
          position: { x: 80, y: 160 },
          data: {
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
          },
        },
      ],
      edges: [],
    });
    const legacyLoadedNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(legacyLoadedNode.data).not.toHaveProperty("entryId");
    expect(legacyLoadedNode.data).not.toHaveProperty("fields");
    expect(legacyLoadedNode.data).not.toHaveProperty("author");
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "legacy-cms-input-workflow",
      name: "legacy cms input",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "cmsInput-node",
          type: "cmsInput",
          position: { x: 80, y: 160 },
          data: {
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
          },
        },
      ],
      edges: [],
    });
  });

  it("falls back to the current codeBlock defaults when language is missing", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "legacy-code-workflow",
          name: "legacy code",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "codeBlock-node",
              type: "codeBlock",
              position: { x: 120, y: 160 },
              data: {
                title: "撰寫程式碼",
                code: "console.log('hello');",
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "legacy-code-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "codeBlock-node",
          type: "codeBlock",
          position: { x: 120, y: 160 },
          data: {
            title: "撰寫程式碼",
            language: "JavaScript",
            code: "console.log('hello');",
          },
        },
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "legacy-code-workflow",
      name: "legacy code",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "codeBlock-node",
          type: "codeBlock",
          position: { x: 120, y: 160 },
          data: {
            title: "撰寫程式碼",
            language: "JavaScript",
            code: "console.log('hello');",
          },
        },
      ],
      edges: [],
    });
  });

  it("falls back to the current exportResult defaults when source and format are missing", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "legacy-export-workflow",
          name: "legacy export",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "exportResult-node",
              type: "exportResult",
              position: { x: 240, y: 160 },
              data: {
                title: "匯出結果",
                fileNamePattern: legacyFileNamePattern,
                destination: "google_drive",
                autoDownload: false,
                zipFiles: true,
              },
            },
          ]),
          edges: JSON.stringify([]),
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const result = await loadWorkflowIntoStores({
      workflowId: "legacy-export-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "exportResult-node",
          type: "exportResult",
          position: { x: 240, y: 160 },
          data: {
            title: "匯出結果",
            source: "AI Tagging → tags",
            format: "JSON",
            fileNamePattern: legacyFileNamePattern,
            destination: "google_drive",
            autoDownload: false,
            zipFiles: true,
          },
        },
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "legacy-export-workflow",
      name: "legacy export",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "exportResult-node",
          type: "exportResult",
          position: { x: 240, y: 160 },
          data: {
            title: "匯出結果",
            source: "AI Tagging → tags",
            format: "JSON",
            fileNamePattern: legacyFileNamePattern,
            destination: "google_drive",
            autoDownload: false,
            zipFiles: true,
          },
        },
      ],
      edges: [],
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
