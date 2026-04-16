import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import { generateId } from "@/utils/generate-id";
import { NODE_OFFSET_STEP } from "../constants";
import type { NodesStore, PodcastGenerationNodeSlice } from "../types";

export type PodcastGenerationNodeData = {
  title: string;
  model: string;
  promptTemplate: string;
  podcastMode: "summary" | "deepDive" | "commentary" | "debate";
  podcastLength: "short" | "medium" | "long";
};

const createPodcastGenerationNode = (
  positionOffset: number,
): Node<PodcastGenerationNodeData, "podcastGeneration"> => ({
  id: generateId(),
  type: "podcastGeneration",
  position: { x: positionOffset, y: positionOffset },
  data: {
    title: "Podcast 生成",
    model: "gemini-1.5-flash",
    promptTemplate: `請為以下新聞進行處理：\n\n標題：\${title}\n內文：\${content}`,
    podcastMode: "deepDive",
    podcastLength: "medium",
  },
});

export const createPodcastGenerationNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  PodcastGenerationNodeSlice
> = (set) => ({
  addPodcastGenerationNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createPodcastGenerationNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updatePodcastGenerationNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as PodcastGenerationNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
