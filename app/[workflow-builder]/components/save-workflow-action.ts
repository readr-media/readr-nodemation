"use client";

import type { Edge, Node } from "@xyflow/react";
import type { WorkflowStatus } from "@/lib/workflow-status";
import type { ServerStatusSnapshot } from "@/stores/workflow-editor/store";

type SaveMode = "update" | "save-as-new";

type SaveWorkflowInput = {
  mode: SaveMode;
  workflowId: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes: Node[];
  edges: Edge[];
  // cronExpression: JSON-stringified array of cron expressions, or null when
  // the workflow has no schedule. nextRunAt: ISO-8601 string of the first
  // upcoming run, or null. Both come from the execution-schedule store.
  cronExpression: string | null;
  nextRunAt: string | null;
  fetchImpl: typeof fetch;
  resetBaseline: (snapshot: {
    workflowId: string;
    sourceWorkflowId: string;
    nodes: Node[];
    edges: Edge[];
    status?: WorkflowStatus;
  }) => void;
  syncServerStatus: (snapshot: ServerStatusSnapshot) => void;
  setCreatedAt: (createdAt: string | null) => void;
};

type SavedWorkflowResponse = {
  id?: string;
  count?: number;
  status?: WorkflowStatus;
  updated_at?: string | null;
  last_run_at?: string | null;
  created_at?: string | null;
};

const buildRequest = ({
  mode,
  workflowId,
  name,
  description,
  status,
  nodes,
  edges,
  cronExpression,
  nextRunAt,
}: Omit<
  SaveWorkflowInput,
  "fetchImpl" | "resetBaseline" | "syncServerStatus" | "setCreatedAt"
>) => {
  // Always send cron_expression / next_run_at. An explicit null clears a
  // previously scheduled workflow; a value sets or updates the schedule.
  const scheduleFields = {
    cron_expression: cronExpression,
    next_run_at: nextRunAt,
  };

  if (mode === "update") {
    if (!workflowId) {
      throw new Error("Workflow id is required for updates");
    }

    return {
      url: `/api/workflows/${workflowId}`,
      method: "PUT" as const,
      body: {
        name,
        description,
        status,
        nodes,
        edges,
        ...scheduleFields,
      },
    };
  }

  return {
    url: "/api/workflows",
    method: "POST" as const,
    body: {
      name,
      description,
      status,
      nodes,
      edges,
      ...scheduleFields,
    },
  };
};

const buildServerStatusSnapshot = (
  savedWorkflow: SavedWorkflowResponse,
  fallbackStatus: WorkflowStatus,
): ServerStatusSnapshot => ({
  status: savedWorkflow.status ?? fallbackStatus,
  updatedAt: savedWorkflow.updated_at ?? null,
  lastRunAt: savedWorkflow.last_run_at ?? null,
});

export const saveWorkflow = async ({
  mode,
  workflowId,
  name,
  description,
  status,
  nodes,
  edges,
  cronExpression,
  nextRunAt,
  fetchImpl,
  resetBaseline,
  syncServerStatus,
  setCreatedAt,
}: SaveWorkflowInput) => {
  const request = buildRequest({
    mode,
    workflowId,
    name,
    description,
    status,
    nodes,
    edges,
    cronExpression,
    nextRunAt,
  });

  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Failed to save workflow");
  }

  const savedWorkflow = (await response.json()) as SavedWorkflowResponse;
  const nextWorkflowId = mode === "update" ? workflowId : savedWorkflow.id;

  if (!nextWorkflowId) {
    throw new Error("Saved workflow id is missing");
  }

  const nextStatus = savedWorkflow.status ?? status;

  resetBaseline({
    workflowId: nextWorkflowId,
    sourceWorkflowId: nextWorkflowId,
    nodes,
    edges,
    status: nextStatus,
  });

  // PUT/PATCH responses come from findFirst; POST returns the full workflow.
  // Prefer the server's authoritative timestamps for the header.
  syncServerStatus(buildServerStatusSnapshot(savedWorkflow, status));

  // createdAt is immutable — only set once when a new workflow is first created.
  if (mode === "save-as-new" && savedWorkflow.created_at !== undefined) {
    setCreatedAt(savedWorkflow.created_at);
  }

  return {
    workflowId: nextWorkflowId,
    sourceWorkflowId: nextWorkflowId,
  };
};
