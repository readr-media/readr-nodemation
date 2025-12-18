import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import type { CodeNodeSlice, NodesStore } from "../types";

const NODE_OFFSET_STEP = 40;

const defaultCode = [
  "// 請輸入您的程式碼",
  "function processData(input) {",
  "  // 處理資料",
  "  return input;",
  "}",
].join("\n");

const createCodeNode = (
  positionOffset: number,
): Node<CodeNodeData, "codeBlock"> => ({
  id: crypto.randomUUID(),
  type: "codeBlock",
  position: { x: positionOffset, y: positionOffset },
  data: {
    title: "撰寫程式碼",
    language: "JavaScript",
    code: defaultCode,
  },
});

export const createCodeNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  CodeNodeSlice
> = (set) => ({
  addCodeNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createCodeNode(offset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateCodeNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as CodeNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
