"use client";

import { create } from "zustand";
import { parseTimeValue } from "@/lib/time-utils";
import { generateId } from "@/utils/generate-id";

export type ExecutionFrequency = "daily" | "weekly" | "monthly" | "yearly";

export const WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];
export const WEEKDAY_ORDER: readonly Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

type ScheduleSlotBase = {
  id: string;
  time: string; // HH:mm (24h)
};

export type DailyScheduleSlot = ScheduleSlotBase & {
  frequency: "daily";
};

export type WeeklyScheduleSlot = ScheduleSlotBase & {
  frequency: "weekly";
  daysOfWeek: Weekday[];
};

export type MonthlyScheduleSlot = ScheduleSlotBase & {
  frequency: "monthly";
  dayOfMonth: number | null;
};

export type YearlyScheduleSlot = ScheduleSlotBase & {
  frequency: "yearly";
  month: number | null; // 1-12
  dayOfMonth: number | null;
};

export type ScheduleSlot =
  | DailyScheduleSlot
  | WeeklyScheduleSlot
  | MonthlyScheduleSlot
  | YearlyScheduleSlot;

type ExecutionScheduleState = {
  enabled: boolean;
  frequency: ExecutionFrequency;
  slots: ScheduleSlot[];
  lastUpdated?: string;
};

type ExecutionScheduleActions = {
  setEnabled: (enabled: boolean) => void;
  setFrequency: (frequency: ExecutionFrequency) => void;
  setSlots: (slots: ScheduleSlot[]) => void;
  addSlot: (time?: string) => void;
  updateSlot: (id: string, time: string) => void;
  removeSlot: (id: string) => void;
  reset: () => void;
  getNextRun: () => Date | null;
};

export type ExecutionScheduleStore = ExecutionScheduleState &
  ExecutionScheduleActions;

const defaultSlotTime = "09:00";

export const createScheduleSlot = (
  frequency: ExecutionFrequency,
  time: string = defaultSlotTime,
): ScheduleSlot => {
  switch (frequency) {
    case "weekly":
      return { id: generateId(), time, frequency, daysOfWeek: [] };
    case "monthly":
      return { id: generateId(), time, frequency, dayOfMonth: null };
    case "yearly":
      return {
        id: generateId(),
        time,
        frequency,
        month: null,
        dayOfMonth: null,
      };
    default:
      return { id: generateId(), time, frequency: "daily" };
  }
};

const isSlotConfigured = (slot: ScheduleSlot): boolean => {
  if (!slot.time) return false;
  switch (slot.frequency) {
    case "daily":
      return true;
    case "weekly":
      return slot.daysOfWeek.length > 0;
    case "monthly":
      return typeof slot.dayOfMonth === "number";
    case "yearly":
      return (
        typeof slot.month === "number" && typeof slot.dayOfMonth === "number"
      );
    default:
      return false;
  }
};

const setTimeComponents = (date: Date, hours: number, minutes: number) => {
  date.setSeconds(0, 0);
  date.setHours(hours, minutes, 0, 0);
};

const setDayWithClamp = (date: Date, day: number) => {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const targetDay = Math.min(Math.max(1, day), daysInMonth);
  date.setDate(targetDay);
};

const initialState: ExecutionScheduleState = {
  enabled: false,
  frequency: "daily",
  slots: [],
  lastUpdated: undefined,
};

const computeNextRun = (
  frequency: ExecutionFrequency,
  slots: ScheduleSlot[],
) => {
  if (!slots.length) return null;
  const now = new Date();
  const candidates: Date[] = [];

  for (const slot of slots) {
    if (slot.frequency !== frequency || !isSlotConfigured(slot)) continue;
    const parsed = parseTimeValue(slot.time);
    if (!parsed) continue;

    switch (slot.frequency) {
      case "daily": {
        const candidate = new Date(now);
        setTimeComponents(candidate, parsed.hours, parsed.minutes);
        if (candidate <= now) {
          candidate.setDate(candidate.getDate() + 1);
        }
        candidates.push(candidate);
        break;
      }
      case "weekly": {
        for (const day of slot.daysOfWeek) {
          const candidate = new Date(now);
          setTimeComponents(candidate, parsed.hours, parsed.minutes);
          const dayIndex = WEEKDAY_ORDER.indexOf(day);
          const currentDayIndex = candidate.getDay();
          const offset = (dayIndex - currentDayIndex + 7) % 7;
          candidate.setDate(candidate.getDate() + offset);
          if (candidate <= now) {
            candidate.setDate(candidate.getDate() + 7);
          }
          candidates.push(candidate);
        }
        break;
      }
      case "monthly": {
        const targetDay = slot.dayOfMonth ?? 1;
        const candidate = new Date(now);
        setTimeComponents(candidate, parsed.hours, parsed.minutes);
        setDayWithClamp(candidate, targetDay);
        if (candidate <= now) {
          candidate.setMonth(candidate.getMonth() + 1);
          setDayWithClamp(candidate, targetDay);
        }
        candidates.push(candidate);
        break;
      }
      case "yearly": {
        const targetMonth = (slot.month ?? 1) - 1;
        const targetDay = slot.dayOfMonth ?? 1;
        const candidate = new Date(now);
        setTimeComponents(candidate, parsed.hours, parsed.minutes);
        candidate.setMonth(targetMonth, 1);
        setDayWithClamp(candidate, targetDay);
        if (candidate <= now) {
          candidate.setFullYear(candidate.getFullYear() + 1);
          candidate.setMonth(targetMonth, 1);
          setDayWithClamp(candidate, targetDay);
        }
        candidates.push(candidate);
        break;
      }
      default:
        break;
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0];
};

const timestamp = () => new Date().toISOString();

export const useExecutionScheduleStore = create<ExecutionScheduleStore>()(
  (set, get) => ({
    ...initialState,
    setEnabled: (enabled) =>
      set(() => ({
        enabled,
        lastUpdated: timestamp(),
      })),
    setFrequency: (frequency) =>
      set(() => ({
        frequency,
        lastUpdated: timestamp(),
      })),
    setSlots: (slots) =>
      set(() => ({
        slots,
        lastUpdated: timestamp(),
      })),
    addSlot: (time) =>
      set((state) => ({
        slots: [...state.slots, createScheduleSlot(state.frequency, time)],
        lastUpdated: timestamp(),
      })),
    updateSlot: (id, time) =>
      set((state) => ({
        slots: state.slots.map((slot) =>
          slot.id === id ? { ...slot, time } : slot,
        ),
        lastUpdated: timestamp(),
      })),
    removeSlot: (id) =>
      set((state) => ({
        slots: state.slots.filter((slot) => slot.id !== id),
        lastUpdated: timestamp(),
      })),
    reset: () =>
      set(() => ({
        ...initialState,
        lastUpdated: timestamp(),
      })),
    getNextRun: () => {
      const { enabled, slots, frequency } = get();
      if (!enabled || !slots.length) {
        return null;
      }
      return computeNextRun(frequency, slots);
    },
  }),
);
