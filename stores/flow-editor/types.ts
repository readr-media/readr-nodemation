import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import type { ExportResultNodeData } from "@/components/flow/nodes/export-result-node";
import type { ReportNodeData } from "@/components/flow/nodes/report-node";

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

export type CodeNodeSlice = {
  addCodeNode: () => void;
  updateCodeNodeData: (nodeId: string, data: Partial<CodeNodeData>) => void;
};

export type CmsNodeSlice = {
  addCmsNode: () => void;
  updateCmsNodeData: (nodeId: string, data: Partial<CmsInputNodeData>) => void;
};

export type CmsOutputNodeSlice = {
  addCmsOutputNode: () => void;
  updateCmsOutputNodeData: (
    nodeId: string,
    data: Partial<CmsOutputNodeData>,
  ) => void;
};

export type ExportNodeSlice = {
  addExportNode: () => void;
  updateExportNodeData: (
    nodeId: string,
    data: Partial<ExportResultNodeData>,
  ) => void;
};

export type ReportNodeSlice = {
  addReportNode: () => void;
  updateReportNodeData: (nodeId: string, data: Partial<ReportNodeData>) => void;
};

export type NodesStore = FlowSlice &
  AiNodeSlice &
  CodeNodeSlice &
  CmsNodeSlice &
  CmsOutputNodeSlice &
  ExportNodeSlice &
  ReportNodeSlice;
