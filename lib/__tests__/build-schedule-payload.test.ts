import { afterEach, describe, expect, test } from "vitest";
import { buildSchedulePayload } from "@/lib/build-schedule-payload";
import { useExecutionScheduleStore } from "@/stores/execution-schedule-store";

afterEach(() => {
  useExecutionScheduleStore.getState().reset();
});

describe("buildSchedulePayload", () => {
  test("returns nulls when no schedule is enabled", () => {
    expect(buildSchedulePayload()).toEqual({
      cronExpression: null,
      nextRunAt: null,
    });
  });

  test("returns a JSON cron array and an ISO next run when enabled", () => {
    const store = useExecutionScheduleStore.getState();
    store.setFrequency("daily");
    store.setSlots([{ id: "1", frequency: "daily", time: "09:00" }]);
    store.setEnabled(true);

    const payload = buildSchedulePayload();
    expect(payload.cronExpression).toBe('["0 9 * * *"]');
    expect(payload.nextRunAt).not.toBeNull();
    expect(
      payload.nextRunAt !== null && !Number.isNaN(Date.parse(payload.nextRunAt)),
    ).toBe(true);
  });

  test("returns null cron when enabled but slots are unconfigured", () => {
    const store = useExecutionScheduleStore.getState();
    store.setFrequency("weekly");
    store.setSlots([
      { id: "1", frequency: "weekly", time: "09:00", daysOfWeek: [] },
    ]);
    store.setEnabled(true);

    expect(buildSchedulePayload().cronExpression).toBeNull();
  });
});
