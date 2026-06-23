import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

import { EARTHQUAKE_USER_PROMPT } from "@/lib/earthquake-workflow";

type SeedWorkflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  nodes: string;
  edges: string;
};

type TemplateGraph = {
  nodes: string;
  edges: string;
};

type WorkflowNodeSnapshot = {
  id: string;
  type: string;
  measured?: { width: number; height: number };
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
};

const repoRoot = path.resolve(__dirname, "../../..");
const seedFilePath = path.join(repoRoot, "prisma/seed.js");

type SeedExports = {
  workflowSeed?: SeedWorkflow[];
  templateGraphSeedByName?: Record<string, TemplateGraph>;
};

const loadSeedExports = (): SeedExports => {
  const source = fs.readFileSync(seedFilePath, "utf8");
  const context = {
    module: { exports: {} as SeedExports },
    exports: {},
    require: (specifier: string) => {
      if (specifier === "@prisma/client") {
        return {
          PrismaClient: class PrismaClient {
            moduleUnit = { deleteMany: async () => undefined };
            moduleType = {
              deleteMany: async () => undefined,
              create: async () => undefined,
            };
            workflowTemplate = {
              deleteMany: async () => undefined,
              create: async () => undefined,
            };
            user = { upsert: async () => undefined };
            workflow = { upsert: async () => undefined };
            $disconnect = async () => undefined;
          },
        };
      }

      if (specifier === "../lib/earthquake-workflow.constants.js") {
        return require(path.join(repoRoot, "lib/earthquake-workflow.constants.js"));
      }

      throw new Error(`Unexpected dependency in seed loader: ${specifier}`);
    },
    console,
    process: { exitCode: 0 },
  };

  vm.runInNewContext(
    `${source}\nmodule.exports = { workflowSeed, templateGraphSeedByName };`,
    context,
    { filename: seedFilePath },
  );

  return context.module.exports;
};

const loadWorkflowSeed = (): SeedWorkflow[] => {
  const { workflowSeed } = loadSeedExports();

  if (!workflowSeed) {
    throw new Error("Failed to load workflow seed definitions");
  }

  return workflowSeed;
};

const getNodeOrThrow = (nodes: WorkflowNodeSnapshot[], index: number) => {
  const node = nodes[index];
  if (!node) {
    throw new Error(`Expected node at index ${index}`);
  }
  return node;
};

const getNodeDataOrThrow = (node: WorkflowNodeSnapshot) => {
  if (!node.data) {
    throw new Error(`Expected node "${node.id}" to include data`);
  }
  return node.data;
};

describe("demo article classification workflow seed", () => {
  it("stores a complete CMS to AI to CMS graph snapshot", () => {
    const workflow = loadWorkflowSeed().find(
      (entry) => entry.name === "文章自動分類與標記",
    );

    expect(workflow).toBeDefined();
    if (!workflow) {
      throw new Error("Expected workflow seed to include 文章自動分類與標記");
    }

    const nodes = JSON.parse(workflow.nodes) as WorkflowNodeSnapshot[];
    const edges = JSON.parse(workflow.edges) as Array<{
      source: string;
      target: string;
    }>;

    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => node.type)).toEqual([
      "cmsInput",
      "aiClassifierTagger",
      "cmsOutput",
    ]);
    expect(edges).toHaveLength(2);
    expect(edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["cmsInput-node", "aiClassifierTagger-node"],
      ["aiClassifierTagger-node", "cmsOutput-node"],
    ]);

    const cmsInputNode = getNodeOrThrow(nodes, 0);
    const aiClassifierTaggerNode = getNodeOrThrow(nodes, 1);
    const cmsOutputNode = getNodeOrThrow(nodes, 2);
    const cmsInputData = getNodeDataOrThrow(cmsInputNode);
    const aiClassifierTaggerData = getNodeDataOrThrow(aiClassifierTaggerNode);
    const cmsOutputData = getNodeDataOrThrow(cmsOutputNode);

    expect(cmsInputData.title).toBe("從 CMS 輸入文章");
    expect(cmsInputData).toMatchObject({
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
    });
    expect(cmsInputData).not.toHaveProperty("source");
    expect(cmsInputData).not.toHaveProperty("entryId");
    expect(cmsInputData).not.toHaveProperty("fields");
    expect(cmsInputData).not.toHaveProperty("author");
    expect(aiClassifierTaggerNode.id).toBe("aiClassifierTagger-node");
    expect(aiClassifierTaggerNode.measured).toEqual({
      width: 240,
      height: 62,
    });
    expect(aiClassifierTaggerData.title).toBe("AI自動分類與標籤");
    expect(aiClassifierTaggerData).toMatchObject({
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
    });
    expect(aiClassifierTaggerData.promptTemplate).toBe("");
    expect(aiClassifierTaggerData).not.toHaveProperty("model");
    expect(cmsOutputNode.measured).toEqual({
      width: 240,
      height: 62,
    });
    expect(cmsOutputData).toMatchObject({
      title: "輸出文字到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "classifier-ai-categories-to-categories",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "classifier-ai-tags-to-tags",
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

describe("demo AI title generation workflow seed", () => {
  it("stores a complete CMS to aiTitle to CMS graph snapshot", () => {
    const { templateGraphSeedByName } = loadSeedExports();
    const graph = templateGraphSeedByName?.["AI 文章標題"];

    expect(graph).toBeDefined();
    if (!graph) {
      throw new Error(
        "Expected templateGraphSeedByName to include AI 文章標題",
      );
    }

    const nodes = JSON.parse(graph.nodes) as WorkflowNodeSnapshot[];
    const edges = JSON.parse(graph.edges) as Array<{
      source: string;
      target: string;
    }>;

    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => node.type)).toEqual([
      "cmsInput",
      "aiTitle",
      "cmsOutput",
    ]);
    expect(edges).toHaveLength(2);
    expect(edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["title-cmsInput-node", "title-aiTitle-node"],
      ["title-aiTitle-node", "title-cmsOutput-node"],
    ]);

    const aiTitleNode = getNodeOrThrow(nodes, 1);
    const aiTitleData = getNodeDataOrThrow(aiTitleNode);

    expect(aiTitleNode.id).toBe("title-aiTitle-node");
    expect(aiTitleNode.measured).toEqual({ width: 240, height: 62 });
    expect(aiTitleData).toMatchObject({
      title: "AI 文章標題",
      titleStyle: "seo",
      titleTemperature: 0.5,
      titleKeywords: "",
    });
    expect(aiTitleData).not.toHaveProperty("model");
    expect(aiTitleData).not.toHaveProperty("inputs");
    expect(aiTitleData).not.toHaveProperty("outputFormat");
    expect(aiTitleData).not.toHaveProperty("promptTemplate");
    expect(aiTitleData).not.toHaveProperty("cmsField");
  });
});

describe("demo podcast workflow seed", () => {
  it("stores podcast nodes without the removed promptTemplate field", () => {
    const { templateGraphSeedByName } = loadSeedExports();
    const graph = templateGraphSeedByName?.["Podcast 生成"];

    expect(graph).toBeDefined();
    if (!graph) {
      throw new Error("Expected templateGraphSeedByName to include Podcast 生成");
    }

    const nodes = JSON.parse(graph.nodes) as WorkflowNodeSnapshot[];
    const podcastNode = nodes.find((node) => node.type === "podcastGeneration");

    expect(podcastNode).toBeDefined();
    if (!podcastNode) {
      throw new Error("Expected podcast graph to include podcastGeneration node");
    }

    const podcastData = getNodeDataOrThrow(podcastNode);
    expect(podcastData).toMatchObject({
      title: "Podcast 生成",
      podcastMode: "deepDive",
      podcastLength: "medium",
    });
    expect(podcastData).not.toHaveProperty("model");
    expect(podcastData).not.toHaveProperty("promptTemplate");
    expect(podcastData).not.toHaveProperty("prompt");
  });
});

describe("demo earthquake workflow seed", () => {
  it("stores a complete earthquakeInput to aiCall to cmsOutput graph snapshot", () => {
    const { templateGraphSeedByName } = loadSeedExports();
    const graph = templateGraphSeedByName?.["自動地震文"];

    expect(graph).toBeDefined();
    if (!graph) {
      throw new Error("Expected templateGraphSeedByName to include 自動地震文");
    }

    const nodes = JSON.parse(graph.nodes) as WorkflowNodeSnapshot[];
    const edges = JSON.parse(graph.edges) as Array<{
      source: string;
      target: string;
    }>;

    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => node.type)).toEqual([
      "earthquakeInput",
      "aiCall",
      "cmsOutput",
    ]);
    expect(edges).toHaveLength(2);
    expect(edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["earthquakeInput-node", "aiCall-node"],
      ["aiCall-node", "earthquake-cmsOutput-node"],
    ]);

    const earthquakeInputNode = getNodeOrThrow(nodes, 0);
    const aiCallNode = getNodeOrThrow(nodes, 1);
    const cmsOutputNode = getNodeOrThrow(nodes, 2);
    const earthquakeInputData = getNodeDataOrThrow(earthquakeInputNode);
    const aiCallData = getNodeDataOrThrow(aiCallNode);
    const cmsOutputData = getNodeDataOrThrow(cmsOutputNode);

    expect(earthquakeInputNode.id).toBe("earthquakeInput-node");
    expect(earthquakeInputData).toMatchObject({
      title: "取得地震資訊",
    });
    expect(earthquakeInputData).not.toHaveProperty("dataSource");
    expect(earthquakeInputData).not.toHaveProperty("triggerCondition");
    expect(earthquakeInputData).not.toHaveProperty("updateMethod");

    expect(aiCallNode.id).toBe("aiCall-node");
    expect(aiCallNode.measured).toEqual({ width: 240, height: 62 });
    expect(aiCallData).toMatchObject({
      title: "呼叫 AI",
      userPrompt: EARTHQUAKE_USER_PROMPT,
    });

    expect(cmsOutputNode.measured).toEqual({ width: 240, height: 62 });
    expect(cmsOutputData).toMatchObject({
      title: "輸出文字到 CMS",
      cmsName: "Readr CMS",
      cmsList: "Post",
      mappings: [
        {
          id: "earthquake-title",
          sourceField: "{{ ai.title }}",
          targetField: "title",
        },
        {
          id: "earthquake-content",
          sourceField: "{{ ai.content }}",
          targetField: "content",
        },
        {
          id: "earthquake-categories",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    });
  });
});
