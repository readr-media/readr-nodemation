import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import { generateId } from "@/utils/generate-id";
import { NODE_OFFSET_STEP } from "../constants";
import type { CmsOutputNodeSlice, NodesStore } from "../types";

export const createCmsOutputNodeData = (): CmsOutputNodeData => ({
  title: "輸出文字到CMS",
  cmsConfigId: "",
  cmsName: "Readr CMS",
  cmsList: "Posts",
  cmsPostIds: "",
  cmsPostSlugs: "",
  mappings: [],
  mode: "overwrite",
  postStatus: "draft",
});

const createCmsOutputNode = (
  offset: number,
): Node<CmsOutputNodeData, "cmsOutput"> => ({
  id: generateId(),
  type: "cmsOutput",
  position: { x: offset, y: offset },
  measured: { width: 240, height: 62 },
  data: createCmsOutputNodeData(),
});

export const createCmsOutputNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  CmsOutputNodeSlice
> = (set) => ({
  addCmsOutputNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createCmsOutputNode(offset);
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateCmsOutputNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as CmsOutputNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
