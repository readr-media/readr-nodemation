"use client";

import type { Edge, Node } from "@xyflow/react";
import type { WorkflowStatus } from "@/lib/workflow-status";

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
    updatedAt?: string | null;
    lastRunAt?: string | null;
    createdAt?: string | null;
  }) => void;
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
}: Omit<SaveWorkflowInput, "fetchImpl" | "resetBaseline">) => {
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

  resetBaseline({
    workflowId: nextWorkflowId,
    sourceWorkflowId: nextWorkflowId,
    nodes,
    edges,
    // Prefer the server's authoritative values so the header's status badge and
    // "已於 … 儲存/執行" timestamp reflect what was actually persisted.
    status: savedWorkflow.status ?? status,
    updatedAt: savedWorkflow.updated_at ?? null,
    lastRunAt: savedWorkflow.last_run_at ?? null,
    createdAt: savedWorkflow.created_at ?? null,
  });

  return {
    workflowId: nextWorkflowId,
    sourceWorkflowId: nextWorkflowId,
  };
};
