import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import { generateId } from "@/utils/generate-id";

import { NODE_OFFSET_STEP } from "../constants";
import type { AiClassifierTaggerNodeSlice, NodesStore } from "../types";

export const createAiClassifierTaggerNodeData =
  (): AiClassifierTaggerNodeData => ({
    title: "AI自動分類與標籤",
    model: "gemini-1.5-flash",
    inputFields: {
      title: "source.title",
      content: "source.content",
    },
    promptTemplate: "",
    categoryAmount: 1,
    tagAmount: 3,
    responseFormat: {
      type: "json",
      schema: {
        categories: "array[string]",
        tags: "array[string]",
      },
    },
    outputFields: {
      categories: "array[string]",
      tags: "array[string]",
    },
  });

export const createAiClassifierTaggerNode = (
  offset: number,
): Node<AiClassifierTaggerNodeData, "aiClassifierTagger"> => ({
  id: generateId(),
  type: "aiClassifierTagger",
  position: { x: offset, y: offset },
  measured: { width: 240, height: 62 },
  data: createAiClassifierTaggerNodeData(),
});

export const createAiClassifierTaggerNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  AiClassifierTaggerNodeSlice
> = (set) => ({
  addAiClassifierTaggerNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createAiClassifierTaggerNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateAiClassifierTaggerNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as AiClassifierTaggerNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
