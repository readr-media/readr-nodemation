import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

type SeedWorkflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  nodes: string;
  edges: string;
};

const repoRoot = path.resolve(__dirname, "../../..");
const seedFilePath = path.join(repoRoot, "prisma/seed.js");

const loadWorkflowSeed = (): SeedWorkflow[] => {
  const source = fs.readFileSync(seedFilePath, "utf8");
  const context = {
    module: { exports: {} as { workflowSeed?: SeedWorkflow[] } },
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

      throw new Error(`Unexpected dependency in seed loader: ${specifier}`);
    },
    console,
    process: { exitCode: 0 },
  };

  vm.runInNewContext(`${source}\nmodule.exports = { workflowSeed };`, context, {
    filename: seedFilePath,
  });

  const { workflowSeed } = context.module.exports;

  if (!workflowSeed) {
    throw new Error("Failed to load workflow seed definitions");
  }

  return workflowSeed;
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

    const nodes = JSON.parse(workflow.nodes) as Array<{
      type: string;
      data?: Record<string, unknown>;
    }>;
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

    const cmsInputNode = nodes[0];
    const aiClassifierTaggerNode = nodes[1];
    const cmsOutputNode = nodes[2];

    expect(cmsInputNode.data?.title).toBe("從 CMS 輸入文章");
    expect(cmsInputNode.data).toMatchObject({
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
    expect(cmsInputNode.data).not.toHaveProperty("source");
    expect(cmsInputNode.data).not.toHaveProperty("entryId");
    expect(cmsInputNode.data).not.toHaveProperty("fields");
    expect(cmsInputNode.data).not.toHaveProperty("author");
    expect(aiClassifierTaggerNode.id).toBe("aiClassifierTagger-node");
    expect(aiClassifierTaggerNode.measured).toEqual({
      width: 240,
      height: 62,
    });
    expect(aiClassifierTaggerNode.data?.title).toBe("AI自動分類與標籤");
    expect(aiClassifierTaggerNode.data).toMatchObject({
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
    });
    expect(aiClassifierTaggerNode.data?.promptTemplate).toBe("");
    expect(cmsOutputNode.measured).toEqual({
      width: 240,
      height: 62,
    });
    expect(cmsOutputNode.data).toMatchObject({
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
    expect(cmsOutputNode.data).not.toHaveProperty("cmsLocation");
    expect(cmsOutputNode.data).not.toHaveProperty("articleIdOrSlug");
  });
});
