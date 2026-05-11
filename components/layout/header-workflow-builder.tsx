"use client";

import {
  ArrowLeftIcon,
  Clock3Icon,
  MoreHorizontalIcon,
  PlayIcon,
  SaveIcon,
  UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { saveWorkflow } from "@/app/[workflow-builder]/components/save-workflow-action";
import ScheduleDialog from "@/app/[workflow-builder]/components/schedule-dialog";
import { UserInfo } from "@/components/layout/user-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appToast } from "@/components/ui/sonner";
import { useFlowJSON } from "@/hooks/use-flow-json";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { useWorkflowEditorStore } from "@/stores/workflow-editor/store";

const statusLabels = {
  template: "模板",
  draft: "草稿",
  published: "已發佈",
  running: "執行中",
} as const;

// function InlineEditableText() {
//   const [isEditing, setIsEditing] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const workflowName = useWorkflowEditorStore((state) => state.name);
//   const setWorkflowName = useWorkflowEditorStore((state) => state.setName);

//   useEffect(() => {
//     if (isEditing && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isEditing]);

//   return (
//     <div>
//       <Input
//         ref={inputRef}
//         aria-label="Workflow 名稱"
//         value={workflowName}
//         onChange={(event) => setWorkflowName(event.target.value)}
//         onFocus={() => setIsEditing(true)}
//         onBlur={() => setIsEditing(false)}
//         className={`transition-all w-36 body-1 px-2 py-1 ${
//           isEditing
//             ? "border-gray-600 w-[200px]"
//             : "shadow-none border-none hover:bg-gray-300 cursor-pointer"
//         }`}
//       />
//     </div>
//   );
// }

export default function WorkflowBuilderHeader() {
  const { handleExport } = useFlowJSON();
  const router = useRouter();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { nodes, edges } = useNodesStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );
  const workflowId = useWorkflowEditorStore((state) => state.workflowId);
  const resetBaseline = useWorkflowEditorStore((state) => state.resetBaseline);
  const workflowName = useWorkflowEditorStore((state) => state.name);
  const workflowDescription = useWorkflowEditorStore(
    (state) => state.description,
  );
  const workflowStatus = useWorkflowEditorStore((state) => state.status);
  const setWorkflowStatus = useWorkflowEditorStore((state) => state.setStatus);
  const canPersistWorkflow = useMemo(
    () =>
      workflowStatus !== "template" &&
      workflowName.trim().length > 0 &&
      !isSaving &&
      !isRunning,
    [workflowName, workflowStatus, isRunning, isSaving],
  );
  const canRunWorkflow = useMemo(
    () => workflowStatus !== "template" && !isRunning && !isSaving,
    [isRunning, isSaving, workflowStatus],
  );

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const handlePersistWorkflow = useCallback(
    async (targetStatus: "published" | "running") => {
      if (!workflowName.trim()) {
        appToast.error("請先輸入工作流名稱");
        return;
      }

      const mode = workflowId ? "update" : "save-as-new";
      if (targetStatus === "published") {
        setIsSaving(true);
      } else {
        setIsRunning(true);
      }

      try {
        const result = await saveWorkflow({
          mode,
          workflowId,
          name: workflowName,
          description: workflowDescription,
          status: targetStatus,
          nodes,
          edges,
          fetchImpl: fetch,
          resetBaseline,
        });

        if (!workflowId) {
          router.replace(`/workflow-builder?workflowId=${result.workflowId}`);
        }

        setWorkflowStatus(targetStatus);
        appToast.success(targetStatus === "published" ? "工作流已儲存" : "工作流已執行");
      } catch (error) {
        console.error(error);
        appToast.error(
          targetStatus === "running"
            ? "工作流執行失敗，請檢查錯誤節點"
            : error instanceof Error
              ? error.message
              : "工作流儲存失敗，請稍後再試",
        );
      } finally {
        if (targetStatus === "published") {
          setIsSaving(false);
        } else {
          setIsRunning(false);
        }
      }
    },
    [
      edges,
      nodes,
      resetBaseline,
      router,
      setWorkflowStatus,
      workflowDescription,
      workflowId,
      workflowName,
    ],
  );

  return (
    <header>
      <div className="flex h-16 w-full items-center justify-between border-b border-b-[#e8e7e2/80] bg-white/80 px-6 text-base font-normal">
        <div className="flex items-center gap-x-4">
          <Button
            aria-label="返回 Dashboard"
            className="has-[>svg]:px-2 border-none hover:bg-gray-300"
            onClick={handleBack}
          >
            <ArrowLeftIcon />
          </Button>
          {/* <InlineEditableText /> */}
          <h2 className="body-1 text-gray-900 px-2">{workflowName}</h2>
          {workflowStatus === "template" && (
            <Badge variant={workflowStatus}>
              {statusLabels[workflowStatus]}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-x-3">
          {/* {isDirty ? (
            <p className="body-3 text-gray-700" aria-live="polite">
              未儲存變更
            </p>
          ) : null} */}
          <Button className="hover:bg-gray-300" onClick={handleExport}>
            <UploadIcon aria-hidden="true" />
            匯出
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="更多操作"
                className="has-[>svg]:px-2 hover:bg-gray-300"
              >
                <MoreHorizontalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border border-gray-400 bg-white p-1 shadow-2"
            >
              <DropdownMenuItem
                className="body-2 flex items-center gap-2 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-300 focus:bg-gray-300"
                onSelect={() => {
                  setIsScheduleDialogOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-gray-300 text-gray-700">
                  <Clock3Icon className="size-4" />
                </div>
                設定執行時間
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="border-green-500 text-green-700 hover:bg-green-100 disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canPersistWorkflow}
            onClick={() => void handlePersistWorkflow("published")}
          >
            <SaveIcon aria-hidden="true" />
            {isSaving ? "儲存中..." : "儲存"}
          </Button>
          <Button
            className="border-green-500 bg-green-500 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canRunWorkflow}
            onClick={() => void handlePersistWorkflow("running")}
          >
            <PlayIcon aria-hidden="true" />
            {isRunning ? "執行中..." : "執行"}
          </Button>

          <UserInfo />
        </div>
      </div>
      <ScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      />
    </header>
  );
}
