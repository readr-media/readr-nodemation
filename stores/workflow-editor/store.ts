"use client";

import type { Edge, Node } from "@xyflow/react";
import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import type { WorkflowStatus } from "@/lib/workflow-status";

type WorkflowGraphSnapshot = {
  nodes: Node[];
  edges: Edge[];
};

type WorkflowGraphFingerprints = {
  nodesFingerprint: string;
  edgesFingerprint: string;
};

type WorkflowEditorBaseline = WorkflowGraphSnapshot & {
  workflowId: string | null;
  sourceWorkflowId: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
} & WorkflowGraphFingerprints;

type HydrateWorkflowInput = WorkflowGraphSnapshot & {
  workflowId: string | null;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
};

type ResetBaselineInput = WorkflowGraphSnapshot & {
  workflowId?: string | null;
  sourceWorkflowId?: string | null;
};

export type WorkflowEditorState = WorkflowGraphSnapshot & {
  workflowId: string | null;
  sourceWorkflowId: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodesFingerprint: string;
  edgesFingerprint: string;
  baseline: WorkflowEditorBaseline | null;
  isDirty: boolean;
  isHydrating: boolean;
  hydrateFromWorkflow: (workflow: HydrateWorkflowInput) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setStatus: (status: WorkflowStatus) => void;
  syncGraphSnapshot: (snapshot: WorkflowGraphSnapshot) => void;
  resetBaseline: (snapshot: ResetBaselineInput) => void;
};

const serializeSnapshot = (value: unknown) => JSON.stringify(value);

const fingerprintGraphSnapshot = (
  snapshot: WorkflowGraphSnapshot,
): WorkflowGraphFingerprints => ({
  nodesFingerprint: serializeSnapshot(snapshot.nodes),
  edgesFingerprint: serializeSnapshot(snapshot.edges),
});

const buildBaseline = (
  state: Pick<
    WorkflowEditorState,
    | "workflowId"
    | "sourceWorkflowId"
    | "name"
    | "description"
    | "status"
    | "nodes"
    | "edges"
    | "nodesFingerprint"
    | "edgesFingerprint"
  >,
): WorkflowEditorBaseline => ({
  workflowId: state.workflowId,
  sourceWorkflowId: state.sourceWorkflowId,
  name: state.name,
  description: state.description,
  status: state.status,
  nodes: state.nodes,
  edges: state.edges,
  nodesFingerprint: state.nodesFingerprint,
  edgesFingerprint: state.edgesFingerprint,
});

const computeIsDirty = (
  state: Pick<
    WorkflowEditorState,
    | "workflowId"
    | "sourceWorkflowId"
    | "name"
    | "description"
    | "status"
    | "nodesFingerprint"
    | "edgesFingerprint"
    | "baseline"
  >,
) => {
  if (!state.baseline) {
    return false;
  }

  return (
    state.workflowId !== state.baseline.workflowId ||
    state.sourceWorkflowId !== state.baseline.sourceWorkflowId ||
    state.name !== state.baseline.name ||
    state.description !== state.baseline.description ||
    state.status !== state.baseline.status ||
    state.nodesFingerprint !== state.baseline.nodesFingerprint ||
    state.edgesFingerprint !== state.baseline.edgesFingerprint
  );
};

const createWorkflowEditorState = (
  set: StoreApi<WorkflowEditorState>["setState"],
  _get: StoreApi<WorkflowEditorState>["getState"],
): WorkflowEditorState => ({
  workflowId: null,
  sourceWorkflowId: null,
  name: "",
  description: "",
  status: "draft",
  nodes: [],
  edges: [],
  nodesFingerprint: serializeSnapshot([]),
  edgesFingerprint: serializeSnapshot([]),
  baseline: null,
  isDirty: false,
  isHydrating: false,
  hydrateFromWorkflow: (workflow) => {
    const description = workflow.description ?? "";
    const graphFingerprints = fingerprintGraphSnapshot(workflow);
    const baseline = {
      workflowId: workflow.workflowId,
      sourceWorkflowId: workflow.workflowId,
      name: workflow.name,
      description,
      status: workflow.status,
      nodes: workflow.nodes,
      edges: workflow.edges,
      ...graphFingerprints,
    };

    set({
      workflowId: workflow.workflowId,
      sourceWorkflowId: workflow.workflowId,
      name: workflow.name,
      description,
      status: workflow.status,
      nodes: workflow.nodes,
      edges: workflow.edges,
      ...graphFingerprints,
      baseline,
      isDirty: false,
      isHydrating: false,
    });
  },
  setName: (name) => {
    set((state) => {
      const nextState = { ...state, name };
      return { name, isDirty: computeIsDirty(nextState) };
    });
  },
  setDescription: (description) => {
    set((state) => {
      const nextState = { ...state, description };
      return { description, isDirty: computeIsDirty(nextState) };
    });
  },
  setStatus: (status) => {
    set((state) => {
      const nextState = { ...state, status };
      return { status, isDirty: computeIsDirty(nextState) };
    });
  },
  syncGraphSnapshot: (snapshot) => {
    set((state) => {
      const graphFingerprints = fingerprintGraphSnapshot(snapshot);
      const nextState = {
        ...state,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
      };

      return {
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
        isDirty: computeIsDirty(nextState),
      };
    });
  },
  resetBaseline: (snapshot) => {
    set((state) => {
      const workflowId = snapshot.workflowId ?? state.workflowId;
      const sourceWorkflowId = snapshot.sourceWorkflowId ?? workflowId;
      const graphFingerprints = fingerprintGraphSnapshot(snapshot);
      const nextState = {
        ...state,
        workflowId,
        sourceWorkflowId,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
      };
      const baseline = buildBaseline(nextState);

      return {
        workflowId,
        sourceWorkflowId,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
        baseline,
        isDirty: false,
        isHydrating: false,
      };
    });
  },
});

export const createWorkflowEditorStore = (): UseBoundStore<
  StoreApi<WorkflowEditorState>
> =>
  create<WorkflowEditorState>()((set, get) =>
    createWorkflowEditorState(set, get),
  );

export const useWorkflowEditorStore = createWorkflowEditorStore();
