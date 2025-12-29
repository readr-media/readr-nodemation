import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { NODE_OFFSET_STEP } from "../constants";
import type { AiNodeSlice, NodesStore } from "../types";

const createAiCallNode = (
  positionOffset: number,
): Node<AiCallNodeData, "aiCall"> => ({
  id: crypto.randomUUID(),
  type: "aiCall",
  position: { x: positionOffset, y: positionOffset },
  data: {
    title: "呼叫 AI",
    model: "gemini-1.5-flash",
    inputs: { title: true, content: true, summary: false },
    outputFormat: "JSON",
    promptTemplate: `請為以下新聞進行處理：\n\n標題：\${title}\n內文：\${content}`,
    cmsField: "category",
    testInput: "",
  },
});

export const createAiNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  AiNodeSlice
> = (set) => ({
  addAiNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createAiCallNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateNodeData: (nodeId, data) => {
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
