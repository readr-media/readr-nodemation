import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";
import type { AiTitleGenerationNodeData } from "@/components/flow/nodes/ai-title-generation-node";
import type { CmsOutputAudioNodeData } from "@/components/flow/nodes/cms-output-audio-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import type { PodcastGenerationNodeData } from "./slices/podcast-generation-node-slice";

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

export type AiTitleGenerationNodeSlice = {
  addAiTitleGenerationNode: () => void;
  updateAiTitleGenerationNodeData: (
    nodeId: string,
    data: Partial<AiTitleGenerationNodeData>,
  ) => void;
};

export type AiPollNodeSlice = {
  addAiPollNode: () => void;
  updateAiPollNodeData: (
    nodeId: string,
    data: Partial<AiPollNodeData>,
  ) => void;
};

export type AiClassifierTaggerNodeSlice = {
  addAiClassifierTaggerNode: () => void;
  updateAiClassifierTaggerNodeData: (
    nodeId: string,
    data: Partial<AiClassifierTaggerNodeData>,
  ) => void;
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

export type CmsOutputAudioNodeSlice = {
  addCmsOutputAudioNode: () => void;
  updateCmsOutputAudioNodeData: (
    nodeId: string,
    data: Partial<CmsOutputAudioNodeData>,
  ) => void;
};

export type PodcastGenerationNodeSlice = {
  addPodcastGenerationNode: () => void;
  updatePodcastGenerationNodeData: (
    nodeId: string,
    data: Partial<PodcastGenerationNodeData>,
  ) => void;
};

export type WorkflowValidationSlice = {
  nodeFieldErrors: Record<string, Record<string, string>>;
  setNodeFieldError: (
    nodeId: string,
    field: string,
    message: string | null,
  ) => void;
  clearNodeFieldErrors: (nodeId: string) => void;
  clearAllNodeFieldErrors: () => void;
  hasWorkflowInputErrors: () => boolean;
};

export type NodesStore = FlowSlice &
  AiNodeSlice &
  AiTitleGenerationNodeSlice &
  AiPollNodeSlice &
  AiClassifierTaggerNodeSlice &
  CodeNodeSlice &
  CmsNodeSlice &
  CmsOutputNodeSlice &
  CmsOutputAudioNodeSlice &
  PodcastGenerationNodeSlice &
  WorkflowValidationSlice;
