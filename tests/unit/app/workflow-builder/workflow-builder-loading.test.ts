import { describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";

import { loadWorkflowIntoStores } from "@/app/[workflow-builder]/components/workflow-loader";
import { createCmsNodeSlice } from "@/stores/flow-editor/slices/cms-node-slice";
import type { NodesStore } from "@/stores/flow-editor/types";

const legacyFileNamePattern = `\${workflow_name}_\${date}.json`;

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
            title: "CMS 輸出",
            cmsLocation: "demo-cms",
            articleIdOrSlug: "",
            mappings: [
              {
                id: expect.any(String),
                sourceField: "{{ ai.category }}",
                targetField: "category",
              },
              {
                id: expect.any(String),
                sourceField: "{{ ai.category }}",
                targetField: "category",
              },
            ],
            mode: "overwrite",
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
    expect(cmsOutputMappings).toHaveLength(2);
    expect(cmsOutputMappings[0].id).not.toBe(cmsOutputMappings[1].id);
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
