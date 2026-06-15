import { formatWorkflowTimestamp } from "@/lib/format-datetime";

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

export const WORKFLOW_BUILDER_STATUS_LABELS: Readonly<
  Record<WorkflowStatus, string>
> = {
  template: "模板",
  draft: "草稿",
  published: "已執行",
  running: "執行中",
};

// Secondary "grey text" labels shown beside the status badge in the builder
// header. They describe the latest persistence/execution activity rather than
// the raw status.
export const WORKFLOW_BUILDER_ACTIVITY_LABELS = {
  created: "建立",
  saved: "儲存",
  executed: "執行",
  completed: "完成執行",
} as const;

export type WorkflowRunCycleState = {
  runTriggered: boolean;
  sawRunningStatus: boolean;
  lastRunAt: string | null;
  lastRunAtAtTrigger: string | null;
};

const toTime = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

// True when a user-initiated run has finished: published again after we saw it
// enter running, or last_run_at advanced past the value captured at Run click
// (covers fast runs that settle before polling observes "running").
export const isWorkflowRunCompleted = (
  status: WorkflowStatus,
  {
    runTriggered,
    sawRunningStatus,
    lastRunAt,
    lastRunAtAtTrigger,
  }: WorkflowRunCycleState,
): boolean => {
  if (!runTriggered || status !== "published") {
    return false;
  }
  if (sawRunningStatus) {
    return true;
  }
  const lastRunTime = toTime(lastRunAt);
  if (lastRunTime === null) {
    return false;
  }
  const triggerTime = toTime(lastRunAtAtTrigger);
  if (triggerTime === null) {
    return true;
  }
  return lastRunTime > triggerTime;
};

// True while the workflow is mid-execution-cycle (submitted/published but not
// yet completed, or actively running). The builder polls for fresh status
// while this is true, then stops once the run settles.
//
// `runTriggered` is client-owned: only a user-initiated Run sets it, so a save
// that bumps updated_at without executing does not start polling.
export const isWorkflowExecutionPending = (
  status: WorkflowStatus,
  cycle: WorkflowRunCycleState,
): boolean => {
  if (status === "running") {
    return true;
  }
  if (status === "published" && cycle.runTriggered) {
    return !isWorkflowRunCompleted(status, cycle);
  }
  return false;
};

type WorkflowActivityInput = {
  status: WorkflowStatus;
  updatedAt: string | null;
  lastRunAt: string | null;
  createdAt: string | null;
  runTriggered?: boolean;
  sawRunningStatus?: boolean;
  lastRunAtAtTrigger?: string | null;
};

// Builds the grey-text string shown next to the status badge, e.g.
// "已於 2026/06/10 11:50:00 儲存". Falls back to "未儲存變更" when the
// workflow has never been persisted or has pending unsaved edits.
export const deriveWorkflowActivityText = ({
  status,
  updatedAt,
  lastRunAt,
  createdAt,
  runTriggered = false,
  sawRunningStatus = false,
  lastRunAtAtTrigger = null,
}: WorkflowActivityInput): string => {
  const timestamp = formatWorkflowTimestamp(updatedAt);
  if (status === "template" || !timestamp) {
    return "";
  }

  const verb = resolveVerb(status, updatedAt, lastRunAt, createdAt, {
    runTriggered,
    sawRunningStatus,
    lastRunAt,
    lastRunAtAtTrigger,
  });
  return `已於 ${timestamp} ${verb}`;
};

function isEffectivelyEqual(a: string, b: string, toleranceMs = 1000): boolean {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff <= toleranceMs;
}

function resolveVerb(
  status: WorkflowActivityInput["status"],
  updatedAt: string | null,
  lastRunAt: string | null,
  createdAt: string | null,
  cycle: WorkflowRunCycleState,
): string {
  if (status === "running") {
    return WORKFLOW_BUILDER_ACTIVITY_LABELS.executed;
  }
  if (status === "published") {
    if (isWorkflowExecutionPending(status, cycle)) {
      return WORKFLOW_BUILDER_ACTIVITY_LABELS.executed;
    }
    return lastRunAt
      ? WORKFLOW_BUILDER_ACTIVITY_LABELS.completed
      : WORKFLOW_BUILDER_ACTIVITY_LABELS.executed;
  }
  return createdAt && updatedAt && isEffectivelyEqual(createdAt, updatedAt)
    ? WORKFLOW_BUILDER_ACTIVITY_LABELS.created
    : WORKFLOW_BUILDER_ACTIVITY_LABELS.saved;
}
