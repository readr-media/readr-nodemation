"use client";
import {
  ArrowLeftIcon,
  BugIcon,
  MoreHorizontalIcon,
  PlayIcon,
  SendIcon,
  UploadIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserInfo } from "@/components/layout/user-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SaveWorkflowDialog from "./save-workflow-dialog";

function InlineEditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        aria-label="Workflow title"
        name="workflowTitle"
        autoComplete="off"
        className={`transition-[width,border-color,background-color,box-shadow] w-36 body-1 px-2 py-1 ${
          isEditing
            ? "border-gray-600 w-[200px]"
            : "shadow-none border-none hover:bg-gray-300 cursor-pointer"
        }`}
      />
    </div>
  );
}

export default function Header() {
  const [workflowName, setWorkflowName] = useState("文章自動分類與標記");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState("draft");
  const statusLabel = workflowStatus === "draft" ? "草稿" : workflowStatus;

  return (
    <header>
      <div className="w-full bg-white/80 px-6 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center gap-x-4">
          <Button
            type="button"
            aria-label="Back"
            className="has-[>svg]:px-2 border-none hover:bg-gray-300"
          >
            <ArrowLeftIcon aria-hidden="true" />
          </Button>
          <InlineEditableText value={workflowName} onChange={setWorkflowName} />
          <Badge variant="draft">{statusLabel}</Badge>
        </div>

        <div className="flex items-center gap-x-3">
          <p className="text-gray-700 body-3">未儲存變更</p>
          <Button className="border-gray-100 text-gray-600">
            <BugIcon aria-hidden="true" />
            測試節點
          </Button>
          <SaveWorkflowDialog
            workflowName={workflowName}
            onWorkflowNameChange={setWorkflowName}
            workflowDescription={workflowDescription}
            onWorkflowDescriptionChange={setWorkflowDescription}
            workflowStatus={workflowStatus}
            onWorkflowStatusChange={setWorkflowStatus}
          />
          <Button className="hover:bg-gray-300">
            <UploadIcon aria-hidden="true" />
            匯出
          </Button>
          <Button
            type="button"
            aria-label="More options"
            className="has-[>svg]:px-2 hover:bg-gray-300"
          >
            <MoreHorizontalIcon size={16} aria-hidden="true" />
          </Button>
          <Button className="bg-green-500 text-white border-green-500 hover:bg-green-700">
            <SendIcon aria-hidden="true" />
            發布
          </Button>
          <Button className="border-green-500 text-green-700 hover:bg-green-100">
            <PlayIcon aria-hidden="true" />
            執行
          </Button>
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
