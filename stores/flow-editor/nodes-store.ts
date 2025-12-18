import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAiNodeSlice } from "./slices/ai-node-slice";
import { createFlowSlice } from "./slices/flow-slice";
import { createCodeNodeSlice } from "./slices/code-node-slice";
import type { NodesStore } from "./types";

export const useNodesStore = create<NodesStore>()(
  devtools(
    (set, get, store) => ({
      ...createFlowSlice(set, get, store),
      ...createAiNodeSlice(set, get, store),
      ...createCodeNodeSlice(set, get, store),
    }),
    { name: "FlowNodesStore" },
  ),
);
