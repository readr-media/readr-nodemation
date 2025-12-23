"use client";

import { type ChangeEvent, useMemo, useRef } from "react";

import type { ExportResultNodeData } from "@/components/flow/nodes/export-result-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperClass = "text-xs text-module-muted";

const sourceOptions = ["AI Tagging → tags", "AI Summary → summary"];
const formatOptions = ["JSON", "純文字（.txt）"];
const destinationOptions = [
  { value: "local_download", label: "本地下載" },
  { value: "google_drive", label: "Google Drive" },
] as const;
const variableNames = ["workflow_name", "date"] as const;
const filenameVariables = variableNames.map((name) => `\${${name}}`);
const defaultFileNameHint = `${filenameVariables[0]}_${filenameVariables[1]}.json`;

const Toggle = ({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  "aria-label": string;
  onChange: (value: boolean) => void;
}) => (
  <button
    type="button"
    aria-pressed={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={cn(
      "flex h-[18px] w-8 items-center rounded-full border border-transparent transition-colors",
      checked ? "bg-[#00967d]" : "bg-[#d4d3cc]",
    )}
  >
    <span
      className={cn(
        "ml-0.5 size-4 rounded-full bg-white transition-transform",
        checked ? "translate-x-[14px]" : "translate-x-0",
      )}
    />
  </button>
);

const ExportNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: ExportResultNodeData;
}) => {
  const updateExportNodeData = useNodesStore(
    (state) => state.updateExportNodeData,
  );
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const variableText = useMemo(() => filenameVariables.join("、"), []);

  const handleDataChange = (payload: Partial<ExportResultNodeData>) => {
    updateExportNodeData(nodeId, payload);
  };

  const handleSelectChange =
    (
      field: keyof Pick<
        ExportResultNodeData,
        "source" | "format" | "destination"
      >,
    ) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      handleDataChange({
        [field]: event.target.value,
      } as Partial<ExportResultNodeData>);
    };

  const handleFileNameChange = (value: string) => {
    handleDataChange({ fileNamePattern: value });
  };

  const handleInsertVariable = (variable: string) => {
    const input = fileNameInputRef.current;
    const currentValue = data.fileNamePattern;
    if (!input) {
      handleFileNameChange(`${currentValue}${variable}`);
      return;
    }
    const start = input.selectionStart ?? currentValue.length;
    const end = input.selectionEnd ?? start;
    const nextValue =
      currentValue.slice(0, start) + variable + currentValue.slice(end);
    handleFileNameChange(nextValue);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + variable.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">匯出結果 設定</p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>輸出內容來源</p>
          <select
            value={data.source}
            onChange={handleSelectChange("source")}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>匯出格式</p>
          <select
            value={data.format}
            onChange={handleSelectChange("format")}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            {formatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>檔案命名規則</p>
          <Input
            ref={fileNameInputRef}
            value={data.fileNamePattern}
            placeholder={defaultFileNameHint}
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            onChange={(event) => handleFileNameChange(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {filenameVariables.map((variable) => (
              <Button
                key={variable}
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full border-module-border px-3 py-1 text-xs text-module-title"
                onClick={() => handleInsertVariable(variable)}
              >
                {variable}
              </Button>
            ))}
          </div>
          <p className={helperClass}>支援變數：{variableText}</p>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>儲存目的地</p>
          <select
            value={data.destination}
            onChange={handleSelectChange("destination")}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            {destinationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={labelClass}>自動開啟下載</p>
              <p className={helperClass}>執行完成後自動觸發下載視窗</p>
            </div>
            <Toggle
              aria-label="自動開啟下載"
              checked={data.autoDownload}
              onChange={(value) => handleDataChange({ autoDownload: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={labelClass}>壓縮檔選項</p>
              <p className={helperClass}>若匯出為多檔案則壓成 ZIP</p>
            </div>
            <Toggle
              aria-label="壓縮檔選項"
              checked={data.zipFiles}
              onChange={(value) => handleDataChange({ zipFiles: value })}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExportNodeSetting;
