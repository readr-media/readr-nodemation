import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type {
  CmsFieldMapping,
} from "@/components/flow/nodes/cms-output-node";
import type { CmsOutputAudioNodeData } from "@/components/flow/nodes/cms-output-audio-node";
import { generateId } from "@/utils/generate-id";
import { NODE_OFFSET_STEP } from "../constants";
import type { CmsOutputAudioNodeSlice, NodesStore } from "../types";

const createDefaultMappings = (): CmsFieldMapping[] => [
  {
    id: generateId(),
    sourceField: "{{ ai.podcastTitle }}",
    targetField: "title",
  },
  {
    id: generateId(),
    sourceField: "{{ ai.podcastScript }}",
    targetField: "description",
  },
  {
    id: generateId(),
    sourceField: "{{ ai.audioFile }}",
    targetField: "audioFile",
  },
];

const createCmsOutputAudioNode = (
  offset: number,
): Node<CmsOutputAudioNodeData, "cmsOutputAudio"> => ({
  id: generateId(),
  type: "cmsOutputAudio",
  position: { x: offset, y: offset },
  data: {
    title: "輸出音檔到 CMS",
    cmsConfigId: "",
    cmsName: "READr CMS",
    cmsList: "Audio File",
    cmsAudioFileIds: "",
    mappings: createDefaultMappings(),
    mode: "create",
  },
});

export const createCmsOutputAudioNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  CmsOutputAudioNodeSlice
> = (set) => ({
  addCmsOutputAudioNode: () => {
    set((state) => {
      const offset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createCmsOutputAudioNode(offset);
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateCmsOutputAudioNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as CmsOutputAudioNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
