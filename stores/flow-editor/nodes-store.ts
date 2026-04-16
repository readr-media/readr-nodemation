import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAiClassifierTaggerNodeSlice } from "./slices/ai-classifier-tagger-node-slice";
import { createAiNodeSlice } from "./slices/ai-node-slice";
import { createCmsNodeSlice } from "./slices/cms-node-slice";
import { createCmsOutputNodeSlice } from "./slices/cms-output-node-slice";
import { createCodeNodeSlice } from "./slices/code-node-slice";
import { createExportNodeSlice } from "./slices/export-node-slice";
import { createFlowSlice } from "./slices/flow-slice";
import { createPodcastGenerationNodeSlice } from "./slices/podcast-generation-node-slice";
import type { NodesStore } from "./types";

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set, get, store) => ({
      ...createFlowSlice(set, get, store),
      ...createAiNodeSlice(set, get, store),
      ...createAiClassifierTaggerNodeSlice(set, get, store),
      ...createCodeNodeSlice(set, get, store),
      ...createCmsNodeSlice(set, get, store),
      ...createCmsOutputNodeSlice(set, get, store),
      ...createExportNodeSlice(set, get, store),
      ...createPodcastGenerationNodeSlice(set, get, store),
    }),
    { name: "FlowNodesStore" },
  ),
);
