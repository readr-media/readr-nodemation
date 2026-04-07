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
            moduleType = { deleteMany: async () => undefined, create: async () => undefined };
            workflowTemplate = { deleteMany: async () => undefined, create: async () => undefined };
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

    const nodes = JSON.parse(workflow!.nodes) as Array<{
      type: string;
      data?: Record<string, unknown>;
    }>;
    const edges = JSON.parse(workflow!.edges) as Array<{
      source: string;
      target: string;
    }>;

    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => node.type)).toEqual([
      "cmsInput",
      "aiCall",
      "cmsOutput",
    ]);
    expect(edges).toHaveLength(2);
    expect(edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["cmsInput-node", "aiCall-node"],
      ["aiCall-node", "cmsOutput-node"],
    ]);

    const cmsInputNode = nodes[0];
    const aiCallNode = nodes[1];
    const cmsOutputNode = nodes[2];

    expect(cmsInputNode.data?.enabledFields).toEqual({
      title: true,
      content: true,
    });
    expect(aiCallNode.data?.prompt).toEqual(expect.any(String));
    expect(aiCallNode.data?.prompt).not.toHaveLength(0);
    expect(aiCallNode.data?.targetField).toEqual(expect.any(String));
    expect(aiCallNode.data?.targetField).not.toHaveLength(0);
    expect(cmsOutputNode.data?.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetField: expect.any(String) }),
        expect.objectContaining({ targetField: expect.any(String) }),
      ]),
    );
  });
});
