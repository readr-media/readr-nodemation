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

// The worker stamps `last_run_at` and `updated_at` together when a run
// finishes, but Prisma's `@updatedAt` and the worker's explicit `last_run_at`
// write can differ by a few milliseconds. A small tolerance window lets us
// treat "last_run_at ≈ updated_at" as "this run has completed", while a
// just-submitted run (whose last_run_at is still null or from a previous run)
// stays clearly older than updated_at.
const RUN_COMPLETION_TOLERANCE_MS = 5_000;

const toTime = (value: string | null | undefined): number | null => {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

// True when the most recent run has finished (status is published and
// last_run_at lines up with updated_at), as opposed to a run that was just
// submitted and is still waiting for / being processed by the worker.
export const isWorkflowRunCompleted = (
  updatedAt: string | null | undefined,
  lastRunAt: string | null | undefined,
): boolean => {
  const updatedTime = toTime(updatedAt);
  const lastRunTime = toTime(lastRunAt);
  if (updatedTime === null || lastRunTime === null) {
    return false;
  }
  return lastRunTime >= updatedTime - RUN_COMPLETION_TOLERANCE_MS;
};

// True while the workflow is mid-execution-cycle (submitted/published but not
// yet completed, or actively running). The builder polls for fresh status
// while this is true, then stops once the run settles.
//
// `runTriggered` is client-owned: only a user-initiated Run sets it, so a save
// that bumps updated_at without executing does not start polling.
export const isWorkflowExecutionPending = (
  status: WorkflowStatus,
  updatedAt: string | null | undefined,
  lastRunAt: string | null | undefined,
  runTriggered = false,
): boolean => {
  if (status === "running") {
    return true;
  }
  if (status === "published") {
    if (!runTriggered) {
      return false;
    }
    return !isWorkflowRunCompleted(updatedAt, lastRunAt);
  }
  return false;
};

type WorkflowActivityInput = {
  status: WorkflowStatus;
  updatedAt: string | null;
  lastRunAt: string | null;
  createdAt: string | null;
};

// Builds the grey-text string shown next to the status badge, e.g.
// "已於 2026/06/10 11:50:00 儲存". Falls back to "未儲存變更" when the
// workflow has never been persisted or has pending unsaved edits.
export const deriveWorkflowActivityText = ({
  status,
  updatedAt,
  lastRunAt,
  createdAt,
}: WorkflowActivityInput): string => {
  const timestamp = formatWorkflowTimestamp(updatedAt);
  if (status === "template" || !timestamp) {
    return "";
  }

  const verb = resolveVerb(status, updatedAt, lastRunAt, createdAt);
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
): string {
  if (status === "running") {
    return WORKFLOW_BUILDER_ACTIVITY_LABELS.executed;
  }
  if (status === "published") {
    return lastRunAt && isWorkflowRunCompleted(updatedAt, lastRunAt)
      ? WORKFLOW_BUILDER_ACTIVITY_LABELS.completed
      : WORKFLOW_BUILDER_ACTIVITY_LABELS.executed;
  }
  return createdAt && updatedAt && isEffectivelyEqual(createdAt, updatedAt)
    ? WORKFLOW_BUILDER_ACTIVITY_LABELS.created
    : WORKFLOW_BUILDER_ACTIVITY_LABELS.saved;
}
