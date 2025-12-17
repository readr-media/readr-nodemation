"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Panel,
  ReactFlow,
  SelectionMode,
} from "@xyflow/react";
import { useCallback, type ReactNode } from "react";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const panOnDrag = [1, 2];

type FlowEditorProps = {
  controlsSlot?: ReactNode;
};

const FlowEditor = ({ controlsSlot }: FlowEditorProps) => {
  const { nodes, edges, onNodesChange, onEdgeChange, onConnect } =
    useNodesStore();
  const handleNodeChange = useCallback(onNodesChange, []);
  const handleEdgeChange = useCallback(onEdgeChange, []);

  return (
    <div className="relative size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodeChange}
        onEdgesChange={handleEdgeChange}
        onConnect={onConnect}
        panOnScroll
        selectionOnDrag
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial}
        fitView
      >
        <Background />
        {controlsSlot ? (
          <Panel position="bottom-right" className="pointer-events-auto">
            {controlsSlot}
          </Panel>
        ) : null}
      </ReactFlow>
    </div>
  );
};

export default FlowEditor;
