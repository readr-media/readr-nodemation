import { afterEach, describe, expect, it, vi } from "vitest";
import { useExecutionScheduleStore } from "@/stores/execution-schedule-store";

describe("execution schedule store monthly rollover", () => {
  afterEach(() => {
    vi.useRealTimers();
    useExecutionScheduleStore.getState().reset();
  });

  it("does not skip February when dayOfMonth is 31 and today's slot has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 31, 12, 0, 0));

    const store = useExecutionScheduleStore.getState();
    store.setEnabled(true);
    store.setFrequency("monthly");
    store.setSlots([
      {
        id: "m31",
        frequency: "monthly",
        dayOfMonth: 31,
        time: "09:00",
      },
    ]);

    const nextRun = useExecutionScheduleStore.getState().getNextRun();

    expect(nextRun).not.toBeNull();
    expect(nextRun?.getFullYear()).toBe(2026);
    expect(nextRun?.getMonth()).toBe(1); // February
    expect(nextRun?.getDate()).toBe(28);
    expect(nextRun?.getHours()).toBe(9);
    expect(nextRun?.getMinutes()).toBe(0);
  });
});
