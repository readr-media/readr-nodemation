"use client";

import type { Edge, Node } from "@xyflow/react";
import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";
import {
  isWorkflowExecutionPending,
  type WorkflowStatus,
} from "@/lib/workflow-status";

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
  updatedAt?: string | null;
  lastRunAt?: string | null;
  createdAt?: string | null;
};

type ResetBaselineInput = WorkflowGraphSnapshot & {
  workflowId?: string | null;
  sourceWorkflowId?: string | null;
  status?: WorkflowStatus;
};

// Server-owned metadata for the builder header (status badge + activity text).
// Pushed in after save/run (findFirst response) or during execution polling.
// `createdAt` is set once via hydrate or setCreatedAt — it never changes and
// is intentionally excluded here. These fields never affect the dirty check
// on their own; the baseline's status is kept in sync so a remote status
// transition doesn't get mistaken for a local edit.
export type ServerStatusSnapshot = {
  status: WorkflowStatus;
  updatedAt: string | null;
  lastRunAt: string | null;
};

export type WorkflowEditorState = WorkflowGraphSnapshot & {
  workflowId: string | null;
  sourceWorkflowId: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
  updatedAt: string | null;
  lastRunAt: string | null;
  createdAt: string | null;
  nodesFingerprint: string;
  edgesFingerprint: string;
  baseline: WorkflowEditorBaseline | null;
  isDirty: boolean;
  isHydrating: boolean;
  // Set when the user explicitly clicks Run so status polling only tracks
  // in-flight runs, not saves that bump updated_at without executing.
  runTriggered: boolean;
  hydrateFromWorkflow: (workflow: HydrateWorkflowInput) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setStatus: (status: WorkflowStatus) => void;
  syncGraphSnapshot: (snapshot: WorkflowGraphSnapshot) => void;
  resetBaseline: (snapshot: ResetBaselineInput) => void;
  setCreatedAt: (createdAt: string | null) => void;
  setRunTriggered: (runTriggered: boolean) => void;
  syncServerStatus: (snapshot: ServerStatusSnapshot) => void;
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
  updatedAt: null,
  lastRunAt: null,
  createdAt: null,
  nodes: [],
  edges: [],
  nodesFingerprint: serializeSnapshot([]),
  edgesFingerprint: serializeSnapshot([]),
  baseline: null,
  isDirty: false,
  isHydrating: false,
  runTriggered: false,
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
      updatedAt: workflow.updatedAt ?? null,
      lastRunAt: workflow.lastRunAt ?? null,
      createdAt: workflow.createdAt ?? null,
      nodes: workflow.nodes,
      edges: workflow.edges,
      ...graphFingerprints,
      baseline,
      isDirty: false,
      isHydrating: false,
      runTriggered: false,
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
  setCreatedAt: (createdAt) => {
    set({ createdAt });
  },
  setRunTriggered: (runTriggered) => {
    set({ runTriggered });
  },
  resetBaseline: (snapshot) => {
    set((state) => {
      const workflowId = snapshot.workflowId ?? state.workflowId;
      const sourceWorkflowId = snapshot.sourceWorkflowId ?? workflowId;
      const status = snapshot.status ?? state.status;
      const graphFingerprints = fingerprintGraphSnapshot(snapshot);
      const nextState = {
        ...state,
        workflowId,
        sourceWorkflowId,
        status,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
      };
      const baseline = buildBaseline(nextState);

      return {
        workflowId,
        sourceWorkflowId,
        status,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        ...graphFingerprints,
        baseline,
        isDirty: false,
        isHydrating: false,
      };
    });
  },
  syncServerStatus: ({ status, updatedAt, lastRunAt }) => {
    set((state) => {
      // Keep the baseline's status aligned with the server so a remote status
      // transition (e.g. published → running → published) is not flagged as a
      // local unsaved change; the user's in-progress graph edits still drive
      // isDirty as usual.
      const baseline = state.baseline
        ? { ...state.baseline, status }
        : state.baseline;
      const nextState = { ...state, status, baseline };
      const runTriggered = isWorkflowExecutionPending(
        status,
        updatedAt,
        lastRunAt,
        state.runTriggered,
      )
        ? state.runTriggered
        : false;

      return {
        status,
        updatedAt,
        lastRunAt,
        baseline,
        runTriggered,
        isDirty: computeIsDirty(nextState),
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
