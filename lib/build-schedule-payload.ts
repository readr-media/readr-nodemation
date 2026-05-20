import { slotsToCronExpressions } from "@/lib/schedule-to-cron";
import { useExecutionScheduleStore } from "@/stores/execution-schedule-store";

export type SchedulePayload = {
  // JSON-stringified array of cron expressions, or null when unscheduled.
  cronExpression: string | null;
  // ISO-8601 string of the first upcoming run, or null when unscheduled.
  nextRunAt: string | null;
};

// buildSchedulePayload reads the current execution-schedule store and converts
// it into the cron_expression / next_run_at fields of a workflow save request.
// Both are null when the workflow has no enabled schedule, so a save can also
// clear a previously scheduled workflow. Shared by every save path.
export const buildSchedulePayload = (): SchedulePayload => {
  const schedule = useExecutionScheduleStore.getState();
  const cronList = schedule.enabled
    ? slotsToCronExpressions(schedule.slots)
    : [];
  const cronExpression =
    cronList.length > 0 ? JSON.stringify(cronList) : null;
  const nextRun = schedule.getNextRun();
  return {
    cronExpression,
    nextRunAt: nextRun ? nextRun.toISOString() : null,
  };
};
