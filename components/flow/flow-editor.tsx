"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  type Node,
  type NodeTypes,
  Panel,
  ReactFlow,
  Controls as ReactFlowControls,
  SelectionMode,
} from "@xyflow/react";
import { type ReactNode, useCallback, useMemo } from "react";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import AiCallNode from "./nodes/ai-call-node";
import CmsInputNode from "./nodes/cms-input-node";
import CmsOutputNode from "./nodes/cms-output-node";
import CodeNode from "./nodes/code-node";
import ExportResultNode from "./nodes/export-result-node";
import ReportNode from "./nodes/report-node";

const panOnDrag = [1, 2];

type FlowEditorProps = {
  controlsSlot?: ReactNode;
};

const FlowEditor = ({ controlsSlot }: FlowEditorProps) => {
  const { nodes, edges, onNodesChange, onEdgeChange, onConnect, selectNode } =
    useNodesStore();
  const handleNodeChange = useCallback(onNodesChange, []);
  const handleEdgeChange = useCallback(onEdgeChange, []);
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      aiCall: AiCallNode,
      codeBlock: CodeNode,
      cmsInput: CmsInputNode,
      cmsOutput: CmsOutputNode,
      exportResult: ExportResultNode,
      reportRecord: ReportNode,
    }),
    [],
  );
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
