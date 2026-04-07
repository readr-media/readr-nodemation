import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type WorkflowTemplateData = {
  id: number;
  name: string;
  description: string | null;
  status: "template" | "draft" | "published" | "running";
};

export const getWorkflowTemplates = async (): Promise<
  WorkflowTemplateData[]
> => {
  noStore();

  const templates = await prisma.workflowTemplate.findMany({
    orderBy: { sort_order: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
    },
  });

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    status: template.status as WorkflowTemplateData["status"],
  }));
};
