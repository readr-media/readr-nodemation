"use client";

import { CopyIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import IconAdd from "@/public/add.svg";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

type TemplateOption = {
  id: number;
  name: string;
  description: string;
  nodes: string;
  edges: string;
};

type CreateWorkflowDialogProps = {
  templates: TemplateOption[];
  triggerVariant?: "button" | "card";
};

type CreateWorkflowResponse = {
  id?: string;
  error?: string;
};

export default function CreateWorkflowDialog({
  templates,
  triggerVariant = "button",
}: CreateWorkflowDialogProps) {
  const router = useRouter();
  const { activeUserId } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => String(template.id) === selectedTemplateId),
    [selectedTemplateId, templates],
  );

  const canCreate = selectedTemplate !== undefined && !isCreating;

  const handleCreateCopy = async () => {
    if (!selectedTemplate || isCreating) return;

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedTemplate.name}（副本）`,
          description: selectedTemplate.description || undefined,
          nodes: selectedTemplate.nodes,
          edges: selectedTemplate.edges,
          status: "draft",
        }),
      });

      const result = (await response.json()) as CreateWorkflowResponse;
      if (!response.ok) {
        throw new Error(result.error ?? "建立失敗");
      }

      if (!result.id) {
        throw new Error("建立成功但未取得 workflow id");
      }

      setIsOpen(false);
      startTransition(() => {
        router.push(`/workflow-builder?workflowId=${result.id}`);
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "建立失敗，請稍後再試",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedTemplateId("");
      setErrorMessage(null);
    }
  };

  const handleOpenCreateDialog = () => {
    if (!activeUserId) {
      return;
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === "card" ? (
          <Card
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              event.stopPropagation();
              void handleOpenCreateDialog();
            }}
            className={cn(
              "flex h-[157px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-module-border bg-white px-4 py-6 hover:shadow-2 disabled:opacity-50",
              !activeUserId && "cursor-not-allowed hover:shadow-none",
            )}
          >
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Image
                src={IconAdd}
                width={48}
                height={48}
                alt="add icon"
                className={cn(!activeUserId && "opacity-50")}
              />
              <div className="mt-5 text-center">
                <p
                  className={cn(
                    "text-base font-normal",
                    !activeUserId && "opacity-50",
                  )}
                >
                  建立新工作流
                </p>
                <p
                  className={cn(
                    "text-sm font-normal text-[#4a4842]",
                    !activeUserId && "opacity-50",
                  )}
                >
                  從空白開始設計流程
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            className="bg-green-500 text-white hover:bg-green-700"
            disabled={!activeUserId}
          >
            <PlusIcon />
            建立新工作流
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[560px] rounded-2xl border border-gray-400 bg-white p-6">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="title-4 text-gray-900">
            建立新工作流
          </DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-300"
              aria-label="關閉建立新工作流彈窗"
            >
              <XIcon size={16} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div>
          <p className="title-6 mb-2 text-gray-900">工作流模板</p>
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
          >
            <SelectTrigger className="h-10 w-full rounded-lg border border-gray-400 px-3 body-2 data-placeholder:text-gray-600 data-[state=open]:border-gray-600">
              <SelectValue placeholder="請選擇要複製的工作流模板" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-gray-300 bg-white p-0 shadow-2">
              {templates.map((template) => (
                <SelectItem
                  key={template.id}
                  value={String(template.id)}
                  className="body-1 px-4 py-3 text-gray-900 hover:bg-gray-300 focus:bg-gray-300"
                >
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errorMessage ? (
          <p className="body-2 mt-1 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="border-gray-400 text-gray-900 hover:bg-gray-300"
              disabled={isCreating}
            >
              <XIcon size={16} />
              取消
            </Button>
          </DialogClose>

          <Button
            type="button"
            className="bg-green-500 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!canCreate}
            onClick={handleCreateCopy}
          >
            <CopyIcon />
            {isCreating ? "建立中..." : "建立副本"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
