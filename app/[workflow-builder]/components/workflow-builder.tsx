"use client";

import { useEffect, useState } from "react";
import FlowEditor from "@/components/flow/flow-editor";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { useWorkflowEditorStore } from "@/stores/workflow-editor/store";
import FlowDebugControls from "./flow-debug-controls";
import WorkFlowControls from "./workflow-controls";
import {
  loadWorkflowIntoStores,
  type WorkflowLoadResult,
} from "./workflow-loader";

type WorkflowBuilderProps = {
  workflowId?: string | null;
};

const WorkflowBuilder = ({ workflowId = null }: WorkflowBuilderProps) => {
  const loadSnapshot = useNodesStore((state) => state.loadSnapshot);
  const hydrateFromWorkflow = useWorkflowEditorStore(
    (state) => state.hydrateFromWorkflow,
  );
  const [loadState, setLoadState] = useState<WorkflowLoadResult["status"]>(
    workflowId ? "loading" : "idle",
  );

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      if (!workflowId) {
        setLoadState("idle");
        return;
      }

      setLoadState("loading");

      const result = await loadWorkflowIntoStores({
        workflowId,
        fetchImpl: fetch,
        loadSnapshot,
        hydrateFromWorkflow,
      });

      if (isActive) {
        setLoadState(result.status);
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [workflowId, loadSnapshot, hydrateFromWorkflow]);

  if (loadState === "loading") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background px-6">
        <output className="body-2 text-gray-700" aria-live="polite">
          載入 workflow…
        </output>
      </div>
    );
  }

  if (loadState === "missing") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background px-6">
        <p className="body-2 text-red-700" role="alert">
          找不到 workflow。
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background px-6">
        <p className="body-2 text-red-700" role="alert">
          載入 workflow 失敗，請稍後再試。
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh w-full shadow-md">
      <FlowEditor controlsSlot={<WorkFlowControls />} />
      {/* 測試用匯入/匯出區塊，確認後可直接刪除 */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <FlowDebugControls />
      </div>
    </div>
  );
};

export default WorkflowBuilder;
