import type { LucideIcon } from "lucide-react";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

export const JOB_STATUS_VALUES = ["completed", "failed"] as const;

export type JobStatus = (typeof JOB_STATUS_VALUES)[number];

export const JOB_STATUSES: JobStatus[] = [...JOB_STATUS_VALUES];

export const JOB_STATUS_LABELS: Readonly<Record<JobStatus, string>> = {
  completed: "成功",
  failed: "失敗",
};

export type JobStatusBadgeVariant = "success" | "failed";

export type JobStatusConfig = {
  label: string;
  Icon: LucideIcon;
  variant: JobStatusBadgeVariant;
};

export const JOB_STATUS_CONFIG: Readonly<Record<JobStatus, JobStatusConfig>> = {
  completed: { label: "成功", Icon: CircleCheckIcon, variant: "success" },
  failed: { label: "失敗", Icon: XCircleIcon, variant: "failed" },
};

export function isJobStatus(value: string): value is JobStatus {
  return JOB_STATUSES.includes(value as JobStatus);
}

export function getJobStatusConfig(status: string): JobStatusConfig {
  if (isJobStatus(status)) {
    return JOB_STATUS_CONFIG[status];
  }

  return {
    label: status,
    Icon: XCircleIcon,
    variant: "failed",
  };
}
