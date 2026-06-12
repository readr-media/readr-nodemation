import { describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";

import { loadWorkflowIntoStores } from "@/app/[workflow-builder]/components/workflow-loader";
import { createAiClassifierTaggerNodeSlice } from "@/stores/flow-editor/slices/ai-classifier-tagger-node-slice";
import { createAiTitleGenerationNodeSlice } from "@/stores/flow-editor/slices/ai-title-generation-node-slice";
import { createCmsNodeSlice } from "@/stores/flow-editor/slices/cms-node-slice";
import { createCmsOutputNodeSlice } from "@/stores/flow-editor/slices/cms-output-node-slice";
import type {
  AiClassifierTaggerNodeSlice,
  AiTitleGenerationNodeSlice,
  CmsNodeSlice,
  CmsOutputNodeSlice,
  NodesStore,
} from "@/stores/flow-editor/types";

type SliceStoreBaseState = Pick<
  NodesStore,
  "nodes" | "edges" | "selectedNodeId"
>;

const createSliceStore = <TSlice extends object>(
  createSlice: (set: unknown, get: unknown, api: unknown) => TSlice,
) =>
  createStore<SliceStoreBaseState & TSlice>()((set, get, api) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    ...createSlice(set, get, api),
  }));

const getFirstNodeOrThrow = (store: {
  getState: () => SliceStoreBaseState;
}) => {
  const firstNode = store.getState().nodes[0];
  if (!firstNode) {
    throw new Error("Expected store to contain at least one node");
  }
  return firstNode;
};

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
            '[{"id":"node-1","type":"cmsInput","position":{"x":0,"y":0},"data":{"label":"從 CMS 輸入文章"}}]',
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
      templateId: null,
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
            title: "從 CMS 輸入文章",
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
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
      name: "文章自動分類與標記",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "node-1",
          type: "cmsInput",
          position: { x: 0, y: 0 },
          data: {
            title: "從 CMS 輸入文章",
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
    const store = createSliceStore<CmsNodeSlice>(createCmsNodeSlice as never);

    store.getState().addCmsNode();

    const createdNode = getFirstNodeOrThrow(
      store,
    ) as NodesStore["nodes"][number];

    expect(createdNode).toMatchObject({
      type: "cmsInput",
      data: {
        title: "從 CMS 輸入文章",
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
    const store = createSliceStore<AiClassifierTaggerNodeSlice>(
      createAiClassifierTaggerNodeSlice as never,
    );

    store.getState().addAiClassifierTaggerNode();

    const createdNode = getFirstNodeOrThrow(
      store,
    ) as NodesStore["nodes"][number];

    expect(createdNode).toMatchObject({
      type: "aiClassifierTagger",
      data: {
        title: "AI自動分類與標籤",
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

  it("creates new aiTitle nodes with the approved defaults", () => {
    const store = createSliceStore<AiTitleGenerationNodeSlice>(
      createAiTitleGenerationNodeSlice as never,
    );

    store.getState().addAiTitleGenerationNode();

    const createdNode = getFirstNodeOrThrow(
      store,
    ) as NodesStore["nodes"][number];

    expect(createdNode).toMatchObject({
      type: "aiTitle",
      measured: { width: 240, height: 62 },
      data: {
        title: "AI 文章標題",
        titleStyle: "seo",
        titleTemperature: 0.5,
        titleKeywords: "",
      },
    });
    expect(store.getState().selectedNodeId).toBe(createdNode.id);
  });

  it("creates new cmsOutput nodes with the approved defaults", () => {
    const store = createSliceStore<CmsOutputNodeSlice>(
      createCmsOutputNodeSlice as never,
    );

    store.getState().addCmsOutputNode();

    const createdNode = getFirstNodeOrThrow(
      store,
    ) as NodesStore["nodes"][number];

    expect(createdNode).toMatchObject({
      type: "cmsOutput",
      measured: {
        width: 240,
        height: 62,
      },
      data: {
        title: "輸出文字到 CMS",
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
      templateId: null,
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
            title: "輸出文字到 CMS",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
            cmsPostSlugs: "",
            mappings: [
              {
                id: expect.any(String),
                sourceField: "{{ ai.tags }}",
                targetField: "tags",
              },
            ],
            mode: "append",
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

  it("normalizes cmsOutputAudio nodes with the registered Keystone list name", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "cms-output-audio-workflow",
          name: "Podcast 輸出流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "cmsOutputAudio-node",
              type: "cmsOutputAudio",
              position: { x: 640, y: 160 },
              data: {
                label: "輸出音檔到CMS",
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
      workflowId: "cms-output-audio-workflow",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
      templateId: null,
    });

    expect(result).toEqual({ status: "loaded" });
    // The Keystone list is registered as the singular "Audio File"; the loader
    // fallback must match it (and the slice default) or the backend cmsOutput
    // executor rejects the value with "unsupported cmsList".
    const audioNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(audioNode.data.cmsList).toBe("Audio File");
  });

  it("normalizes cmsOutputAudio defaults from the shared slice source of truth", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "cms-output-audio-defaults",
          name: "Podcast 輸出流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "cmsOutputAudio-node",
              type: "cmsOutputAudio",
              position: { x: 640, y: 160 },
              data: {},
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
      workflowId: "cms-output-audio-defaults",
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
      templateId: null,
    });

    expect(result).toEqual({ status: "loaded" });
    // The loader must take its cmsOutputAudio defaults from the node slice
    // (single source of truth) instead of divergent hardcoded values — the
    // divergence is what produced the cmsList bug. These values mirror
    // createCmsOutputAudioNodeData in cms-output-audio-node-slice.ts.
    const audioNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(audioNode.data.title).toBe("輸出音檔到 CMS");
    expect(audioNode.data.cmsName).toBe("READr CMS");
    expect(audioNode.data.cmsList).toBe("Audio File");
    expect(audioNode.data.mode).toBe("create");
  });

  it("normalizes podcastGeneration nodes without retaining removed promptTemplate field", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "podcast-workflow",
          name: "Podcast 生成流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "podcast-node",
              type: "podcastGeneration",
              position: { x: 360, y: 160 },
              data: {
                label: "Podcast 舊節點",
                promptTemplate: "legacy promptTemplate",
                prompt: "legacy prompt",
                podcastMode: "summary",
                podcastLength: "short",
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
      workflowId: "podcast-workflow",
      templateId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "podcast-node",
          type: "podcastGeneration",
          position: { x: 360, y: 160 },
          data: {
            title: "Podcast 舊節點",
            podcastMode: "summary",
            podcastLength: "short",
          },
        },
      ],
      edges: [],
    });
    const podcastNode = loadSnapshot.mock.calls[0]?.[0]?.nodes[0];
    expect(podcastNode.data).not.toHaveProperty("promptTemplate");
    expect(podcastNode.data).not.toHaveProperty("prompt");
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
      templateId: null,
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow",
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
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
      templateId: null,
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
        {
          id: "aiClassifierTagger-node-2",
          type: "aiClassifierTagger",
          position: { x: 560, y: 160 },
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow-missing-data",
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
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
        {
          id: "aiClassifierTagger-node-2",
          type: "aiClassifierTagger",
          position: { x: 560, y: 160 },
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
              data: {},
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
      templateId: null,
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
      ],
      edges: [],
    });
    expect(hydrateFromWorkflow).toHaveBeenCalledWith({
      workflowId: "ai-classifier-workflow-default-title",
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
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
      templateId: null,
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
            title: "從 CMS 輸入文章",
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
            title: "輸出文字到 CMS",
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
      templateId: null,
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
            title: "從 CMS 輸入文章",
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
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
      name: "legacy cms input",
      description: "既有流程",
      status: "draft",
      nodes: [
        {
          id: "cmsInput-node",
          type: "cmsInput",
          position: { x: 80, y: 160 },
          data: {
            title: "從 CMS 輸入文章",
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
      templateId: null,
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
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
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
      templateId: null,
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
      templateId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "idle" });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(loadSnapshot).not.toHaveBeenCalled();
    expect(hydrateFromWorkflow).not.toHaveBeenCalled();
  });

  it("normalizes aiTitle workflow nodes before hydrating the stores", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-title-workflow",
          name: "AI 文章標題流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiTitle-node",
              type: "aiTitle",
              position: { x: 360, y: 160 },
              data: {
                label: "舊標題節點",
                titleStyle: "social",
                titleTemperature: 0.8,
                titleKeywords: "AI,新聞",
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
      workflowId: "ai-title-workflow",
      templateId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(result).toEqual({ status: "loaded" });
    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiTitle-node",
          type: "aiTitle",
          position: { x: 360, y: 160 },
          data: {
            title: "舊標題節點",
            titleStyle: "social",
            titleTemperature: 0.8,
            titleKeywords: "AI,新聞",
          },
        },
      ],
      edges: [],
    });
  });

  it("normalizes aiTitle workflow nodes when node data is missing or invalid", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-title-workflow-missing-data",
          name: "AI 文章標題流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiTitle-node",
              type: "aiTitle",
              position: { x: 360, y: 160 },
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

    await loadWorkflowIntoStores({
      workflowId: "ai-title-workflow-missing-data",
      templateId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiTitle-node",
          type: "aiTitle",
          position: { x: 360, y: 160 },
          data: {
            title: "AI 文章標題",
            titleStyle: "seo",
            titleTemperature: 0.5,
            titleKeywords: "",
          },
        },
      ],
      edges: [],
    });
  });

  it("falls back to the default aiTitle title when title and label are missing", async () => {
    const loadSnapshot = vi.fn();
    const hydrateFromWorkflow = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ai-title-workflow-default-title",
          name: "AI 文章標題流程",
          description: "既有流程",
          status: "draft",
          nodes: JSON.stringify([
            {
              id: "aiTitle-node",
              type: "aiTitle",
              position: { x: 360, y: 160 },
              data: {
                titleStyle: "professional",
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

    await loadWorkflowIntoStores({
      workflowId: "ai-title-workflow-default-title",
      templateId: null,
      fetchImpl,
      loadSnapshot,
      hydrateFromWorkflow,
    });

    expect(loadSnapshot).toHaveBeenCalledWith({
      nodes: [
        {
          id: "aiTitle-node",
          type: "aiTitle",
          position: { x: 360, y: 160 },
          data: {
            title: "AI 文章標題",
            titleStyle: "professional",
            titleTemperature: 0.5,
            titleKeywords: "",
          },
        },
      ],
      edges: [],
    });
  });
});
