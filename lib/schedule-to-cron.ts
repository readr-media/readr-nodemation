import { parseTimeValue } from "@/lib/time-utils";
import type { ScheduleSlot, Weekday } from "@/stores/execution-schedule-store";

// Cron day-of-week numbering for the backend's robfig/cron v3 parser
// (standard 5-field format): Sunday = 0 ... Saturday = 6.
const WEEKDAY_TO_CRON: Record<Weekday, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

// slotToCron converts one configured schedule slot into a standard 5-field
// cron expression "minute hour day-of-month month day-of-week", or null when
// the slot is incomplete. There is no yearly branch on purpose: standard cron
// has no year field, so the "yearly" frequency was dropped from the UI.
const slotToCron = (slot: ScheduleSlot): string | null => {
  const time = parseTimeValue(slot.time);
  if (!time) {
    return null;
  }
  const { hours, minutes } = time;

  if (slot.frequency === "daily") {
    return `${minutes} ${hours} * * *`;
  }

  if (slot.frequency === "weekly") {
    if (slot.daysOfWeek.length === 0) {
      return null;
    }
    const daysOfWeek = slot.daysOfWeek
      .map((day) => WEEKDAY_TO_CRON[day])
      .sort((a, b) => a - b)
      .join(",");
    return `${minutes} ${hours} * * ${daysOfWeek}`;
  }

  if (slot.frequency === "monthly") {
    if (typeof slot.dayOfMonth !== "number") {
      return null;
    }
    return `${minutes} ${hours} ${slot.dayOfMonth} * *`;
  }

  return null;
};

// slotsToCronExpressions converts execution-schedule-store slots into a list
// of cron expressions — one per configured slot, incomplete slots skipped.
// The list is JSON-stringified into the workflow's single cron_expression
// column; the backend parses it back into multiple schedules.
export const slotsToCronExpressions = (slots: ScheduleSlot[]): string[] =>
  slots
    .map(slotToCron)
    .filter((cron): cron is string => cron !== null);
