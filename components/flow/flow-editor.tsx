import "@xyflow/react/dist/style.css";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const FlowEditor = () => {
  const { nodes, edges, onNodesChange, onEdgeChange, onConnect } =
    useNodesStore();
  const handleNodeChange = useCallback(onNodesChange, []);
  const handleEdgeChange = useCallback(onEdgeChange, []);

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodeChange}
        onEdgesChange={handleEdgeChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FlowEditor;
