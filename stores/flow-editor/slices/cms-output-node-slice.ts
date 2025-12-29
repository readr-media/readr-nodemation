import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type {
  CmsFieldMapping,
  CmsOutputNodeData,
} from "@/components/flow/nodes/cms-output-node";
import { NODE_OFFSET_STEP } from "../constants";
import type { CmsOutputNodeSlice, NodesStore } from "../types";

const createDefaultMapping = (): CmsFieldMapping => ({
  id: crypto.randomUUID(),
  sourceField: "AI output",
  targetField: "CMS tags",
});

const createCmsOutputNode = (
  offset: number,
): Node<CmsOutputNodeData, "cmsOutput"> => ({
  id: crypto.randomUUID(),
  type: "cmsOutput",
  position: { x: offset, y: offset },
  data: {
    title: "輸出到 CMS",
    cmsLocation: "READr",
    articleIdOrSlug: "",
    mappings: [createDefaultMapping()],
    mode: "overwrite",
  },
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
