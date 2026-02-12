import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import { NODE_OFFSET_STEP } from "../constants";
import type { CmsNodeSlice, NodesStore } from "../types";

const createCmsInputNode = (
  offset: number,
): Node<CmsInputNodeData, "cmsInput"> => ({
  id: crypto.randomUUID(),
  type: "cmsInput",
  position: { x: offset, y: offset },
  data: {
    title: "從 CMS 輸入",
    source: "READr CMS",
    entryId: "12345",
    fields: {
      title: true,
      content: true,
      author: false,
      category: false,
    },
    outputFormat: "JSON",
  },
});

export const createCmsNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  CmsNodeSlice
> = (set) => ({
  addCmsNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createCmsInputNode(offset);
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateCmsNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as CmsInputNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
