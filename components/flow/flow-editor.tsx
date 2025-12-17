"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls as ReactFlowControls,
  Panel,
  ReactFlow,
  SelectionMode,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { useCallback, useMemo, type ReactNode } from "react";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import AiCallNode from "./nodes/ai-call-node";

const panOnDrag = [1, 2];

type FlowEditorProps = {
  controlsSlot?: ReactNode;
};

const FlowEditor = ({ controlsSlot }: FlowEditorProps) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgeChange,
    onConnect,
    selectNode,
  } = useNodesStore();
  const handleNodeChange = useCallback(onNodesChange, []);
  const handleEdgeChange = useCallback(onEdgeChange, []);
  const nodeTypes = useMemo<NodeTypes>(() => ({ aiCall: AiCallNode }), []);
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => selectNode(node.id),
    [selectNode],
  );
  const handlePaneClick = useCallback(() => selectNode(null), [selectNode]);

  return (
    <div className="relative size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodeChange}
        onEdgesChange={handleEdgeChange}
        onConnect={onConnect}
        panOnScroll
        selectionOnDrag
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial}
        fitView
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
      >
        <Background />
        {controlsSlot ? (
          <Panel position="bottom-right" className="pointer-events-auto">
            {controlsSlot}
          </Panel>
        ) : (
          <ReactFlowControls position="bottom-right" />
        )}
      </ReactFlow>
    </div>
  );
};

export default FlowEditor;
