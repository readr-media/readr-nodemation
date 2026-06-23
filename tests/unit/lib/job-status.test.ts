import { describe, expect, it } from "vitest";
import {
  getJobStatusConfig,
  isJobStatus,
  JOB_STATUS_CONFIG,
  JOB_STATUS_LABELS,
} from "@/lib/job-status";

describe("job-status", () => {
  it("recognizes valid job statuses", () => {
    expect(isJobStatus("completed")).toBe(true);
    expect(isJobStatus("failed")).toBe(true);
    expect(isJobStatus("success")).toBe(false);
  });

  it("maps known statuses to labels and badge variants", () => {
    expect(JOB_STATUS_LABELS.completed).toBe("成功");
    expect(JOB_STATUS_CONFIG.failed.variant).toBe("failed");
  });

  it("falls back for unknown statuses", () => {
    const config = getJobStatusConfig("unknown");
    expect(config.label).toBe("unknown");
    expect(config.variant).toBe("failed");
  });
});
