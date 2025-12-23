import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { ExportResultNodeData } from "@/components/flow/nodes/export-result-node";
import type { ExportNodeSlice, NodesStore } from "../types";

const NODE_OFFSET_STEP = 40;

const createExportResultNode = (
  offset: number,
): Node<ExportResultNodeData, "exportResult"> => ({
  id: crypto.randomUUID(),
  type: "exportResult",
  position: { x: offset, y: offset },
  data: {
    title: "匯出結果",
    source: "AI Tagging → tags",
    format: "JSON",
    fileNamePattern: `\${workflow_name}_\${date}.json`,
    destination: "local_download",
    autoDownload: true,
    zipFiles: false,
  },
});

export const createExportNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  ExportNodeSlice
> = (set) => ({
  addExportNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createExportResultNode(offset);
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateExportNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as ExportResultNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
