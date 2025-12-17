'use client';

import FlowEditor from "@/components/flow/flow-editor";
import WorkFlowControls from "./workflow-controls";

const WorkflowBuilder = () => (
  <div className="flex min-h-svh w-full shadow-md">
    <FlowEditor controlsSlot={<WorkFlowControls />} />
  </div>
);

export default WorkflowBuilder;
