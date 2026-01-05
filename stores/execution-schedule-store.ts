"use client";

import { create } from "zustand";
import { generateId } from "@/utils/generate-id";

export type ExecutionFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type ScheduleSlot = {
  id: string;
  time: string; // HH:mm (24h)
};

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

export const createScheduleSlot = (time: string = defaultSlotTime): ScheduleSlot => ({
  id: generateId(),
  time,
});

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
  const sorted = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  const [hours, minutes] = sorted[0]?.time.split(":").map(Number) ?? [0, 0];
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(hours ?? 0, minutes ?? 0);
  if (next <= now) {
    const dayOffset = frequency === "yearly" ? 365 : frequency === "monthly" ? 30 : frequency === "weekly" ? 7 : 1;
    next.setDate(next.getDate() + dayOffset);
  }
  return next;
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
        slots: [...state.slots, createScheduleSlot(time)],
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
