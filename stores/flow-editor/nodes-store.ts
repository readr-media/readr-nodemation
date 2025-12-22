import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAiNodeSlice } from "./slices/ai-node-slice";
import { createFlowSlice } from "./slices/flow-slice";
import { createCodeNodeSlice } from "./slices/code-node-slice";
import { createCmsNodeSlice } from "./slices/cms-node-slice";
import { createCmsOutputNodeSlice } from "./slices/cms-output-node-slice";
import { createExportNodeSlice } from "./slices/export-node-slice";
import type { NodesStore } from "./types";

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set, get, store) => ({
      ...createFlowSlice(set, get, store),
      ...createAiNodeSlice(set, get, store),
      ...createCodeNodeSlice(set, get, store),
      ...createCmsNodeSlice(set, get, store),
      ...createCmsOutputNodeSlice(set, get, store),
      ...createExportNodeSlice(set, get, store),
    }),
    { name: "FlowNodesStore" },
  ),
);
