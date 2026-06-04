import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { WORKFLOW_STATUSES, type WorkflowStatus } from "@/lib/workflow-status";

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

  const templates = await prisma.workflowTemplate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      nodes: true,
      edges: true,
    },
    orderBy: { sort_order: "asc" },
  });

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    status: (WORKFLOW_STATUSES.includes(template.status as WorkflowStatus)
        ? (template.status as WorkflowStatus)
        : "template") satisfies WorkflowTemplateData["status"],
    nodes: template.nodes,
    edges: template.edges,
  }));
};
