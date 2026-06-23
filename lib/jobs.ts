import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isJobStatus } from "@/lib/job-status";
import { prisma } from "@/lib/prisma";

export type JobListItem = {
  id: string;
  name: string;
  startedAt: string | null;
  status: string;
  workflowSnapshot: unknown | null;
};

export type JobListFilters = {
  timeRange: string;
  status: string;
  page: number;
  pageSize: number;
};

export type JobListResult = {
  items: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
};

const TAIPEI_TIME_ZONE = "Asia/Taipei";

function getTaipeiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(lookup("year")),
    month: Number(lookup("month")),
    day: Number(lookup("day")),
  };
}

function toUtcDateFromTaipei(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const displayed = Date.UTC(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    lookup("hour"),
    lookup("minute"),
    lookup("second"),
  );

  const offsetMs = displayed - utcGuess;
  return new Date(utcGuess - offsetMs);
}

function startOfTaipeiDay(date: Date): Date {
  const { year, month, day } = getTaipeiDateParts(date);
  return toUtcDateFromTaipei(year, month, day, 0, 0, 0, 0);
}

function endOfTaipeiDay(date: Date): Date {
  const { year, month, day } = getTaipeiDateParts(date);
  return toUtcDateFromTaipei(year, month, day, 23, 59, 59, 999);
}

export function buildJobStartedAtFilter(
  timeRange: string,
  now: Date = new Date(),
): Prisma.DateTimeNullableFilter | undefined {
  if (timeRange === "all") {
    return undefined;
  }

  if (timeRange === "today") {
    return {
      gte: startOfTaipeiDay(now),
      lte: endOfTaipeiDay(now),
    };
  }

  const days =
    timeRange === "7d"
      ? 7
      : timeRange === "30d"
        ? 30
        : timeRange === "60d"
          ? 60
          : null;

  if (!days) {
    return undefined;
  }

  const start = startOfTaipeiDay(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  return {
    gte: start,
    lte: endOfTaipeiDay(now),
  };
}

function parseWorkflowSnapshot(value: string | null): unknown | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export async function getUserJobs(
  userId: string | null,
  filters: JobListFilters,
): Promise<JobListResult> {
  noStore();

  const page = Math.max(1, filters.page);
  const pageSize = Math.max(1, filters.pageSize);

  if (!userId) {
    return { items: [], total: 0, page, pageSize };
  }

  const startedAtFilter = buildJobStartedAtFilter(filters.timeRange);
  const where: Prisma.JobWhereInput = {
    workflow: { user_id: userId },
    ...(startedAtFilter ? { started_at: startedAtFilter } : {}),
    ...(filters.status !== "all" && isJobStatus(filters.status)
      ? { status: filters.status }
      : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ started_at: { sort: "desc", nulls: "last" } }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        started_at: true,
        status: true,
        workflow_snapshot: true,
        workflow: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    items: jobs.map((job) => ({
      id: job.id,
      name: job.name ?? job.workflow.name ?? "未命名工作流",
      startedAt: job.started_at?.toISOString() ?? null,
      status: job.status,
      workflowSnapshot: parseWorkflowSnapshot(job.workflow_snapshot),
    })),
    total,
    page,
    pageSize,
  };
}

export function resolveJobDisplayName(
  jobName: string | null | undefined,
  workflowName: string | null | undefined,
): string {
  return jobName ?? workflowName ?? "未命名工作流";
}
