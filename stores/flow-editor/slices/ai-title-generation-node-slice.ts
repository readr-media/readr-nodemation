import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { AiTitleGenerationNodeData } from "@/components/flow/nodes/ai-title-generation-node";
import { generateId } from "@/utils/generate-id";

import { NODE_OFFSET_STEP } from "../constants";
import type { AiTitleGenerationNodeSlice, NodesStore } from "../types";

export const createAiTitleGenerationNodeData = (): AiTitleGenerationNodeData => ({
  title: "AI 文章標題",
  titleStyle: "seo",
  titleTemperature: 0.5,
  titleKeywords: "",
});

export const createAiTitleGenerationNode = (
  offset: number,
): Node<AiTitleGenerationNodeData, "aiTitle"> => ({
  id: generateId(),
  type: "aiTitle",
  position: { x: offset, y: offset },
  measured: { width: 240, height: 62 },
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
                ...(node.data as AiTitleGenerationNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
