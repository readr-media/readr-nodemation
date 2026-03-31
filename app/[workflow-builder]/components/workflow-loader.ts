"use client";

import type { Edge, Node } from "@xyflow/react";
import type { WorkflowStatus } from "@/lib/workflow-status";

type WorkflowRecord = {
  id: string;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  nodes: string;
  edges: string;
};

type LoadWorkflowIntoStoresInput = {
  workflowId: string | null;
  fetchImpl: typeof fetch;
  loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  hydrateFromWorkflow: (workflow: {
    workflowId: string | null;
    name: string;
    description?: string | null;
    status: WorkflowStatus;
    nodes: Node[];
    edges: Edge[];
  }) => void;
};

export type WorkflowLoadResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "missing" }
  | { status: "error" };

const parseGraphSnapshot = (workflow: WorkflowRecord) => ({
  nodes: JSON.parse(workflow.nodes) as Node[],
  edges: JSON.parse(workflow.edges) as Edge[],
});

export const loadWorkflowIntoStores = async ({
  workflowId,
  fetchImpl,
  loadSnapshot,
  hydrateFromWorkflow,
}: LoadWorkflowIntoStoresInput): Promise<WorkflowLoadResult> => {
  if (!workflowId) {
    return { status: "idle" };
  }

  try {
    const response = await fetchImpl(`/api/workflows/${workflowId}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return { status: "missing" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

    const workflow = (await response.json()) as WorkflowRecord;
    const snapshot = parseGraphSnapshot(workflow);

    loadSnapshot(snapshot);
    hydrateFromWorkflow({
      workflowId: workflow.id,
      name: workflow.name,
      description: workflow.description ?? "",
      status: workflow.status,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
    });

    return { status: "loaded" };
  } catch {
    return { status: "error" };
  }
};
