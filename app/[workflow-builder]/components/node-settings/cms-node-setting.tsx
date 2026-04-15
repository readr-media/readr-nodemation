"use client";

import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import { Input } from "@/components/ui/input";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

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

  const handleFieldToggle = (
    field: keyof CmsInputNodeData["sourceFields"],
  ) => {
    updateCmsNodeData(nodeId, {
      sourceFields: {
        ...data.sourceFields,
        [field]: !data.sourceFields[field],
      },
    });
  };
  const handleCmsNameChange = (value: string) =>
    updateCmsNodeData(nodeId, { cmsName: value });
  const handleCmsPostIdsChange = (value: string) =>
    updateCmsNodeData(nodeId, { cmsPostIds: value });
  const handleCmsPostSlugsChange = (value: string) =>
    updateCmsNodeData(nodeId, { cmsPostSlugs: value });

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
          <p className={labelClass}>來源CMS名稱</p>
          <Input
            value={data.cmsName}
            onChange={(event) => handleCmsNameChange(event.target.value)}
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>來源CMS List</p>
          <Input
            value={data.cmsList}
            readOnly
            disabled
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
          <p className={helperClass}>本期固定使用 Posts</p>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>文章ID</p>
          <Input
            value={data.cmsPostIds}
            onChange={(event) => handleCmsPostIdsChange(event.target.value)}
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>文章slug</p>
          <Input
            value={data.cmsPostSlugs}
            onChange={(event) => handleCmsPostSlugsChange(event.target.value)}
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
        </section>

        <section className="space-y-3">
          <p className={labelClass}>抓取欄位</p>
          <div className="space-y-2">
            <FieldToggle
              label="標題"
              checked={data.sourceFields.title}
              onToggle={() => handleFieldToggle("title")}
            />
            <FieldToggle
              label="分類"
              checked={data.sourceFields.category}
              onToggle={() => handleFieldToggle("category")}
            />
            <FieldToggle
              label="內文"
              checked={data.sourceFields.content}
              onToggle={() => handleFieldToggle("content")}
            />
            <FieldToggle
              label="標籤"
              checked={data.sourceFields.tags}
              onToggle={() => handleFieldToggle("tags")}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CmsNodeSetting;
