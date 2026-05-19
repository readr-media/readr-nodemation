import { describe, expect, test } from "vitest";
import { cronToSchedule, parseCronField } from "@/lib/cron-to-schedule";

describe("parseCronField", () => {
  test("returns [] for null/empty", () => {
    expect(parseCronField(null)).toEqual([]);
    expect(parseCronField(undefined)).toEqual([]);
    expect(parseCronField("")).toEqual([]);
  });

  test("wraps a single cron string in an array", () => {
    expect(parseCronField("0 9 * * *")).toEqual(["0 9 * * *"]);
  });

  test("parses a JSON array of cron strings", () => {
    expect(parseCronField('["0 9 * * 1","0 14 * * 3"]')).toEqual([
      "0 9 * * 1",
      "0 14 * * 3",
    ]);
  });

  test("returns [] for malformed JSON", () => {
    expect(parseCronField("[broken")).toEqual([]);
  });
});

describe("cronToSchedule", () => {
  test("returns null when there is no schedule", () => {
    expect(cronToSchedule(null)).toBeNull();
    expect(cronToSchedule("")).toBeNull();
  });

  test("parses a daily cron", () => {
    const result = cronToSchedule("30 14 * * *");
    expect(result?.frequency).toBe("daily");
    expect(result?.slots).toHaveLength(1);
    expect(result?.slots[0]).toMatchObject({
      frequency: "daily",
      time: "14:30",
    });
  });

  test("parses a weekly cron with day-of-week list", () => {
    const result = cronToSchedule("0 9 * * 1,3");
    expect(result?.frequency).toBe("weekly");
    expect(result?.slots[0]).toMatchObject({
      frequency: "weekly",
      time: "09:00",
      daysOfWeek: ["mon", "wed"],
    });
  });

  test("maps day-of-week 0 to sunday", () => {
    const result = cronToSchedule("0 8 * * 0");
    expect(result?.slots[0]).toMatchObject({ daysOfWeek: ["sun"] });
  });

  test("parses a monthly cron", () => {
    const result = cronToSchedule("15 23 15 * *");
    expect(result?.frequency).toBe("monthly");
    expect(result?.slots[0]).toMatchObject({
      frequency: "monthly",
      time: "23:15",
      dayOfMonth: 15,
    });
  });

  test("parses a JSON array into multiple slots", () => {
    const result = cronToSchedule('["0 9 * * 1","0 14 * * 3"]');
    expect(result?.frequency).toBe("weekly");
    expect(result?.slots).toHaveLength(2);
  });

  test("round-trips through slotsToCronExpressions", async () => {
    const { slotsToCronExpressions } = await import("@/lib/schedule-to-cron");
    const result = cronToSchedule('["0 9 * * 1,3","30 14 * * 5"]');
    expect(result).not.toBeNull();
    if (result) {
      expect(slotsToCronExpressions(result.slots)).toEqual([
        "0 9 * * 1,3",
        "30 14 * * 5",
      ]);
    }
  });

  test("returns null for an unparseable cron", () => {
    expect(cronToSchedule("not a cron")).toBeNull();
  });

  test("rejects a cron pinned to a specific month", () => {
    // "0 0 1 1 *" is a yearly (Jan 1) schedule — not representable as a slot.
    expect(cronToSchedule("0 0 1 1 *")).toBeNull();
  });
});
