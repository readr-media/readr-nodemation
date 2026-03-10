export const WORKFLOW_STATUS_VALUES = [
  "template",
  "draft",
  "published",
  "running",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS_VALUES)[number];

export const WORKFLOW_STATUSES: WorkflowStatus[] = [...WORKFLOW_STATUS_VALUES];
