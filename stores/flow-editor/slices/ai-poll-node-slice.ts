import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";
import { generateId } from "@/utils/generate-id";

import { NODE_OFFSET_STEP } from "../constants";
import type { AiPollNodeSlice, NodesStore } from "../types";

export const createAiPollNodeData = (): AiPollNodeData => ({
  title: "AI 投票建議",
  userPrompt: "",
  categoryAmount: 2,
});

export const createAiPollNode = (
  offset: number,
): Node<AiPollNodeData, "aiPoll"> => ({
  id: generateId(),
  type: "aiPoll",
  position: { x: offset, y: offset },
  measured: { width: 240, height: 62 },
  data: createAiPollNodeData(),
});

export const createAiPollNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  AiPollNodeSlice
> = (set) => ({
  addAiPollNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createAiPollNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateAiPollNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as AiPollNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
