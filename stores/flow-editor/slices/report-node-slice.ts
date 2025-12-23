import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";

import type { ReportNodeData } from "@/components/flow/nodes/report-node";
import type { NodesStore, ReportNodeSlice } from "../types";

const NODE_OFFSET_STEP = 40;

const createReportNode = (
  offset: number,
): Node<ReportNodeData, "reportRecord"> => ({
  id: crypto.randomUUID(),
  type: "reportRecord",
  position: { x: offset, y: offset },
  data: {
    title: "產出報告紀錄",
    reportName: "",
    storageLocation: "MCP 任務紀錄系統",
    format: "JSON",
  },
});

export const createReportNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  ReportNodeSlice
> = (set) => ({
  addReportNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createReportNode(offset);
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateReportNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as ReportNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
