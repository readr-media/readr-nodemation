"use client";

import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import type { StoreApi, UseBoundStore } from "zustand";
import type { WorkflowStatus } from "@/lib/workflow-status";

type WorkflowGraphSnapshot = {
  nodes: Node[];
  edges: Edge[];
};

type WorkflowEditorBaseline = WorkflowGraphSnapshot & {
  workflowId: string | null;
  sourceWorkflowId: string | null;
  name: string;
  description: string;
  status: WorkflowStatus;
};

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

const buildBaseline = (
  state: Pick<
    WorkflowEditorState,
    "workflowId" | "sourceWorkflowId" | "name" | "description" | "status"
  > &
    WorkflowGraphSnapshot,
): WorkflowEditorBaseline => ({
  workflowId: state.workflowId,
  sourceWorkflowId: state.sourceWorkflowId,
  name: state.name,
  description: state.description,
  status: state.status,
  nodes: state.nodes,
  edges: state.edges,
});

const computeIsDirty = (
  state: Pick<
    WorkflowEditorState,
    | "workflowId"
    | "sourceWorkflowId"
    | "name"
    | "description"
    | "status"
    | "nodes"
    | "edges"
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
    serializeSnapshot(state.nodes) !== serializeSnapshot(state.baseline.nodes) ||
    serializeSnapshot(state.edges) !== serializeSnapshot(state.baseline.edges)
  );
};

const createWorkflowEditorState = (
  set: StoreApi<WorkflowEditorState>["setState"],
  get: StoreApi<WorkflowEditorState>["getState"],
): WorkflowEditorState => ({
  workflowId: null,
  sourceWorkflowId: null,
  name: "",
  description: "",
  status: "draft",
  nodes: [],
  edges: [],
  baseline: null,
  isDirty: false,
  isHydrating: false,
  hydrateFromWorkflow: (workflow) => {
    const description = workflow.description ?? "";
    const baseline = {
      workflowId: workflow.workflowId,
      sourceWorkflowId: workflow.workflowId,
      name: workflow.name,
      description,
      status: workflow.status,
      nodes: workflow.nodes,
      edges: workflow.edges,
    };

    set({
      workflowId: workflow.workflowId,
      sourceWorkflowId: workflow.workflowId,
      name: workflow.name,
      description,
      status: workflow.status,
      nodes: workflow.nodes,
      edges: workflow.edges,
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
      const nextState = {
        ...state,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      };

      return {
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        isDirty: computeIsDirty(nextState),
      };
    });
  },
  resetBaseline: (snapshot) => {
    set((state) => {
      const workflowId = snapshot.workflowId ?? state.workflowId;
      const sourceWorkflowId = snapshot.sourceWorkflowId ?? workflowId;
      const nextState = {
        ...state,
        workflowId,
        sourceWorkflowId,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
      };
      const baseline = buildBaseline(nextState);

      return {
        workflowId,
        sourceWorkflowId,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        baseline,
        isDirty: false,
        isHydrating: false,
      };
    });
  },
});

export const createWorkflowEditorStore = (): UseBoundStore<
  StoreApi<WorkflowEditorState>
> => create<WorkflowEditorState>()((set, get) => createWorkflowEditorState(set, get));

export const useWorkflowEditorStore = createWorkflowEditorStore();
