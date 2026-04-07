import {
  getYearlyMonthMaxDay,
  isValidYearlyMonthDay,
  normalizeYearlyDayForMonthChange,
} from "@/lib/schedule-yearly-date-utils";

describe("yearly date rules", () => {
  it("allows Feb 29 for yearly recurrence", () => {
    expect(getYearlyMonthMaxDay(2)).toBe(29);
  });

  it("marks Apr 31 as invalid", () => {
    expect(isValidYearlyMonthDay(4, 31)).toBe(false);
  });

  it("clears day when month change makes day invalid", () => {
    expect(normalizeYearlyDayForMonthChange(4, 31)).toBeNull();
  });

  it("keeps day when month change remains valid", () => {
    expect(normalizeYearlyDayForMonthChange(3, 31)).toBe(31);
  });
});
