'use client';

import { type ReactNode } from "react";
import { Check, ChevronDown, Cog, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const EmptyState = () => (
  <div className="flex w-40 flex-col items-center gap-4 text-center">
    <div className="flex size-16 items-center justify-center rounded-2xl bg-module-iconBg">
      <Cog className="size-8 text-gray-600" strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-base font-medium leading-6 text-gray-700">
        請選擇一個節點
      </p>
      <p className="text-sm leading-[21px] text-gray-600">以開始編輯內容</p>
    </div>
  </div>
);

const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperTextClass = "text-xs text-module-muted";

const DropdownField = ({ value }: { value: string }) => (
  <button
    type="button"
    className="flex h-10 w-full items-center justify-between rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
  >
    <span>{value}</span>
    <ChevronDown className="size-4 text-gray-500" />
  </button>
);

const SourceOption = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => (
  <div className="flex items-center gap-2 text-sm text-module-title">
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded border text-white transition",
        checked
          ? "border-green-500 bg-green-500"
          : "border-[#d4d3cc] bg-white text-transparent",
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
    {label}
  </div>
);

const AiNodeSettings = ({ data }: { data: AiCallNodeData }) => (
  <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-lg font-medium text-module-title">呼叫 AI 設定</p>
        <Separator className="bg-module-border" />
      </div>

      <section className="space-y-2">
        <p className={fieldLabelClass}>模型版本</p>
        <DropdownField value={data.model} />
      </section>

      <section className="space-y-3">
        <div className="space-y-2">
          <p className={fieldLabelClass}>輸入來源</p>
          <div className="space-y-2">
            <SourceOption label="標題" checked={data.inputs.title} />
            <SourceOption label="內文" checked={data.inputs.content} />
            <SourceOption label="摘要" checked={data.inputs.summary} />
          </div>
        </div>
        <p className={helperTextClass}>選擇此任務的輸入欄位</p>
      </section>

      <section className="space-y-2">
        <p className={fieldLabelClass}>輸出格式</p>
        <DropdownField value={data.outputFormat} />
      </section>

      <section className="space-y-2">
        <p className={fieldLabelClass}>Prompt 模板</p>
        <Textarea
          className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
          defaultValue={data.promptTemplate}
        />
        <p className={helperTextClass}>
          {"支援變數：${title}, ${content}, ${summary}"}
        </p>
      </section>

      <section className="space-y-2">
        <p className={fieldLabelClass}>CMS 回寫欄位</p>
        <Input
          className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          defaultValue={data.cmsField}
        />
        <p className={helperTextClass}>指定要回寫到 CMS 的欄位名稱</p>
      </section>

      <Separator className="bg-module-border" />

      <section className="space-y-2">
        <p className={fieldLabelClass}>測試輸入</p>
        <Textarea
          className="min-h-[120px] rounded-[10px] border-module-border bg-white text-sm text-module-title"
          placeholder="貼上測試文字..."
          defaultValue={data.testInput}
        />
        <p className={helperTextClass}>在此輸入測試資料</p>
      </section>
    </div>

    <Button
      type="button"
      variant="outline"
      disabled
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border-module-border bg-[#f5f5f1] text-sm text-module-muted"
    >
      <Play className="size-4" strokeWidth={1.75} />
      測試執行
    </Button>
  </div>
);

const NodeSettingSidebar = () => {
  const { nodes, selectedNodeId } = useNodesStore();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  let content: ReactNode = <EmptyState />;
  if (selectedNode?.type === "aiCall") {
    content = (
      <AiNodeSettings data={selectedNode.data as AiCallNodeData} />
    );
  }

  return (
    <Sidebar side="right" className="border-l border-module-border bg-white">
      <SidebarHeader className="node-settings-header">
        <h2 className="text-lg font-medium text-module-title">節點設定</h2>
        <SidebarTrigger
          aria-label="Close node settings"
          className="cursor-pointer text-gray-600 hover:text-gray-700"
        />
      </SidebarHeader>
      <SidebarContent className="flex flex-1 px-0 py-0">{content}</SidebarContent>
      <SidebarFooter className="border-t border-module-border px-4 py-3" />
    </Sidebar>
  );
};

export default NodeSettingSidebar;
