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
  fetchImpl: typeof fetch;
  resetBaseline: (snapshot: {
    workflowId: string;
    sourceWorkflowId: string;
    nodes: Node[];
    edges: Edge[];
  }) => void;
};

type SavedWorkflowResponse = {
  id: string;
};

const buildRequest = ({
  mode,
  workflowId,
  name,
  description,
  status,
  nodes,
  edges,
}: Omit<SaveWorkflowInput, "fetchImpl" | "resetBaseline">) => {
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
  });

  return {
    workflowId: nextWorkflowId,
    sourceWorkflowId: nextWorkflowId,
  };
};
