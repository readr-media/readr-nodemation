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
    promptTemplate: `[基本對話規則]\n"female"開場、"male"收尾\n兩人輪流發言，每段1-3句話\n自然口語、避免直接念誦原文\n角色設定：一位主持人風格為「數據記者」，負責分析數據趨勢，一位主持人為「閱聽人代表」，負責提問與總結影響。`,
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
