const THIRTY_DAY_MONTHS = new Set([4, 6, 9, 11]);

export const getYearlyMonthMaxDay = (month: number | null): number => {
  if (!month) return 31;
  if (month === 2) return 29;
  if (THIRTY_DAY_MONTHS.has(month)) return 30;
  return 31;
};

export const isValidYearlyMonthDay = (
  month: number | null,
  day: number | null,
): boolean => {
  if (typeof month !== "number" || typeof day !== "number") return false;
  if (month < 1 || month > 12) return false;
  const maxDay = getYearlyMonthMaxDay(month);
  return day >= 1 && day <= maxDay;
};

export const normalizeYearlyDayForMonthChange = (
  month: number | null,
  day: number | null,
): number | null => {
  if (!month) return null;
  return isValidYearlyMonthDay(month, day) ? day : null;
};
