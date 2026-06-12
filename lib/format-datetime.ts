// Formats a timestamp as "yyyy/mm/dd hh:mm:ss" in Taipei time. Uses
// formatToParts so the output is deterministic across runtimes/locales
// instead of relying on the locale's default date/time separators.
const workflowTimestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export const formatWorkflowTimestamp = (
  value: string | Date | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = workflowTimestampFormatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${lookup("year")}/${lookup("month")}/${lookup("day")} ${lookup("hour")}:${lookup("minute")}:${lookup("second")}`;
};
