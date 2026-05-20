import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { generateId } from "@/utils/generate-id";

import { NODE_OFFSET_STEP } from "../constants";
import type { AiTitleGenerationNodeSlice, NodesStore } from "../types";

export const createAiTitleGenerationNodeData = (): AiCallNodeData => ({
  title: "AI 文章標題",
  model: "gemini-1.5-flash",
  inputs: { title: true, content: true, summary: false },
  outputFormat: "JSON",
  promptTemplate:
    "請閱讀新聞內容並產生 3 個可用於發布的中文新聞標題，請回傳 JSON。",
  cmsField: "title",
  testInput: "",
});

export const createAiTitleGenerationNode = (
  offset: number,
): Node<AiCallNodeData, "aiCall"> => ({
  id: generateId(),
  type: "aiCall",
  position: { x: offset, y: offset },
  data: createAiTitleGenerationNodeData(),
});

export const createAiTitleGenerationNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  AiTitleGenerationNodeSlice
> = (set) => ({
  addAiTitleGenerationNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createAiTitleGenerationNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateAiTitleGenerationNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
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
});
