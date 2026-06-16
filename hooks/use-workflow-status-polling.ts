"use client";

import { useEffect } from "react";
import {
  isWorkflowExecutionPending,
  type WorkflowStatus,
} from "@/lib/workflow-status";
import { useWorkflowEditorStore } from "@/stores/workflow-editor/store";

// Escalating poll delays: quick first checks so short runs feel snappy, then
// back off so a long-running job (e.g. a couple of minutes) doesn't hammer the
// API. The last value is the steady-state interval once the run drags on.
const POLL_STEPS_MS = [3_000, 5_000, 10_000, 20_000, 30_000] as const;

// Safety net: stop polling after this long even if the run never settles, so a
// stuck backend can't keep an open tab polling forever.
const MAX_POLL_DURATION_MS = 10 * 60 * 1_000;

type WorkflowStatusResponse = {
  status?: WorkflowStatus;
  updated_at?: string | null;
  last_run_at?: string | null;
};

// Polls the workflow detail endpoint while a run is in flight so the builder
// header reflects backend-driven transitions (published → running → published)
// that the client can't otherwise observe. Polling is conditional: it only runs
// while the workflow is in a pending execution state and stops as soon as the
// run settles, so an idle/draft workflow never issues requests.
//
// Implementation notes:
// - A self-rescheduling setTimeout (instead of setInterval) guarantees requests
//   never stack if one is slow, and lets the delay grow via POLL_STEPS_MS.
// - The store is read fresh on every tick to avoid stale-closure bugs.
// - Polling pauses while the tab is hidden and resumes (responsively) on focus.
export const useWorkflowStatusPolling = () => {
  const workflowId = useWorkflowEditorStore((state) => state.workflowId);
  const isPending = useWorkflowEditorStore((state) =>
    isWorkflowExecutionPending(state.status, {
      runTriggered: state.runTriggered,
      sawRunningStatus: state.sawRunningStatus,
      lastRunAt: state.lastRunAt,
      lastRunAtAtTrigger: state.lastRunAtAtTrigger,
    }),
  );

  useEffect(() => {
    if (!workflowId || !isPending) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stepIndex = 0;
    const startedAt = Date.now();
    const controller = new AbortController();

    const stillPending = () => {
      const state = useWorkflowEditorStore.getState();
      return isWorkflowExecutionPending(state.status, {
        runTriggered: state.runTriggered,
        sawRunningStatus: state.sawRunningStatus,
        lastRunAt: state.lastRunAt,
        lastRunAtAtTrigger: state.lastRunAtAtTrigger,
      });
    };

    const scheduleNext = () => {
      if (cancelled || timer) {
        return;
      }
      if (!stillPending()) {
        return;
      }
      if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        return;
      }
      // Paused while hidden; the visibility handler resumes polling on focus.
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }

      const delay =
        POLL_STEPS_MS[Math.min(stepIndex, POLL_STEPS_MS.length - 1)];
      stepIndex += 1;
      timer = setTimeout(poll, delay);
    };

    const poll = async () => {
      timer = undefined;

      try {
        const response = await fetch(`/api/workflows/${workflowId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!cancelled && response.ok) {
          const workflow = (await response.json()) as WorkflowStatusResponse;
          if (!cancelled && workflow.status) {
            useWorkflowEditorStore.getState().syncServerStatus({
              status: workflow.status,
              updatedAt: workflow.updated_at ?? null,
              lastRunAt: workflow.last_run_at ?? null,
            });
          }
        }
      } catch {
        // Swallow transient/abort errors; the next tick (if still pending)
        // will retry.
      }

      scheduleNext();
    };

    const handleVisibilityChange = () => {
      if (cancelled || typeof document === "undefined") {
        return;
      }
      if (document.hidden) {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
        return;
      }
      // Back in focus: check again promptly instead of waiting out the backoff.
      stepIndex = 0;
      scheduleNext();
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    scheduleNext();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
      controller.abort();
      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, [workflowId, isPending]);
};
