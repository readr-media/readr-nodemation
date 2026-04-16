"use client";

import { Separator } from "@radix-ui/react-separator";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const modelOptions = ["gemini-1.5-flash", "gemini-1.5-pro"];
const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

function parsePositiveIntegerInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

const SelectField = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-red-400 focus-visible:ring-0"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

type AiClassifierTaggerNodeSettingProps = {
  nodeId: string;
  data: AiClassifierTaggerNodeData;
};

const AiClassifierTaggerNodeSetting = ({
  nodeId,
  data,
}: AiClassifierTaggerNodeSettingProps) => {
  const updateAiClassifierTaggerNodeData = useNodesStore(
    (state) => state.updateAiClassifierTaggerNodeData,
  );

  const updateInputFields = (
    field: keyof AiClassifierTaggerNodeData["inputFields"],
    value: string,
  ) => {
    updateAiClassifierTaggerNodeData(nodeId, {
      inputFields: {
        ...data.inputFields,
        [field]: value,
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            AI自動分類與標籤設定
          </p>
          <Separator className="bg-module-border" />
        </div>

        <section className="space-y-2">
          <p className={fieldLabelClass}>模型版本</p>
          <SelectField
            value={data.model}
            onChange={(value) =>
              updateAiClassifierTaggerNodeData(nodeId, { model: value })
            }
            options={modelOptions}
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>標題欄位 mapping</p>
          <Input
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            value={data.inputFields.title}
            onInput={(event) => updateInputFields("title", event.target.value)}
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>內文欄位 mapping</p>
          <Input
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            value={data.inputFields.content}
            onInput={(event) =>
              updateInputFields("content", event.target.value)
            }
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>Prompt 模板</p>
          <Textarea
            className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
            value={data.promptTemplate ?? ""}
            onInput={(event) =>
              updateAiClassifierTaggerNodeData(nodeId, {
                promptTemplate: event.target.value,
              })
            }
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>產生分類數量</p>
          <Input
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            type="number"
            min={0}
            value={String(data.categoryAmount)}
            onInput={(event) => {
              const nextValue = parsePositiveIntegerInput(event.target.value);
              if (nextValue === null) {
                return;
              }

              updateAiClassifierTaggerNodeData(nodeId, {
                categoryAmount: nextValue,
              });
            }}
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>產生標籤數量</p>
          <Input
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            type="number"
            min={0}
            value={String(data.tagAmount)}
            onInput={(event) => {
              const nextValue = parsePositiveIntegerInput(event.target.value);
              if (nextValue === null) {
                return;
              }

              updateAiClassifierTaggerNodeData(nodeId, {
                tagAmount: nextValue,
              });
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default AiClassifierTaggerNodeSetting;
