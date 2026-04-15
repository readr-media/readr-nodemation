import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import { generateId } from "@/utils/generate-id";
import { NODE_OFFSET_STEP } from "../constants";
import type { CmsNodeSlice, NodesStore } from "../types";

export const createCmsInputNodeData = (): CmsInputNodeData => ({
  title: "從CMS輸入",
  cmsConfigId: "",
  cmsName: "Readr CMS",
  cmsList: "Posts",
  cmsPostIds: "",
  cmsPostSlugs: "",
  sourceFields: {
    title: true,
    category: false,
    content: true,
    tags: false,
  },
  outputFields: {
    title: "string",
    categories: "array[string]",
    content: "string",
    tags: "array[string]",
  },
  outputFormat: "json",
});

const createCmsInputNode = (
  offset: number,
): Node<CmsInputNodeData, "cmsInput"> => ({
  id: generateId(),
  type: "cmsInput",
  position: { x: offset, y: offset },
  data: createCmsInputNodeData(),
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
