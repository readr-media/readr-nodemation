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
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

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
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgeChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
};

export type NodesStore = NodesStates & NodeActions;

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set) => ({
      nodes: [defaultNode, defaultNode2],
      edges: [defaultEdge],
      onNodesChange: (changes: NodeChange[]) => {
        set(
          (state: NodesStore) => ({
            nodes: applyNodeChanges(changes, state.nodes),
          }),
          false,
          "nodes/onNodesChange",
        );
      },
      onEdgeChange: (changes: EdgeChange[]) => {
        set(
          (state: NodesStore) => ({
            edges: applyEdgeChanges(changes, state.edges),
          }),
          false,
          "edges/onEdgeChange",
        );
      },
      onConnect: (params: Connection) => {
        set(
          (state: NodesStore) => ({
            edges: addEdge(params, state.edges),
          }),
          false,
          "edges/onConnect",
        );
      },
    }),
    { name: "FlowNodesStore" },
  ) as unknown as StateCreator<NodesStore, [], [never, unknown][]>,
);
