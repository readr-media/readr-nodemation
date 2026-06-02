import type { WorkflowStatus } from "@/lib/workflow-status";

export type PersistAction = "save" | "run";

export type PersistPayload = {
  // Status to send to the backend.
  // - "save" preserves the current status (draft stays draft, published stays
  //   published — schedule keeps firing if it was already active).
  // - "run" promotes the workflow to "published" so the worker's poll query
  //   (`status='published' AND next_run_at <= NOW()`) can pick it up.
  status: WorkflowStatus;
  // ISO-8601 string of the next intended run.
  // - "save" passes through whatever the schedule store computed (null when
  //   no schedule is set).
  // - "run" forces NOW so the worker picks it up on its next poll tick;
  //   after that execution completes, MarkAsExecuted advances next_run_at
  //   based on cron_expression (so an active schedule continues firing).
  nextRunAt: string | null;
};

export type PersistContext = {
  currentStatus: WorkflowStatus;
  scheduledNextRunAt: string | null;
  // Injected for deterministic testing; defaults to the wall clock.
  now?: () => Date;
};

export const buildPersistPayload = (
  action: PersistAction,
  ctx: PersistContext,
): PersistPayload => {
  if (action === "run") {
    const now = ctx.now ? ctx.now() : new Date();
    return { status: "published", nextRunAt: now.toISOString() };
  }
  return {
    status: ctx.currentStatus,
    nextRunAt: ctx.scheduledNextRunAt,
  };
};
