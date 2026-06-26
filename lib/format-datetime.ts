// Formats timestamps in Taipei time via formatToParts so output is deterministic
// across runtimes/locales instead of relying on locale default separators.
const TAIPEI_DATE_TIME_OPTIONS = {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
} as const;

const workflowTimestampFormatter = new Intl.DateTimeFormat("en-US", {
  ...TAIPEI_DATE_TIME_OPTIONS,
  second: "2-digit",
});

const jobStartedAtFormatter = new Intl.DateTimeFormat("en-US", {
  ...TAIPEI_DATE_TIME_OPTIONS,
});

function formatTaipeiTimestamp(
  value: string | Date | null | undefined,
  formatter: Intl.DateTimeFormat,
  includeSeconds: boolean,
): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = formatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const time = includeSeconds
    ? `${lookup("hour")}:${lookup("minute")}:${lookup("second")}`
    : `${lookup("hour")}:${lookup("minute")}`;

  return `${lookup("year")}/${lookup("month")}/${lookup("day")} ${time}`;
}

export const formatWorkflowTimestamp = (
  value: string | Date | null | undefined,
): string | null => formatTaipeiTimestamp(value, workflowTimestampFormatter, true);

export const formatJobStartedAt = (
  value: string | Date | null | undefined,
): string | null => formatTaipeiTimestamp(value, jobStartedAtFormatter, false);
