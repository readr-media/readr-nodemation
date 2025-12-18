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
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";

const defaultNode = {
  id: "n1",
  position: { x: 0, y: 0 },
  data: { label: "Node 1" },
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

export type NodesStates = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
};
export type NodeActions = {
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgeChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  addNode: (node: Node) => void;
  addAiNode: () => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeData: (nodeId: string, data: Partial<AiCallNodeData>) => void;
  loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => void;
};

export type NodesStore = NodesStates & NodeActions;

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      addNode: (node: Node) => {
        set((state: NodesStore) => ({
          nodes: [...state.nodes, { ...defaultNode, ...node }],
        }));
      },
      addAiNode: () => {
        set((state: NodesStore) => {
          const positionOffset = state.nodes.length * 40;
          const newNode: Node<AiCallNodeData, "aiCall"> = {
            id: crypto.randomUUID(),
            type: "aiCall",
            position: { x: positionOffset, y: positionOffset },
            data: {
              title: "呼叫 AI",
              model: "gemini-1.5-flash",
              inputs: { title: true, content: true, summary: false },
              outputFormat: "JSON",
              promptTemplate:
                "請為以下新聞進行處理：\n\n標題：${title}\n內文：${content}",
              cmsField: "category",
              testInput: "",
            },
          };
          return {
            nodes: [...state.nodes, newNode],
            selectedNodeId: newNode.id,
          };
        });
      },
      selectNode: (nodeId: string | null) => {
        set(() => ({ selectedNodeId: nodeId }));
      },
      updateNodeData: (nodeId: string, data: Partial<AiCallNodeData>) => {
        set((state: NodesStore) => ({
          nodes: state.nodes.map((node: Node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...(node.data as AiCallNodeData),
                    ...data,
                  },
                }
              : node,
          ),
        }));
      },
      loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => {
        set(() => ({
          nodes: payload.nodes ?? [],
          edges: payload.edges ?? [],
          selectedNodeId: null,
        }));
      },
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
