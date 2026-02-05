"use client";

import { SaveIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
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
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const dialogContentStyle =
  "max-w-[560px] h-[387px] border border-gray-400 rounded-xl p-6 bg-gray-200 gap-y-5 overscroll-contain overflow-y-auto scrollbar-hidden";
const labelStyle = "title-6 text-gray-900 mb-2";
const inputBaseStyle =
  "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
const inputFocusStyle =
  "placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600";

const emptyDisplay = "(空白)";

type SaveWorkflowDialogProps = {
  workflowName: string;
  onWorkflowNameChange: (value: string) => void;
  workflowDescription: string;
  onWorkflowDescriptionChange: (value: string) => void;
  workflowStatus: string;
  onWorkflowStatusChange: (value: string) => void;
};

const SaveWorkflowDialog = ({
  workflowName,
  onWorkflowNameChange,
  workflowDescription,
  onWorkflowDescriptionChange,
  workflowStatus,
  onWorkflowStatusChange,
}: SaveWorkflowDialogProps) => {
  const { nodes, edges } = useNodesStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nodesJson = useMemo(() => JSON.stringify(nodes, null, 2), [nodes]);
  const edgesJson = useMemo(() => JSON.stringify(edges, null, 2), [edges]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription || undefined,
          status: workflowStatus,
          nodes: nodesJson,
          edges: edgesJson,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to save workflow");
      }

      setSuccessMessage("已儲存到 SQLite");
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "未知錯誤";
      setErrorMessage(`儲存失敗，請稍後再試。${message}`);
    } finally {
      setIsSaving(false);
    }
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
            <Input
              id="workflow-description"
              name="workflowDescription"
              value={workflowDescription}
              onChange={(event) =>
                onWorkflowDescriptionChange(event.target.value)
              }
              placeholder="（空白…）"
              autoComplete="off"
              className={cn(inputBaseStyle, inputFocusStyle)}
            />
          </div>

          <div>
            <Label htmlFor="workflow-status" className={labelStyle}>
              狀態
            </Label>
            <Input
              id="workflow-status"
              name="workflowStatus"
              value={workflowStatus}
              onChange={(event) => onWorkflowStatusChange(event.target.value)}
              placeholder="draft…"
              autoComplete="off"
              className={cn(inputBaseStyle, inputFocusStyle)}
            />
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
              {isSaving ? "儲存中…" : "確認儲存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkflowDialog;
