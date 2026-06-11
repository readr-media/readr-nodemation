import { describe, expect, it } from "vitest";
import {
  isWorkflowExecutionPending,
  isWorkflowRunCompleted,
} from "@/lib/workflow-status";

describe("isWorkflowRunCompleted", () => {
  it("returns true when last_run_at is within tolerance of updated_at", () => {
    expect(
      isWorkflowRunCompleted(
        "2026-06-10T12:00:05.000Z",
        "2026-06-10T12:00:00.000Z",
      ),
    ).toBe(true);
  });

  it("returns false when last_run_at is older than updated_at beyond tolerance", () => {
    expect(
      isWorkflowRunCompleted(
        "2026-06-10T12:00:10.000Z",
        "2026-06-10T12:00:00.000Z",
      ),
    ).toBe(false);
  });
});

describe("isWorkflowExecutionPending", () => {
  const staleLastRun = "2026-06-10T11:00:00.000Z";
  const freshUpdated = "2026-06-10T12:00:00.000Z";

  it("returns true for running status regardless of runTriggered", () => {
    expect(
      isWorkflowExecutionPending("running", freshUpdated, staleLastRun, false),
    ).toBe(true);
  });

  it("does not treat a published save-without-run as pending", () => {
    expect(
      isWorkflowExecutionPending(
        "published",
        freshUpdated,
        staleLastRun,
        false,
      ),
    ).toBe(false);
  });

  it("treats published + runTriggered as pending until run completes", () => {
    expect(
      isWorkflowExecutionPending(
        "published",
        freshUpdated,
        staleLastRun,
        true,
      ),
    ).toBe(true);

    expect(
      isWorkflowExecutionPending(
        "published",
        freshUpdated,
        freshUpdated,
        true,
      ),
    ).toBe(false);
  });

  it("returns false for draft and template", () => {
    expect(
      isWorkflowExecutionPending("draft", freshUpdated, staleLastRun, true),
    ).toBe(false);
    expect(
      isWorkflowExecutionPending("template", freshUpdated, staleLastRun, true),
    ).toBe(false);
  });
});
