import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type WorkflowTemplateData = {
  id: number;
  name: string;
  description: string | null;
  status: "template" | "draft" | "published" | "running";
  nodes: string;
  edges: string;
};

type WorkflowTemplateColumnInfo = {
  name: string;
};

const getWorkflowTemplateColumns = async (): Promise<
  WorkflowTemplateColumnInfo[]
> =>
  prisma.$queryRaw<WorkflowTemplateColumnInfo[]>`
    PRAGMA table_info("WorkflowTemplate")
  `;

const ensureWorkflowTemplateSchema = async (): Promise<Set<string>> => {
  const columns = await getWorkflowTemplateColumns();
  const columnNames = new Set(columns.map((column) => column.name));

  const missingColumns: Array<{ name: string; statement: string }> = [];

  if (!columnNames.has("nodes")) {
    missingColumns.push({
      name: "nodes",
      statement:
        'ALTER TABLE "WorkflowTemplate" ADD COLUMN "nodes" TEXT NOT NULL DEFAULT \'[]\'',
    });
  }

  if (!columnNames.has("edges")) {
    missingColumns.push({
      name: "edges",
      statement:
        'ALTER TABLE "WorkflowTemplate" ADD COLUMN "edges" TEXT NOT NULL DEFAULT \'[]\'',
    });
  }

  if (!columnNames.has("sort_order")) {
    missingColumns.push({
      name: "sort_order",
      statement:
        'ALTER TABLE "WorkflowTemplate" ADD COLUMN "sort_order" INT NOT NULL DEFAULT 0',
    });
  }

  for (const column of missingColumns) {
    try {
      await prisma.$executeRawUnsafe(column.statement);
      columnNames.add(column.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Handle concurrent instances adding the same column.
      if (!message.includes("duplicate column name")) {
        throw error;
      }

      columnNames.add(column.name);
    }
  }

  return columnNames;
};

export const getWorkflowTemplates = async (): Promise<
  WorkflowTemplateData[]
> => {
  noStore();

  const columns = await ensureWorkflowTemplateSchema();
  const hasNodesColumn = columns.has("nodes");
  const hasEdgesColumn = columns.has("edges");
  const hasSortOrderColumn = columns.has("sort_order");

  const selectNodes = hasNodesColumn ? "nodes" : "'[]' as nodes";
  const selectEdges = hasEdgesColumn ? "edges" : "'[]' as edges";
  const orderBy = hasSortOrderColumn ? "sort_order ASC" : "id ASC";

  const templates = await prisma.$queryRawUnsafe<
    Array<{
      id: number;
      name: string;
      description: string | null;
      status: string;
      nodes: string;
      edges: string;
    }>
  >(
    `SELECT id, name, description, status, ${selectNodes}, ${selectEdges} FROM WorkflowTemplate ORDER BY ${orderBy}`,
  );

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status as WorkflowTemplateData["status"],
    nodes: template.nodes,
    edges: template.edges,
  }));
};
