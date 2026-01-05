"use client";

import { ArrowRight, Play, Plus, Trash2 } from "lucide-react";

import type {
  CmsFieldMapping,
  CmsOutputNodeData,
} from "@/components/flow/nodes/cms-output-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { generateId } from "@/utils/generate-id";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperClass = "text-xs text-module-muted";
const selectClass =
  "h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0";

const cmsLocations = ["READr", "Custom CMS"];
const modeOptions: Array<{
  value: CmsOutputNodeData["mode"];
  label: string;
  description: string;
}> = [
  {
    value: "overwrite",
    label: "Overwrite（覆寫）",
    description: "新資料會完全取代現有資料",
  },
  {
    value: "append",
    label: "Append（附加）",
    description: "新資料將附加在原有內容後方",
  },
];

const FieldMappingRow = ({
  mapping,
  onChange,
  onRemove,
  disableRemove,
}: {
  mapping: CmsFieldMapping;
  onChange: (
    mappingId: string,
    field: "sourceField" | "targetField",
    value: string,
  ) => void;
  onRemove: (mappingId: string) => void;
  disableRemove: boolean;
}) => (
  <div className="flex w-full items-center gap-2">
    <Input
      value={mapping.sourceField}
      placeholder="AI output"
      className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
      onChange={(event) =>
        onChange(mapping.id, "sourceField", event.target.value)
      }
    />
    <ArrowRight className="size-4 text-[#a09d92]" strokeWidth={1.75} />
    <Input
      value={mapping.targetField}
      placeholder="CMS tags"
      className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
      onChange={(event) =>
        onChange(mapping.id, "targetField", event.target.value)
      }
    />
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label="移除欄位對應"
      disabled={disableRemove}
      className="text-[#6e6b5e] hover:bg-transparent hover:text-[#2a2822] disabled:text-[#d4d3cc]"
      onClick={() => onRemove(mapping.id)}
    >
      <Trash2 className="size-4" strokeWidth={1.5} />
    </Button>
  </div>
);

const CmsOutputNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: CmsOutputNodeData;
}) => {
  const updateCmsOutputNodeData = useNodesStore(
    (state) => state.updateCmsOutputNodeData,
  );

  const handleDataChange = (payload: Partial<CmsOutputNodeData>) => {
    updateCmsOutputNodeData(nodeId, payload);
  };

  const handleLocationChange = (value: string) => {
    handleDataChange({ cmsLocation: value });
  };

  const handleArticleIdChange = (value: string) => {
    handleDataChange({ articleIdOrSlug: value });
  };

  const handleMappingChange = (
    mappingId: string,
    field: "sourceField" | "targetField",
    value: string,
  ) => {
    handleDataChange({
      mappings: data.mappings.map((mapping) =>
        mapping.id === mappingId ? { ...mapping, [field]: value } : mapping,
      ),
    });
  };

  const handleAddMapping = () => {
    handleDataChange({
      mappings: [
        ...data.mappings,
        {
          id: generateId(),
          sourceField: "",
          targetField: "",
        },
      ],
    });
  };

  const handleRemoveMapping = (mappingId: string) => {
    if (data.mappings.length === 1) return;
    handleDataChange({
      mappings: data.mappings.filter((mapping) => mapping.id !== mappingId),
    });
  };

  const handleModeChange = (mode: CmsOutputNodeData["mode"]) => {
    handleDataChange({ mode });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            輸出到 CMS 設定
          </p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>CMS 寫入位置</p>
          <select
            value={data.cmsLocation}
            onChange={(event) => handleLocationChange(event.target.value)}
            className={selectClass}
          >
            {cmsLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>文章 ID 或 slug</p>
          <Input
            value={data.articleIdOrSlug}
            placeholder="輸入目標文章的 ID 或 slug"
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            onChange={(event) => handleArticleIdChange(event.target.value)}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={labelClass}>欄位對應</p>
            <button
              type="button"
              onClick={handleAddMapping}
              className="flex items-center gap-2 text-sm font-medium text-module-title"
            >
              <Plus className="size-4 text-[#6e6b5e]" strokeWidth={1.75} />
              新增對應
            </button>
          </div>
          <div className="space-y-2">
            {data.mappings.map((mapping) => (
              <FieldMappingRow
                key={mapping.id}
                mapping={mapping}
                disableRemove={data.mappings.length === 1}
                onChange={handleMappingChange}
                onRemove={handleRemoveMapping}
              />
            ))}
          </div>
          <p className={helperClass}>
            設定 AI 輸出欄位對應到 CMS 欄位的對應關係
          </p>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>寫入模式</p>
          <div className="space-y-2">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleModeChange(option.value)}
                className="flex w-full items-center gap-2 text-sm text-module-title"
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition",
                    option.value === data.mode
                      ? "border-[#00967d]"
                      : "border-[#d4d3cc]",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full bg-[#00967d] transition",
                      option.value === data.mode ? "opacity-100" : "opacity-0",
                    )}
                  />
                </span>
                {option.label}
              </button>
            ))}
          </div>
          <p className={helperClass}>
            {
              modeOptions.find((option) => option.value === data.mode)
                ?.description
            }
          </p>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>驗證 API Key</p>
          <Button
            type="button"
            variant="outline"
            disabled
            className="flex w-full items-center justify-center rounded-[10px] border-module-border bg-white text-sm text-module-title"
          >
            <Play className="size-4 text-[#2a2822]" strokeWidth={1.5} />
            測試 CMS 權限連線
          </Button>
        </section>
      </div>
    </div>
  );
};

export default CmsOutputNodeSetting;
