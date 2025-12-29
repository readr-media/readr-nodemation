"use client";

import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import { Input } from "@/components/ui/input";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const sources = ["READr CMS", "Custom API"];
const outputFormats = ["JSON", "Text"];
const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperClass = "text-xs text-module-muted";

const FieldToggle = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center gap-3 text-sm text-module-title"
  >
    <span
      className={`flex size-4 items-center justify-center rounded border text-white transition ${
        checked
          ? "border-[#00967d] bg-[#00967d]"
          : "border-[#d4d3cc] bg-white text-transparent"
      }`}
    >
      <span className="size-2 rounded-sm bg-white" />
    </span>
    {label}
  </button>
);

const CmsNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: CmsInputNodeData;
}) => {
  const updateCmsNodeData = useNodesStore((state) => state.updateCmsNodeData);

  const handleSourceChange = (value: string) =>
    updateCmsNodeData(nodeId, { source: value });
  const handleEntryChange = (value: string) =>
    updateCmsNodeData(nodeId, { entryId: value });
  const handleFieldToggle = (field: keyof CmsInputNodeData["fields"]) => {
    updateCmsNodeData(nodeId, {
      fields: { ...data.fields, [field]: !data.fields[field] },
    });
  };
  const handleOutputFormatChange = (value: string) =>
    updateCmsNodeData(nodeId, { outputFormat: value });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            從 CMS 輸入 設定
          </p>
          <p className="text-sm text-module-muted">設定資料來源與抓取欄位</p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>資料來源</p>
          <select
            value={data.source}
            onChange={(event) => handleSourceChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>文章 ID 或 slug</p>
          <Input
            value={data.entryId}
            onChange={(event) => handleEntryChange(event.target.value)}
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
          <p className={helperClass}>指定要回寫到 CMS 的欄位名稱</p>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>抓取欄位</p>
          <div className="space-y-2">
            <FieldToggle
              label="標題"
              checked={data.fields.title}
              onToggle={() => handleFieldToggle("title")}
            />
            <FieldToggle
              label="內文"
              checked={data.fields.content}
              onToggle={() => handleFieldToggle("content")}
            />
            <FieldToggle
              label="作者"
              checked={data.fields.author}
              onToggle={() => handleFieldToggle("author")}
            />
            <FieldToggle
              label="分類"
              checked={data.fields.category}
              onToggle={() => handleFieldToggle("category")}
            />
          </div>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>輸出格式</p>
          <select
            value={data.outputFormat}
            onChange={(event) => handleOutputFormatChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            {outputFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </section>
      </div>
    </div>
  );
};

export default CmsNodeSetting;
