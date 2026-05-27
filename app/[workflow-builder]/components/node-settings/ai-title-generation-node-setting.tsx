"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type {
  AiTitleGenerationNodeData,
  AiTitleStyle,
} from "@/components/flow/nodes/ai-title-generation-node";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import {
  AI_TITLE_GENERATION_FIELDS,
  validateTitleKeywordsInput,
} from "@/lib/workflow-node-validation";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperTextClass = "text-xs text-module-muted";

const titleStyleOptions: Array<{
  value: AiTitleStyle;
  label: string;
  description: string;
}> = [
  {
    value: "seo",
    label: "SEO 搜尋優化型",
    description: "精準包含關鍵字",
  },
  {
    value: "social",
    label: "社群吸睛型",
    description: "具備懸念或情緒",
  },
  {
    value: "professional",
    label: "專業報導型",
    description: "中立客觀",
  },
];

type AiTitleGenerationNodeSettingProps = {
  nodeId: string;
  data: AiTitleGenerationNodeData;
};

const AiTitleGenerationNodeSetting = ({
  nodeId,
  data,
}: AiTitleGenerationNodeSettingProps) => {
  const updateAiTitleGenerationNodeData = useNodesStore(
    (state) => state.updateAiTitleGenerationNodeData,
  );
  const setNodeFieldError = useNodesStore((state) => state.setNodeFieldError);
  const clearNodeFieldErrors = useNodesStore(
    (state) => state.clearNodeFieldErrors,
  );

  const [keywordsInput, setKeywordsInput] = useState(data.titleKeywords);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      clearNodeFieldErrors(nodeId);
    };
  }, [clearNodeFieldErrors, nodeId]);

  useEffect(() => {
    setKeywordsInput(data.titleKeywords);
    const errorMessage = validateTitleKeywordsInput(data.titleKeywords);
    setKeywordsError(errorMessage);
    setNodeFieldError(
      nodeId,
      AI_TITLE_GENERATION_FIELDS.titleKeywords,
      errorMessage,
    );
  }, [data.titleKeywords, nodeId, setNodeFieldError]);

  const selectedStyleOption = titleStyleOptions.find(
    (opt) => opt.value === data.titleStyle,
  );

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={fieldLabelClass}>標題風格選擇</p>
          <Select
            value={data.titleStyle}
            onValueChange={(value: string) => {
              updateAiTitleGenerationNodeData(nodeId, {
                titleStyle: value as AiTitleStyle,
              });
            }}
          >
            <SelectTrigger
              size="lg"
              className="h-50 w-full rounded-lg border-module-border bg-white text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-red-400 focus-visible:ring-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {titleStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-medium leading-6 text-module-heading tracking-tight">
                      {option.label}
                    </span>
                    <span className="text-xs text-module-muted">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={fieldLabelClass}>創意溫度控制</p>
            <span className="text-sm tabular-nums text-module-title">
              {data.titleTemperature.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={helperTextClass}>穩定/準確</span>
            <span className={helperTextClass}>創意/大膽</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[data.titleTemperature ?? 0]}
            onValueChange={([value]) => {
              updateAiTitleGenerationNodeData(nodeId, {
                titleTemperature: Math.round((value ?? 0) * 10) / 10,
              });
            }}
            className="w-full"
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>SEO 強制關鍵字</p>
          <Input
            className={`h-9 rounded-[10px] bg-white text-sm text-module-title ${keywordsError ? "border-red-400" : "border-module-border"}`}
            placeholder="請輸入關鍵字"
            value={keywordsInput}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const nextInput = event.currentTarget.value;
              setKeywordsInput(nextInput);

              const errorMessage = validateTitleKeywordsInput(nextInput);
              setKeywordsError(errorMessage);
              setNodeFieldError(
                nodeId,
                AI_TITLE_GENERATION_FIELDS.titleKeywords,
                errorMessage,
              );

              if (errorMessage !== null) {
                return;
              }

              updateAiTitleGenerationNodeData(nodeId, {
                titleKeywords: nextInput,
              });
            }}
          />
          {keywordsError ? (
            <p className="text-xs text-red-400">{keywordsError}</p>
          ) : null}
          <p className={helperTextClass}>
            請輸入 1-3 個必須出現的關鍵字，以,區隔
          </p>
        </section>
      </div>
    </div>
  );
};

export default AiTitleGenerationNodeSetting;
