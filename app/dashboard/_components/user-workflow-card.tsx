"use client";

import {
  ClockIcon,
  Loader2Icon,
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

type Status = "published" | "draft" | "template" | "running";

type CardProps = {
  id: string;
  name: string;
  description: string;
  time: string;
  status: Status;
};

const statusMap = {
  published: "已發佈",
  draft: "草稿",
  template: "模板",
  running: "執行中",
};

export default function UserWorkflowCard({
  id,
  name,
  description,
  time,
  status,
}: CardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenDeleteDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("刪除失敗");
      }

      setIsDialogOpen(false);
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
              <Button
                type="button"
                onClick={handleOpenDeleteDialog}
                disabled={isDeleting}
                className="border-none p-2 text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <Trash2Icon size={16} />
                {isDeleting ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  "刪除"
                )}
              </Button>
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
                <Badge variant={status}>{statusMap[status]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setDeleteError(null);
          }
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
          <DialogFooter className="mt-2 flex-row justify-end gap-3">
            <Button
              type="button"
              className="h-12 px-5 body-2"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "刪除中..." : "刪除"}
            </Button>
            <Button
              type="button"
              className="h-12 border-green-500 bg-green-500 px-5 body-2 text-white hover:bg-green-700"
              disabled={isDeleting}
              onClick={() => setIsDialogOpen(false)}
            >
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
