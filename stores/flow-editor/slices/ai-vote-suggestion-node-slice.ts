import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { generateId } from "@/utils/generate-id";

import { NODE_OFFSET_STEP } from "../constants";
import type { AiVoteSuggestionNodeSlice, NodesStore } from "../types";

export const createAiVoteSuggestionNodeData = (): AiCallNodeData => ({
  title: "AI 投票建議",
  model: "gemini-1.5-flash",
  inputs: { title: true, content: true, summary: true },
  outputFormat: "JSON",
  promptTemplate:
    "請依新聞內容提出 3 個可投票選項，並附上各選項一行理由，使用 JSON 回傳。",
  cmsField: "recommendedPoll",
  testInput: "",
});

export const createAiVoteSuggestionNode = (
  offset: number,
): Node<AiCallNodeData, "aiCall"> => ({
  id: generateId(),
  type: "aiCall",
  position: { x: offset, y: offset },
  data: createAiVoteSuggestionNodeData(),
});

export const createAiVoteSuggestionNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  AiVoteSuggestionNodeSlice
> = (set) => ({
  addAiVoteSuggestionNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createAiVoteSuggestionNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateAiVoteSuggestionNodeData: (nodeId, data) => {
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
