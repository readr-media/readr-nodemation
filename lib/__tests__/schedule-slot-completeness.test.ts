import { isScheduleSlotCompleteForDialog } from "@/lib/schedule-slot-completeness";

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
