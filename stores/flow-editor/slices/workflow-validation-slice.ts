import type { StateCreator } from "zustand";

import {
  hasWorkflowInputErrors,
  type NodeFieldErrors,
} from "@/lib/workflow-node-validation";

import type { NodesStore, WorkflowValidationSlice } from "../types";

export const createWorkflowValidationSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  WorkflowValidationSlice
> = (set, get) => ({
  nodeFieldErrors: {},
  setNodeFieldError: (nodeId, field, message) => {
    set((state) => {
      const currentNodeErrors = state.nodeFieldErrors[nodeId] ?? {};
      const nextNodeErrors = { ...currentNodeErrors };

      if (message === null) {
        delete nextNodeErrors[field];
      } else {
        nextNodeErrors[field] = message;
      }

      const nextNodeFieldErrors: NodeFieldErrors = {
        ...state.nodeFieldErrors,
      };

      if (Object.keys(nextNodeErrors).length === 0) {
        delete nextNodeFieldErrors[nodeId];
      } else {
        nextNodeFieldErrors[nodeId] = nextNodeErrors;
      }

      return { nodeFieldErrors: nextNodeFieldErrors };
    });
  },
  clearNodeFieldErrors: (nodeId) => {
    set((state) => {
      if (!(nodeId in state.nodeFieldErrors)) {
        return state;
      }

      const nextNodeFieldErrors = { ...state.nodeFieldErrors };
      delete nextNodeFieldErrors[nodeId];

      return { nodeFieldErrors: nextNodeFieldErrors };
    });
  },
  clearAllNodeFieldErrors: () => {
    set({ nodeFieldErrors: {} });
  },
  hasWorkflowInputErrors: () =>
    hasWorkflowInputErrors(get().nodeFieldErrors),
});
