import type {
  ExecutionFrequency,
  ScheduleSlot,
  Weekday,
} from "@/stores/execution-schedule-store";
import { generateId } from "@/utils/generate-id";

// Cron day-of-week numbering (robfig/cron v3): 0 and 7 are both Sunday.
const CRON_TO_WEEKDAY: Record<number, Weekday> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  7: "sun",
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

// parseCronField accepts the raw cron_expression column value: either a JSON
// array of cron strings (the multi-slot storage format) or a single cron
// string (also accepted for backward compatibility). Returns the cron list.
export const parseCronField = (
  raw: string | null | undefined,
): string[] => {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
    return [];
  }
  return [trimmed];
};

// cronToSlot parses one standard 5-field cron expression back into a schedule
// slot. Returns null when the expression is malformed or uses a shape the
// Schedule dialog cannot represent.
const cronToSlot = (cron: string): ScheduleSlot | null => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return null;
  }
  const [minuteStr, hourStr, domStr, , dowStr] = parts;
  if (!minuteStr || !hourStr || !domStr || !dowStr) {
    return null;
  }
  const minute = Number(minuteStr);
  const hour = Number(hourStr);
  if (
    !Number.isInteger(minute) ||
    !Number.isInteger(hour) ||
    minute < 0 ||
    minute > 59 ||
    hour < 0 ||
    hour > 23
  ) {
    return null;
  }
  const time = `${pad2(hour)}:${pad2(minute)}`;
  const id = generateId();

  if (domStr === "*" && dowStr === "*") {
    return { id, frequency: "daily", time };
  }

  if (domStr === "*" && dowStr !== "*") {
    const daysOfWeek = dowStr
      .split(",")
      .map(Number)
      .filter((value) => Number.isInteger(value))
      .map((value) => CRON_TO_WEEKDAY[value])
      .filter((day): day is Weekday => day !== undefined);
    if (daysOfWeek.length === 0) {
      return null;
    }
    return { id, frequency: "weekly", time, daysOfWeek };
  }

  if (domStr !== "*" && dowStr === "*") {
    const dayOfMonth = Number(domStr);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return null;
    }
    return { id, frequency: "monthly", time, dayOfMonth };
  }

  return null;
};

export type ParsedSchedule = {
  frequency: ExecutionFrequency;
  slots: ScheduleSlot[];
};

// cronToSchedule converts a workflow's stored cron_expression back into
// execution-schedule-store state, so the Schedule dialog can be re-populated
// when editing an existing workflow. Returns null when there is no usable
// schedule. The store keeps a single frequency; the first slot's frequency is
// used (the dialog only ever writes slots that share one frequency).
export const cronToSchedule = (
  raw: string | null | undefined,
): ParsedSchedule | null => {
  const slots = parseCronField(raw)
    .map(cronToSlot)
    .filter((slot): slot is ScheduleSlot => slot !== null);
  const first = slots[0];
  if (!first) {
    return null;
  }
  return { frequency: first.frequency, slots };
};
