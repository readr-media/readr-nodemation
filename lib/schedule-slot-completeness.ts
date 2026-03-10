import { isValidYearlyMonthDay } from "@/lib/schedule-yearly-date-utils";
import type { ScheduleSlot } from "@/stores/execution-schedule-store";

export const canConfigureSlotTime = (slot: ScheduleSlot): boolean => {
  switch (slot.frequency) {
    case "daily":
      return true;
    case "weekly":
      return slot.daysOfWeek.length > 0;
    case "monthly":
      return typeof slot.dayOfMonth === "number";
    case "yearly":
      return isValidYearlyMonthDay(slot.month, slot.dayOfMonth);
    default:
      return false;
  }
};

export const isScheduleSlotCompleteForDialog = (slot: ScheduleSlot): boolean =>
  canConfigureSlotTime(slot) && Boolean(slot.time);
