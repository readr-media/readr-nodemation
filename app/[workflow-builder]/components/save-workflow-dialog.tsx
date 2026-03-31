"use client";

import { useRouter } from "next/navigation";
import { SaveIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATUSES, type WorkflowStatus } from "@/lib/workflow-status";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { useWorkflowEditorStore } from "@/stores/workflow-editor/store";
import { saveWorkflow } from "./save-workflow-action";
import {
  getInitialSaveMode,
  getSaveWorkflowSubmitLabel,
  shouldShowSaveModeSelector,
  type SaveMode,
} from "./save-workflow-dialog-state";

const dialogContentStyle =
  "max-w-[560px] h-[387px] border border-gray-400 rounded-xl p-6 bg-gray-200 gap-y-5 overscroll-contain overflow-y-auto scrollbar-hidden";
const labelStyle = "title-6 text-gray-900 mb-2";
const inputBaseStyle =
  "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
const inputFocusStyle =
  "placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600";
const selectTriggerStyle =
  "w-full cursor-pointer data-[placeholder]:text-gray-600 data-[state=open]:border-gray-600";

const emptyDisplay = "(空白)";

const statusLabels: Record<WorkflowStatus, string> = {
  template: "範本",
  draft: "草稿",
  published: "已發佈",
  running: "執行中",
};

type SaveWorkflowDialogProps = {
  workflowName: string;
  onWorkflowNameChange: (value: string) => void;
  workflowDescription: string;
  onWorkflowDescriptionChange: (value: string) => void;
  workflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (value: WorkflowStatus) => void;
};

const SaveWorkflowDialog = ({
  workflowName,
  onWorkflowNameChange,
  workflowDescription,
  onWorkflowDescriptionChange,
  workflowStatus,
  onWorkflowStatusChange,
}: SaveWorkflowDialogProps) => {
  const router = useRouter();
  const { nodes, edges } = useNodesStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );
  const workflowId = useWorkflowEditorStore((state) => state.workflowId);
  const resetBaseline = useWorkflowEditorStore((state) => state.resetBaseline);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode>(
    getInitialSaveMode(workflowId),
  );
  const hasExistingWorkflow = shouldShowSaveModeSelector(workflowId);

  const nodesJson = useMemo(() => JSON.stringify(nodes, null, 2), [nodes]);
  const edgesJson = useMemo(() => JSON.stringify(edges, null, 2), [edges]);

  useEffect(() => {
    setSaveMode(getInitialSaveMode(workflowId));
  }, [workflowId, isOpen]);

  const performSave = async (mode: SaveMode) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (
        mode === "update" &&
        typeof window !== "undefined" &&
        !window.confirm("確定要更新原 workflow 嗎？")
      ) {
        setIsSaving(false);
        return;
      }

      const result = await saveWorkflow({
        mode,
        workflowId,
        name: workflowName,
        description: workflowDescription,
        status: workflowStatus,
        nodes,
        edges,
        fetchImpl: fetch,
        resetBaseline,
      });

      if (mode === "save-as-new") {
        router.replace(`/workflow-builder?workflowId=${result.workflowId}`);
      }

      setSuccessMessage(
        mode === "update" ? "已更新原 workflow" : "已另存為新 workflow",
      );
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "未知錯誤";
      setErrorMessage(`儲存失敗，請稍後再試。${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await performSave(saveMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="hover:bg-gray-300"
          aria-label="Save workflow"
        >
          <SaveIcon aria-hidden="true" />
          儲存
        </Button>
      </DialogTrigger>

      <DialogContent className={dialogContentStyle}>
        <DialogHeader>
          <DialogTitle className="title-4 text-balance text-gray-900">
            儲存工作流程
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
          {hasExistingWorkflow ? (
            <div className="grid gap-2">
              <Label className={labelStyle}>儲存方式</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={saveMode === "update" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSaveMode("update")}
                >
                  更新原 workflow
                </Button>
                <Button
                  type="button"
                  variant={saveMode === "save-as-new" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSaveMode("save-as-new")}
                >
                  另存新 workflow
                </Button>
              </div>
            </div>
          ) : null}

          <div>
            <Label htmlFor="workflow-name" className={labelStyle}>
              Workflow 名稱
            </Label>
            <Input
              id="workflow-name"
              name="workflowName"
              value={workflowName}
              onChange={(event) => onWorkflowNameChange(event.target.value)}
              placeholder="（空白…）"
              autoComplete="off"
              className={cn(inputBaseStyle, inputFocusStyle)}
            />
          </div>

          <div>
            <Label htmlFor="workflow-description" className={labelStyle}>
              描述（選填）
            </Label>
            <Textarea
              id="workflow-description"
              name="workflowDescription"
              value={workflowDescription}
              onChange={(event) =>
                onWorkflowDescriptionChange(event.target.value)
              }
              placeholder="（空白…）"
              autoComplete="off"
              className={cn(inputBaseStyle, inputFocusStyle)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="workflow-status" className={labelStyle}>
              狀態
            </Label>
            <Select
              value={workflowStatus}
              onValueChange={(value) =>
                onWorkflowStatusChange(value as WorkflowStatus)
              }
            >
              <SelectTrigger
                id="workflow-status"
                className={cn(
                  inputBaseStyle,
                  inputFocusStyle,
                  selectTriggerStyle,
                )}
              >
                <SelectValue placeholder="請選擇狀態" />
              </SelectTrigger>
              <SelectContent side="bottom" sideOffset={9}>
                {WORKFLOW_STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="cursor-pointer"
                  >
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className={labelStyle}>設定確認</Label>
            <div className="rounded-lg border border-gray-400 bg-white px-4 py-3 body-2 text-gray-900">
              <div className="flex flex-col gap-1">
                <span>名稱：{workflowName || emptyDisplay}</span>
                <span>描述：{workflowDescription || emptyDisplay}</span>
                <span>狀態：{workflowStatus || emptyDisplay}</span>
                <span>Nodes：{nodes.length}</span>
                <span>Edges：{edges.length}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <Label htmlFor="workflow-nodes" className={labelStyle}>
                Nodes JSON
              </Label>
              <Textarea
                id="workflow-nodes"
                value={nodesJson}
                readOnly
                rows={6}
                className={cn(inputBaseStyle, inputFocusStyle)}
              />
            </div>
            <div>
              <Label htmlFor="workflow-edges" className={labelStyle}>
                Edges JSON
              </Label>
              <Textarea
                id="workflow-edges"
                value={edgesJson}
                readOnly
                rows={6}
                className={cn(inputBaseStyle, inputFocusStyle)}
              />
            </div>
          </div>

          <output aria-live="polite" className="body-2 text-gray-700">
            {successMessage}
          </output>
          {errorMessage ? (
            <output aria-live="polite" className="body-2 text-red-600">
              {errorMessage}
            </output>
          ) : null}

          <DialogFooter className="flex gap-x-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-3 border-gray-400 bg-white text-gray-900 hover:bg-gray-400"
              >
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1 px-3 border-gray-400 text-white bg-green-500 hover:bg-green-700"
              disabled={isSaving}
            >
              {getSaveWorkflowSubmitLabel({ saveMode, isSaving })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkflowDialog;
