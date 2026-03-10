import { isValidYearlyMonthDay } from "@/lib/schedule-yearly-date-utils";
import { parseTimeValue } from "@/lib/time-utils";
import {
  type ExecutionScheduleStore,
  type ScheduleSlot,
  WEEKDAYS,
  type Weekday,
} from "@/stores/execution-schedule-store";

export type ImportedSchedulePayload = Pick<
  ExecutionScheduleStore,
  "enabled" | "frequency" | "slots" | "lastUpdated"
>;

const isWeekdayValue = (value: unknown): value is Weekday =>
  typeof value === "string" && WEEKDAYS.includes(value as Weekday);

export const isSlotPayload = (slot: unknown): slot is ScheduleSlot => {
  if (!slot || typeof slot !== "object") return false;
  const { id, time, frequency } = slot as {
    id?: unknown;
    time?: unknown;
    frequency?: unknown;
  };

  if (
    typeof id !== "string" ||
    typeof time !== "string" ||
    parseTimeValue(time) === null
  ) {
    return false;
  }
  if (
    frequency !== "daily" &&
    frequency !== "weekly" &&
    frequency !== "monthly" &&
    frequency !== "yearly"
  ) {
    return false;
  }

  if (frequency === "weekly") {
    const { daysOfWeek } = slot as { daysOfWeek?: unknown };
    return Array.isArray(daysOfWeek) && daysOfWeek.every(isWeekdayValue);
  }

  if (frequency === "monthly") {
    const { dayOfMonth } = slot as { dayOfMonth?: unknown };
    return (
      typeof dayOfMonth === "number" &&
      Number.isInteger(dayOfMonth) &&
      dayOfMonth >= 1 &&
      dayOfMonth <= 31
    );
  }

  if (frequency === "yearly") {
    const { month, dayOfMonth } = slot as {
      month?: unknown;
      dayOfMonth?: unknown;
    };

    return (
      typeof month === "number" &&
      Number.isInteger(month) &&
      typeof dayOfMonth === "number" &&
      Number.isInteger(dayOfMonth) &&
      isValidYearlyMonthDay(month, dayOfMonth)
    );
  }

  return true;
};

export const isSchedulePayload = (
  value: unknown,
): value is ImportedSchedulePayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    enabled?: unknown;
    frequency?: unknown;
    slots?: unknown;
  };

  if (typeof candidate.enabled !== "boolean") return false;
  if (
    candidate.frequency !== "daily" &&
    candidate.frequency !== "weekly" &&
    candidate.frequency !== "monthly" &&
    candidate.frequency !== "yearly"
  ) {
    return false;
  }
  if (!Array.isArray(candidate.slots)) return false;

  return candidate.slots.every((slot) => {
    if (!isSlotPayload(slot)) {
      return false;
    }
    return slot.frequency === candidate.frequency;
  });
};
