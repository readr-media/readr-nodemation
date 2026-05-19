import { describe, expect, test } from "vitest";
import { slotsToCronExpressions } from "@/lib/schedule-to-cron";
import type { ScheduleSlot } from "@/stores/execution-schedule-store";

describe("slotsToCronExpressions", () => {
  test("daily slot becomes a once-a-day cron", () => {
    const slots: ScheduleSlot[] = [
      { id: "1", frequency: "daily", time: "09:00" },
    ];
    expect(slotsToCronExpressions(slots)).toEqual(["0 9 * * *"]);
  });

  test("daily slot keeps non-zero minutes", () => {
    const slots: ScheduleSlot[] = [
      { id: "1", frequency: "daily", time: "14:30" },
    ];
    expect(slotsToCronExpressions(slots)).toEqual(["30 14 * * *"]);
  });

  test("weekly slot lists day-of-week numbers (mon=1)", () => {
    const slots: ScheduleSlot[] = [
      {
        id: "1",
        frequency: "weekly",
        time: "09:00",
        daysOfWeek: ["mon", "wed"],
      },
    ];
    expect(slotsToCronExpressions(slots)).toEqual(["0 9 * * 1,3"]);
  });

  test("weekly slot maps sunday to 0 and sorts ascending", () => {
    const slots: ScheduleSlot[] = [
      {
        id: "1",
        frequency: "weekly",
        time: "08:00",
        daysOfWeek: ["fri", "sun"],
      },
    ];
    expect(slotsToCronExpressions(slots)).toEqual(["0 8 * * 0,5"]);
  });

  test("monthly slot pins the day-of-month", () => {
    const slots: ScheduleSlot[] = [
      { id: "1", frequency: "monthly", time: "23:15", dayOfMonth: 15 },
    ];
    expect(slotsToCronExpressions(slots)).toEqual(["15 23 15 * *"]);
  });

  test("multiple slots produce one cron each, in order", () => {
    const slots: ScheduleSlot[] = [
      { id: "1", frequency: "weekly", time: "09:00", daysOfWeek: ["mon"] },
      { id: "2", frequency: "weekly", time: "14:00", daysOfWeek: ["wed"] },
    ];
    expect(slotsToCronExpressions(slots)).toEqual([
      "0 9 * * 1",
      "0 14 * * 3",
    ]);
  });

  test("skips unconfigured slots", () => {
    const slots: ScheduleSlot[] = [
      { id: "1", frequency: "weekly", time: "09:00", daysOfWeek: [] },
      { id: "2", frequency: "monthly", time: "09:00", dayOfMonth: null },
      { id: "3", frequency: "daily", time: "" },
    ];
    expect(slotsToCronExpressions(slots)).toEqual([]);
  });
});
