import { describe, expect, it } from "vitest";
import {
  isWorkflowExecutionPending,
  isWorkflowRunCompleted,
} from "@/lib/workflow-status";

const cycle = (
  overrides: Partial<{
    runTriggered: boolean;
    sawRunningStatus: boolean;
    lastRunAt: string | null;
    lastRunAtAtTrigger: string | null;
  }> = {},
) => ({
  runTriggered: false,
  sawRunningStatus: false,
  lastRunAt: null,
  lastRunAtAtTrigger: null,
  ...overrides,
});

describe("isWorkflowRunCompleted", () => {
  it("returns true after published → running → published", () => {
    expect(
      isWorkflowRunCompleted(
        "published",
        cycle({ runTriggered: true, sawRunningStatus: true }),
      ),
    ).toBe(true);
  });

  it("returns true when last_run_at advances past the trigger snapshot", () => {
    expect(
      isWorkflowRunCompleted(
        "published",
        cycle({
          runTriggered: true,
          lastRunAt: "2026-06-15T09:24:10.862Z",
          lastRunAtAtTrigger: "2026-06-12T02:26:08.653Z",
        }),
      ),
    ).toBe(true);
  });

  it("returns false while waiting for the worker to pick up the run", () => {
    expect(
      isWorkflowRunCompleted(
        "published",
        cycle({
          runTriggered: true,
          lastRunAt: "2026-06-12T02:26:08.653Z",
          lastRunAtAtTrigger: "2026-06-12T02:26:08.653Z",
        }),
      ),
    ).toBe(false);
  });

  it("does not treat a long execution gap between last_run_at and updated_at as incomplete", () => {
    expect(
      isWorkflowRunCompleted(
        "published",
        cycle({
          runTriggered: true,
          sawRunningStatus: true,
          lastRunAt: "2026-06-15T09:24:10.862Z",
          lastRunAtAtTrigger: "2026-06-12T02:26:08.653Z",
        }),
      ),
    ).toBe(true);
  });
});

describe("isWorkflowExecutionPending", () => {
  const staleLastRun = "2026-06-10T11:00:00.000Z";

  it("returns true for running status regardless of runTriggered", () => {
    expect(
      isWorkflowExecutionPending(
        "running",
        cycle({ lastRunAt: staleLastRun }),
      ),
    ).toBe(true);
  });

  it("does not treat a published save-without-run as pending", () => {
    expect(
      isWorkflowExecutionPending(
        "published",
        cycle({ lastRunAt: staleLastRun }),
      ),
    ).toBe(false);
  });

  it("treats published + runTriggered as pending until run completes", () => {
    expect(
      isWorkflowExecutionPending(
        "published",
        cycle({
          runTriggered: true,
          lastRunAt: staleLastRun,
          lastRunAtAtTrigger: staleLastRun,
        }),
      ),
    ).toBe(true);

    expect(
      isWorkflowExecutionPending(
        "published",
        cycle({
          runTriggered: true,
          sawRunningStatus: true,
          lastRunAt: staleLastRun,
        }),
      ),
    ).toBe(false);
  });

  it("returns false for draft and template", () => {
    expect(
      isWorkflowExecutionPending(
        "draft",
        cycle({ runTriggered: true, lastRunAt: staleLastRun }),
      ),
    ).toBe(false);
    expect(
      isWorkflowExecutionPending(
        "template",
        cycle({ runTriggered: true, lastRunAt: staleLastRun }),
      ),
    ).toBe(false);
  });
});
