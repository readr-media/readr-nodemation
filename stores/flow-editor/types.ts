import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";

export type FlowSlice = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  addNode: (node: Node) => void;
  selectNode: (nodeId: string | null) => void;
  loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgeChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
};

export type AiNodeSlice = {
  addAiNode: () => void;
  updateNodeData: (nodeId: string, data: Partial<AiCallNodeData>) => void;
};

export type NodesStore = FlowSlice & AiNodeSlice;
