"use client";

import { CopyIcon, PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TemplateOption = {
  id: number;
  name: string;
  description: string;
  nodes: string;
  edges: string;
};

type CreateWorkflowDialogProps = {
  templates: TemplateOption[];
};

type CreateWorkflowResponse = {
  id?: string;
  error?: string;
};

export default function CreateWorkflowDialog({
  templates,
}: CreateWorkflowDialogProps) {
  const router = useRouter();
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
      router.push(`/workflow-builder?workflowId=${result.id}`);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 text-white hover:bg-green-700">
          <PlusIcon />
          建立新工作流
        </Button>
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
