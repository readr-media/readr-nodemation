import {
  canConfigureSlotTime,
  isScheduleSlotCompleteForDialog,
} from "@/lib/schedule-slot-completeness";

describe("schedule slot readiness", () => {
  it("treats daily slot as ready", () => {
    const slot = {
      id: "d1",
      frequency: "daily" as const,
      time: "09:00",
    };

    expect(canConfigureSlotTime(slot)).toBe(true);
  });

  it("requires weekday selection for weekly slot", () => {
    const slot = {
      id: "w1",
      frequency: "weekly" as const,
      daysOfWeek: [],
      time: "09:00",
    };

    expect(canConfigureSlotTime(slot)).toBe(false);
  });

  it("requires day for monthly slot", () => {
    const slot = {
      id: "m1",
      frequency: "monthly" as const,
      dayOfMonth: null,
      time: "09:00",
    };

    expect(canConfigureSlotTime(slot)).toBe(false);
  });

  it("treats yearly slot with invalid day/month as not ready", () => {
    const slot = {
      id: "y1",
      frequency: "yearly" as const,
      month: 4,
      dayOfMonth: 31,
      time: "09:00",
    };

    expect(canConfigureSlotTime(slot)).toBe(false);
  });

  it("treats valid yearly slot as ready", () => {
    const slot = {
      id: "y2",
      frequency: "yearly" as const,
      month: 2,
      dayOfMonth: 29,
      time: "09:00",
    };

    expect(canConfigureSlotTime(slot)).toBe(true);
  });
});

describe("schedule slot completeness", () => {
  it("treats yearly slot with invalid day/month as incomplete", () => {
    const slot = {
      id: "1",
      frequency: "yearly" as const,
      month: 4,
      dayOfMonth: 31,
      time: "09:00",
    };

    expect(isScheduleSlotCompleteForDialog(slot)).toBe(false);
  });

  it("treats valid yearly slot as complete", () => {
    const slot = {
      id: "2",
      frequency: "yearly" as const,
      month: 2,
      dayOfMonth: 29,
      time: "09:00",
    };

    expect(isScheduleSlotCompleteForDialog(slot)).toBe(true);
  });
});
