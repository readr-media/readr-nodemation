"use client";

import { Check } from "lucide-react";
import type {
  CmsOutputNodeData,
  CmsOutputTargetField,
} from "@/components/flow/nodes/cms-output-node";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { generateId } from "@/utils/generate-id";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const fieldToggleLabelClass =
  "text-base font-medium leading-none text-module-title";

const cmsOutputFieldOptions: Array<{
  label: string;
  targetField: CmsOutputTargetField;
  disabled: boolean;
}> = [
  { label: "標題", targetField: "title", disabled: true },
  {
    label: "建議標題",
    targetField: "recommendedTitle",
    disabled: true,
  },
  { label: "內文", targetField: "content", disabled: true },
  { label: "重點摘要", targetField: "summary", disabled: true },
  { label: "分類", targetField: "categories", disabled: false },
  { label: "標籤", targetField: "tags", disabled: false },
  {
    label: "建議投票選項",
    targetField: "recommendedPoll",
    disabled: true,
  },
];

const cmsOutputMappingTemplates: Partial<Record<CmsOutputTargetField, string>> =
  {
    categories: "{{ ai.categories }}",
    tags: "{{ ai.tags }}",
  };

const modeOptions: Array<{
  value: CmsOutputNodeData["mode"];
  label: string;
}> = [
  { value: "overwrite", label: "Overwrite（覆寫）" },
  { value: "append", label: "Append（附加）" },
];

const postStatusOptions: Array<{
  value: NonNullable<CmsOutputNodeData["postStatus"]>;
  label: string;
}> = [
  { value: "draft", label: "Draft（草稿）" },
  { value: "published", label: "Published（發布）" },
];

const isTargetFieldSelected = (
  mappings: CmsOutputNodeData["mappings"],
  targetField: CmsOutputTargetField,
) => mappings.some((mapping) => mapping.targetField === targetField);

const toggleCmsOutputFieldMapping = (
  mappings: CmsOutputNodeData["mappings"],
  targetField: CmsOutputTargetField,
  checked: boolean,
): CmsOutputNodeData["mappings"] => {
  const sourceField = cmsOutputMappingTemplates[targetField];

  if (!sourceField) {
    return mappings;
  }

  if (!checked) {
    return mappings.filter((mapping) => mapping.targetField !== targetField);
  }

  const existingMapping = mappings.find(
    (mapping) => mapping.targetField === targetField,
  );

  if (existingMapping) {
    return mappings;
  }

  return [
    ...mappings,
    {
      id: generateId(),
      sourceField,
      targetField,
    },
  ];
};

const FieldToggle = ({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onToggle}
    className="flex items-center gap-3 text-sm text-module-title disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded border text-white transition",
        checked
          ? "border-[#00967d] bg-[#00967d]"
          : "border-[#d4d3cc] bg-white text-transparent",
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
    <span className={fieldToggleLabelClass}>{label}</span>
  </button>
);

const RadioOption = ({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full items-center gap-2 text-sm text-module-title"
  >
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded-full border transition",
        checked ? "border-[#00967d]" : "border-[#d4d3cc]",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full bg-[#00967d] transition",
          checked ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
    <span className={fieldToggleLabelClass}>{label}</span>
  </button>
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

  const handleFieldToggle = (targetField: CmsOutputTargetField) => {
    handleDataChange({
      mappings: toggleCmsOutputFieldMapping(
        data.mappings,
        targetField,
        !isTargetFieldSelected(data.mappings, targetField),
      ),
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            輸出文字到 CMS 設定
          </p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>輸入CMS名稱</p>
          <Input
            value={data.cmsName ?? "Readr CMS"}
            disabled
            readOnly
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>輸入 CMS List</p>
          <select
            value={data.cmsList ?? "Posts"}
            onChange={() => undefined}
            disabled
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0"
          >
            <option value="Posts">Posts</option>
          </select>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>回寫欄位</p>
          <div className="space-y-2">
            {cmsOutputFieldOptions.map((field) => (
              <FieldToggle
                key={field.targetField}
                label={field.label}
                checked={isTargetFieldSelected(
                  data.mappings,
                  field.targetField,
                )}
                disabled={field.disabled}
                onToggle={() => handleFieldToggle(field.targetField)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>回寫模式</p>
          <div className="space-y-2">
            {modeOptions.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                checked={option.value === data.mode}
                onSelect={() => handleDataChange({ mode: option.value })}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>CMS 狀態</p>
          <div className="space-y-2">
            {postStatusOptions.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                checked={option.value === (data.postStatus ?? "draft")}
                onSelect={() => handleDataChange({ postStatus: option.value })}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export {
  cmsOutputFieldOptions,
  isTargetFieldSelected,
  toggleCmsOutputFieldMapping,
};
export default CmsOutputNodeSetting;
