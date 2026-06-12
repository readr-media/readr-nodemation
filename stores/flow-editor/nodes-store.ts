import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAiClassifierTaggerNodeSlice } from "./slices/ai-classifier-tagger-node-slice";
import { createAiNodeSlice } from "./slices/ai-node-slice";
import { createAiTitleGenerationNodeSlice } from "./slices/ai-title-generation-node-slice";
import { createAiPollNodeSlice } from "./slices/ai-poll-node-slice";
import { createCmsNodeSlice } from "./slices/cms-node-slice";
import { createCmsOutputAudioNodeSlice } from "./slices/cms-output-audio-node-slice";
import { createCmsOutputNodeSlice } from "./slices/cms-output-node-slice";
import { createCodeNodeSlice } from "./slices/code-node-slice";
import { createFlowSlice } from "./slices/flow-slice";
import { createPodcastGenerationNodeSlice } from "./slices/podcast-generation-node-slice";
import { createWorkflowValidationSlice } from "./slices/workflow-validation-slice";
import type { NodesStore } from "./types";

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set, get, store) => ({
      ...createFlowSlice(set, get, store),
      ...createAiNodeSlice(set, get, store),
      ...createAiTitleGenerationNodeSlice(set, get, store),
      ...createAiPollNodeSlice(set, get, store),
      ...createAiClassifierTaggerNodeSlice(set, get, store),
      ...createCodeNodeSlice(set, get, store),
      ...createCmsNodeSlice(set, get, store),
      ...createCmsOutputNodeSlice(set, get, store),
      ...createCmsOutputAudioNodeSlice(set, get, store),
      ...createPodcastGenerationNodeSlice(set, get, store),
      ...createWorkflowValidationSlice(set, get, store),
    }),
    { name: "FlowNodesStore" },
  ),
);
