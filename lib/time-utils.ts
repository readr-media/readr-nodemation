export const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const MAX_HOUR = HOURS_IN_DAY - 1;
const MAX_MINUTE = MINUTES_IN_HOUR - 1;

const defaultTimeParts = { hours: 0, minutes: 0 };

export const parseTimeValue = (time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (
    Number.isNaN(parsedHours) ||
    Number.isNaN(parsedMinutes) ||
    parsedHours < 0 ||
    parsedHours > MAX_HOUR ||
    parsedMinutes < 0 ||
    parsedMinutes > MAX_MINUTE
  ) {
    return null;
  }
  return { hours: parsedHours, minutes: parsedMinutes };
};

export type LocalNowParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type YearlySlotLike = {
  frequency: "yearly";
  month: number | null;
  dayOfMonth: number | null;
  time: string;
};

export const getLocalNowParts = (): LocalNowParts => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
};

export const getNextYearForYearlySlot = (
  slot: YearlySlotLike,
  nowParts: LocalNowParts,
) => {
  const timeParts = parseTimeValue(slot.time) ?? defaultTimeParts;
  const month = slot.month ?? 1;
  const day = slot.dayOfMonth ?? 1;

  const compareParts = (left: number[], right: number[]) => {
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] === right[index]) continue;
      return left[index] < right[index] ? -1 : 1;
    }
    return 0;
  };

  const nowTuple = [
    nowParts.month,
    nowParts.day,
    nowParts.hour,
    nowParts.minute,
  ];
  const targetTuple = [month, day, timeParts.hours, timeParts.minutes];
  const isFutureThisYear = compareParts(nowTuple, targetTuple) < 0;

  return isFutureThisYear ? nowParts.year : nowParts.year + 1;
};
