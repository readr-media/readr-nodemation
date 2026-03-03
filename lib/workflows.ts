import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { WORKFLOW_STATUSES, type WorkflowStatus } from "@/lib/workflow-status";

export type WorkflowListItem = {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  updatedAt: Date;
  lastRunAt: Date | null;
};

export const getUserWorkflows = async (): Promise<WorkflowListItem[]> => {
  noStore();

  const workflows = await prisma.workflow.findMany({
    orderBy: { updated_at: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      updated_at: true,
      last_run_at: true,
    },
  });

  return workflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    status: (WORKFLOW_STATUSES.includes(workflow.status as WorkflowStatus)
      ? (workflow.status as WorkflowStatus)
      : "draft") satisfies WorkflowStatus,
    updatedAt: workflow.updated_at,
    lastRunAt: workflow.last_run_at,
  }));
};
