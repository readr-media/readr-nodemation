export const WORKFLOW_STATUS_VALUES = [
  "template",
  "draft",
  "published",
  "running",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS_VALUES)[number];

export const WORKFLOW_STATUSES: WorkflowStatus[] = [...WORKFLOW_STATUS_VALUES];

export const WORKFLOW_STATUS_LABELS: Readonly<Record<WorkflowStatus, string>> =
  {
    template: "模板",
    draft: "草稿",
    published: "已啟用",
    running: "執行中",
  };
