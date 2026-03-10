import {
  canConfigureSlotTime,
  isScheduleSlotCompleteForDialog,
} from "@/lib/schedule-slot-completeness";

describe("schedule readiness/completeness consistency", () => {
  it("derives completeness from readiness and time", () => {
    const slots = [
      {
        id: "a",
        frequency: "yearly" as const,
        month: 4,
        dayOfMonth: 31,
        time: "09:00",
      },
      {
        id: "b",
        frequency: "yearly" as const,
        month: 2,
        dayOfMonth: 29,
        time: "09:00",
      },
      {
        id: "c",
        frequency: "weekly" as const,
        daysOfWeek: ["mon"] as const,
        time: "",
      },
    ];

    for (const slot of slots) {
      expect(isScheduleSlotCompleteForDialog(slot)).toBe(
        canConfigureSlotTime(slot) && Boolean(slot.time),
      );
    }
  });
});
