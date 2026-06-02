import type { WorkflowStatus } from "@/lib/workflow-status";

export type PersistAction = "save" | "run";

export type PersistPayload = {
  // Status to send to the backend.
  // - "save" always sets "draft" — per PRD, 儲存 is a pure form save: a
  //   draft is never auto-run by the worker, and a previously-published
  //   workflow is demoted to draft to pause its schedule until the user
  //   explicitly re-runs.
  // - "run" promotes the workflow to "published" so the worker's poll
  //   query (`status='published' AND next_run_at <= NOW()`) can pick it up.
  status: WorkflowStatus;
  // ISO-8601 string of the next intended run.
  // - "save" passes through whatever the schedule store computed (null
  //   when no schedule is set). The value is harmless while status='draft'
  //   because the worker also filters on status; preserving it means the
  //   schedule UI state stays internally consistent.
  // - "run" forces NOW so the worker picks it up on its next poll tick;
  //   after that execution completes, MarkAsExecuted advances next_run_at
  //   based on cron_expression (so an active schedule continues firing).
  nextRunAt: string | null;
};

export type PersistContext = {
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
    status: "draft",
    nextRunAt: ctx.scheduledNextRunAt,
  };
};
