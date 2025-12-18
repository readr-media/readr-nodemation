import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { FlowSlice, NodesStore } from "../types";

const defaultNode = {
  id: "n1",
  position: { x: 0, y: 0 },
  data: { label: "Node 1" },
  type: "default",
} as const;

export const createFlowSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  FlowSlice
> = (set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  addNode: (node: Node) => {
    set((state) => ({
      nodes: [...state.nodes, { ...defaultNode, ...node }],
    }));
  },
  selectNode: (nodeId) => {
    set(() => ({ selectedNodeId: nodeId }));
  },
  loadSnapshot: (payload) => {
    set(() => ({
      nodes: payload.nodes ?? [],
      edges: payload.edges ?? [],
      selectedNodeId: null,
    }));
  },
  onNodesChange: (changes: NodeChange[]) => {
    set(
      (state) => ({
        nodes: applyNodeChanges(changes, state.nodes),
      }),
      false,
      "nodes/onNodesChange",
    );
  },
  onEdgeChange: (changes: EdgeChange[]) => {
    set(
      (state) => ({
        edges: applyEdgeChanges(changes, state.edges),
      }),
      false,
      "edges/onEdgeChange",
    );
  },
  onConnect: (params: Connection) => {
    set(
      (state) => ({
        edges: addEdge(params, state.edges),
      }),
      false,
      "edges/onConnect",
    );
  },
});
