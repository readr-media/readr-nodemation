import {
  isSchedulePayload,
  isSlotPayload,
} from "@/lib/schedule-import-validation";

describe("schedule import validation", () => {
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
});
