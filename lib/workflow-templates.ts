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

export const getWorkflowTemplates = async (): Promise<
  WorkflowTemplateData[]
> => {
  noStore();

  const templates = await prisma.$queryRaw<
    Array<{
      id: number;
      name: string;
      description: string | null;
      status: string;
      nodes: string;
      edges: string;
    }>
  >`SELECT id, name, description, status, nodes, edges FROM WorkflowTemplate ORDER BY sort_order ASC`;

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status as WorkflowTemplateData["status"],
    nodes: template.nodes,
    edges: template.edges,
  }));
};
