import {
  isSchedulePayload,
  isSlotPayload,
} from "@/lib/schedule-import-validation";

describe("schedule import validation", () => {
  it("rejects weekly slot with empty daysOfWeek", () => {
    const slot = {
      id: "w-empty",
      time: "09:00",
      frequency: "weekly" as const,
      daysOfWeek: [],
    };

    expect(isSlotPayload(slot)).toBe(false);
  });

  it("rejects slot with malformed time value", () => {
    const slot = {
      id: "bad-time",
      time: "25:99",
      frequency: "daily" as const,
    };

    expect(isSlotPayload(slot)).toBe(false);
  });

  it("rejects yearly slot with impossible month/day", () => {
    const slot = {
      id: "y1",
      time: "09:00",
      frequency: "yearly" as const,
      month: 4,
      dayOfMonth: 31,
    };

    expect(isSlotPayload(slot)).toBe(false);
  });

  it("accepts yearly slot with valid month/day", () => {
    const slot = {
      id: "y2",
      time: "09:00",
      frequency: "yearly" as const,
      month: 2,
      dayOfMonth: 29,
    };

    expect(isSlotPayload(slot)).toBe(true);
  });

  it("rejects schedule payload containing invalid yearly slot", () => {
    const schedule = {
      enabled: true,
      frequency: "yearly" as const,
      slots: [
        {
          id: "y3",
          time: "09:00",
          frequency: "yearly" as const,
          month: 4,
          dayOfMonth: 31,
        },
      ],
    };

    expect(isSchedulePayload(schedule)).toBe(false);
  });

  it("rejects schedule payload when slot frequencies do not match schedule frequency", () => {
    const schedule = {
      enabled: true,
      frequency: "daily" as const,
      slots: [
        {
          id: "w1",
          time: "09:00",
          frequency: "weekly" as const,
          daysOfWeek: ["mon"] as const,
        },
      ],
    };

    expect(isSchedulePayload(schedule)).toBe(false);
  });
});
