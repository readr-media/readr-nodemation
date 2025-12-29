"use client";

import FlowEditor from "@/components/flow/flow-editor";
import FlowDebugControls from "./flow-debug-controls";
import WorkFlowControls from "./workflow-controls";

const WorkflowBuilder = () => (
  <div className="relative flex min-h-svh w-full shadow-md">
    <FlowEditor controlsSlot={<WorkFlowControls />} />
    {/* 測試用匯入/匯出區塊，確認後可直接刪除 */}
    <div className="pointer-events-none absolute left-4 top-4 z-10">
      <FlowDebugControls />
    </div>
  </div>
);

export default WorkflowBuilder;
