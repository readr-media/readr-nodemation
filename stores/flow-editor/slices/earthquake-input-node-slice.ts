import type { Node } from "@xyflow/react";
import type { StateCreator } from "zustand";
import type { EarthquakeInputNodeData } from "@/components/flow/nodes/earthquake-input-node";
import { generateId } from "@/utils/generate-id";
import { NODE_OFFSET_STEP } from "../constants";
import type { EarthquakeInputNodeSlice, NodesStore } from "../types";

export const createEarthquakeInputNodeData = (): EarthquakeInputNodeData => ({
  title: "取得地震資訊",
});

const createEarthquakeInputNode = (
  positionOffset: number,
): Node<EarthquakeInputNodeData, "earthquakeInput"> => ({
  id: generateId(),
  type: "earthquakeInput",
  position: { x: positionOffset, y: positionOffset },
  data: createEarthquakeInputNodeData(),
});

export const createEarthquakeInputNodeSlice: StateCreator<
  NodesStore,
  [["zustand/devtools", never]],
  [],
  EarthquakeInputNodeSlice
> = (set) => ({
  addEarthquakeInputNode: () => {
    set((state) => {
      const positionOffset = state.nodes.length * NODE_OFFSET_STEP;
      const newNode = createEarthquakeInputNode(positionOffset);

      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      };
    });
  },
  updateEarthquakeInputNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data as EarthquakeInputNodeData),
                ...data,
              },
            }
          : node,
      ),
    }));
  },
});
