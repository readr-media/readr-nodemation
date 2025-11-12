import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

const defaultNode = {
  id: "n1",
  position: { x: 0, y: 0 },
  data: { label: "Node 1" },
  type: "default",
} as const;

const defaultNode2 = {
  id: "n2",
  position: { x: 100, y: 100 },
  data: { label: "Node 2" },
  type: "default",
} as const;

const defaultEdge = {
  id: "n1-n2",
  source: "n1",
  target: "n2",
} as const;

export type NodePosition = {
  x: number;
  y: number;
};

export type NodeData = {
  label: string;
};

export type NodesStates = {
  nodes: Node[];
  edges: Edge[];
};
export type NodeActions = {
  addNode: () => void;
};

export type NodesStore = NodesStates & NodeActions;

export const useNodesStore = create<NodesStore>()((set) => ({
  nodes: [defaultNode, defaultNode2],
  edges: [defaultEdge],
  addNode: () => set((state) => ({ nodes: [...state.nodes, defaultNode] })),
}));
