"use client";

import {
  ClockIcon,
  CopyIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { appToast } from "@/components/ui/sonner";
import { WORKFLOW_STATUS_LABELS } from "@/lib/workflow-status";

type Status = "published" | "draft" | "template" | "running";

type CardProps = {
  id: string;
  name: string;
  description: string;
  time: string;
  status: Status;
};

export default function UserWorkflowCard({
  id,
  name,
  description,
  time,
  status,
}: CardProps) {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const handleOpenDropdown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleCopy = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) {
        throw new Error("取得工作流失敗");
      }
      const data = (await response.json()) as {
        nodes: string;
        edges: string;
      };
      const sanitizedName = name.replace(/\s*[（(].*$/u, "").trim();

      const payload = {
        name: sanitizedName || name,
        nodes: JSON.parse(data.nodes),
        edges: JSON.parse(data.edges),
        schedule: { enabled: false, frequency: "daily", slots: [] },
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      appToast.success("工作流 JSON 已複製到剪貼簿");
    } catch (error) {
      console.error(error);
      appToast.error("複製失敗，請稍後再試");
    }
  };

  const handleOpenRenameDialog = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setNewName(name);
    setRenameError(null);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (isRenaming) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      setRenameError("名稱不可為空");
      return;
    }
    setIsRenaming(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        throw new Error("重新命名失敗");
      }
      setIsRenameDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setRenameError("重新命名失敗，請稍後再試");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenDeleteDialog = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("刪除失敗");
      }
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setDeleteError("刪除失敗，請稍後再試");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        href={`/workflow-builder?workflowId=${id}`}
        className="block w-full"
      >
        <Card className="relative w-full min-w-0 rounded-xl border-module-border bg-white p-4 pt-5 hover:shadow-2">
          <div className="absolute top-0 left-5 w-12 h-1 bg-green-500 rounded-b-md opacity-100" />
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon size={20} className="text-green-500" />
                <h3 className="title-5 text-gray-900">{name}</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-700 hover:text-gray-900"
                    onClick={handleOpenDropdown}
                  >
                    <MoreHorizontalIcon size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-gray-900"
                    onClick={handleCopy}
                  >
                    <CopyIcon className="text-gray-700" size={14} />
                    複製
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-900"
                    onClick={handleOpenRenameDialog}
                  >
                    <PencilIcon className="text-gray-700" size={14} />
                    重新命名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={handleOpenDeleteDialog}
                  >
                    <Trash2Icon className="text-gray-700" size={14} />
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="body-2 text-gray-800 flex flex-col gap-y-2 mt-5">
              <div className="flex gap-x-2 items-center">
                <ClockIcon size={16} />
                <p>{time}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-x-2 items-center">
                  <PlayIcon size={16} />
                  <p>{description}</p>
                </div>
                <Badge variant={status}>{WORKFLOW_STATUS_LABELS[status]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 重新命名 Dialog */}
      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open);
          if (!open) setRenameError(null);
        }}
      >
        <DialogContent className="max-w-[448px] rounded-xl border border-gray-300 p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="title-5 text-gray-900">
              重新命名工作流
            </DialogTitle>
            <DialogDescription className="body-2 text-gray-700">
              請輸入新的工作流名稱。
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            disabled={isRenaming}
            className="mt-1"
          />
          {renameError ? (
            <p className="body-2 text-red-600" role="alert">
              {renameError}
            </p>
          ) : null}
          <DialogFooter className="mt-2 flex-row justify-end gap-3">
            <Button
              type="button"
              className="min-h-8 max-h-9 px-3 body-2"
              disabled={isRenaming}
              onClick={() => setIsRenameDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="min-h-8 max-h-9 border-green-500 bg-green-500 px-3 body-2 text-white hover:bg-green-700"
              disabled={isRenaming}
              onClick={handleRename}
            >
              {isRenaming ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認 Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent className="max-w-[448px] rounded-xl border border-gray-300 p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="title-5 text-gray-900">
              確認刪除工作流
            </DialogTitle>
            <DialogDescription className="body-2 text-gray-700">
              確定要刪除{name}嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="body-2 text-red-600" role="alert">
              {deleteError}
            </p>
          ) : null}
          <DialogFooter className="mt-2 flex-row justify-end gap-3 ">
            <Button
              type="button"
              className="min-h-8 max-h-9 px-3 body-2"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "刪除中..." : "刪除"}
            </Button>
            <Button
              type="button"
              className="min-h-8 max-h-9 border-green-500 bg-green-500 px-3 body-2 text-white hover:bg-green-700"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
