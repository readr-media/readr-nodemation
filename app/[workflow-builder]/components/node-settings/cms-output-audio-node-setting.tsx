"use client";

import { Check } from "lucide-react";

import type { CmsAudioFieldMapping, CmsOutputAudioNodeData } from "@/components/flow/nodes/cms-output-audio-node";
import { Input } from "@/components/ui/input";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { generateId } from "@/utils/generate-id";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const selectClass =
  "h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-[#00967d] focus-visible:ring-0";

const writeBackFieldOptions = [
  {
    key: "title",
    label: "標題",
    sourceField: "{{ ai.podcastTitle }}",
    targetField: "title",
  },
  {
    key: "description",
    label: "描述",
    sourceField: "{{ ai.podcastScript }}",
    targetField: "description",
  },
  {
    key: "audioFile",
    label: "檔案",
    sourceField: "{{ ai.audioFile }}",
    targetField: "audioFile",
  },
] as const;

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
          ? "size-4 rounded border-[#00967d] bg-[#00967d]"
          : "size-4 rounded border-[#d4d3cc] bg-white text-transparent"
      }`}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
    <span className="text-base font-medium leading-none text-module-title">
      {label}
    </span>
  </button>
);

const CmsOutputAudioNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: CmsOutputAudioNodeData;
}) => {
  const updateCmsOutputAudioNodeData = useNodesStore(
    (state) => state.updateCmsOutputAudioNodeData,
  );

  const handleDataChange = (payload: Partial<CmsOutputAudioNodeData>) => {
    updateCmsOutputAudioNodeData(nodeId, payload);
  };

  const handleAudioFileIdsChange = (value: string) => {
    handleDataChange({ cmsAudioFileIds: value });
  };

  const hasTargetField = (targetField: string) =>
    data.mappings.some((mapping) => mapping.targetField === targetField);

  const handleWriteBackToggle = (
    targetField: (typeof writeBackFieldOptions)[number]["targetField"],
  ) => {
    const option = writeBackFieldOptions.find(
      (fieldOption) => fieldOption.targetField === targetField,
    );
    if (!option) return;

    if (hasTargetField(targetField)) {
      handleDataChange({
        mappings: data.mappings.filter(
          (mapping) => mapping.targetField !== targetField,
        ),
      });
      return;
    }

    const nextMapping: CmsAudioFieldMapping = {
      id: generateId(),
      sourceField: option.sourceField,
      targetField: option.targetField,
    };

    const orderedMappings = writeBackFieldOptions
      .map((fieldOption) =>
        fieldOption.targetField === targetField
          ? nextMapping
          : data.mappings.find(
              (mapping) => mapping.targetField === fieldOption.targetField,
            ),
      )
      .filter((mapping): mapping is CmsAudioFieldMapping => Boolean(mapping));

    handleDataChange({ mappings: orderedMappings });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">輸出音檔到 CMS 設定</p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>模組說明</p>
          <Input
            value={data.cmsName}
            disabled
            readOnly
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>輸入 CMS List</p>
          <select value={data.cmsList} disabled className={selectClass}>
            <option value={data.cmsList}>{data.cmsList}</option>
          </select>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>輸入音檔 ID</p>
          <Input
            value={data.cmsAudioFileIds}
            placeholder="12345"
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            onChange={(event) => handleAudioFileIdsChange(event.target.value)}
          />
        </section>

        <section className="space-y-3">
          <p className={labelClass}>CMS 回寫欄位</p>
          <div className="space-y-2">
            {writeBackFieldOptions.map((fieldOption) => (
              <FieldToggle
                key={fieldOption.key}
                label={fieldOption.label}
                checked={hasTargetField(fieldOption.targetField)}
                onToggle={() => handleWriteBackToggle(fieldOption.targetField)}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default CmsOutputAudioNodeSetting;
