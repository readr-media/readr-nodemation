"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_CLASSIFIER_TAGGER_FIELDS,
  parsePositiveIntegerInput,
  validateCategoryAmountInput,
  validateTagAmountInput,
} from "@/lib/workflow-node-validation";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

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
  const setNodeFieldError = useNodesStore((state) => state.setNodeFieldError);
  const clearNodeFieldErrors = useNodesStore(
    (state) => state.clearNodeFieldErrors,
  );
  const [categoryAmountInput, setCategoryAmountInput] = useState(
    String(data.categoryAmount),
  );
  const [categoryAmountError, setCategoryAmountError] = useState<string | null>(
    null,
  );
  const [tagAmountInput, setTagAmountInput] = useState(String(data.tagAmount));
  const [tagAmountError, setTagAmountError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      clearNodeFieldErrors(nodeId);
    };
  }, [clearNodeFieldErrors, nodeId]);

  useEffect(() => {
    const nextInput = String(data.categoryAmount);
    setCategoryAmountInput(nextInput);

    const errorMessage = validateCategoryAmountInput(nextInput);
    setCategoryAmountError(errorMessage);
    setNodeFieldError(
      nodeId,
      AI_CLASSIFIER_TAGGER_FIELDS.categoryAmount,
      errorMessage,
    );
  }, [data.categoryAmount, nodeId, setNodeFieldError]);

  useEffect(() => {
    const nextInput = String(data.tagAmount);
    setTagAmountInput(nextInput);

    const errorMessage = validateTagAmountInput(nextInput);
    setTagAmountError(errorMessage);
    setNodeFieldError(
      nodeId,
      AI_CLASSIFIER_TAGGER_FIELDS.tagAmount,
      errorMessage,
    );
  }, [data.tagAmount, nodeId, setNodeFieldError]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={fieldLabelClass}> 進階指令（User Prompt）</p>
          <Textarea
            placeholder={
              "[可在此輸入進階指令 （選填）]\n例如：請優先提取關鍵人名（不含職稱）、或添加特定專案標籤⋯⋯。"
            }
            className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
            value={data.promptTemplate ?? ""}
            onInput={(event: FormEvent<HTMLTextAreaElement>) =>
              updateAiClassifierTaggerNodeData(nodeId, {
                promptTemplate: event.currentTarget.value,
              })
            }
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>產生分類數量（請輸入 1-3）</p>
          <Input
            className={`h-9 rounded-[10px] bg-white text-sm text-module-title ${categoryAmountError ? "border-red-400" : "border-module-border"}`}
            type="number"
            min={1}
            max={3}
            value={categoryAmountInput}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const nextInput = event.currentTarget.value;
              setCategoryAmountInput(nextInput);

              const errorMessage = validateCategoryAmountInput(nextInput);
              setCategoryAmountError(errorMessage);
              setNodeFieldError(
                nodeId,
                AI_CLASSIFIER_TAGGER_FIELDS.categoryAmount,
                errorMessage,
              );

              if (errorMessage !== null) {
                return;
              }

              const nextValue = parsePositiveIntegerInput(nextInput);
              if (nextValue === null) {
                return;
              }

              updateAiClassifierTaggerNodeData(nodeId, {
                categoryAmount: nextValue,
              });
            }}
          />
          {categoryAmountError ? (
            <p className="text-xs text-red-400">{categoryAmountError}</p>
          ) : null}
          <p className="text-xs text-module-muted">一次產出 1 組</p>
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>產生標籤數量（請輸入 1-10）</p>
          <Input
            className={`h-9 rounded-[10px] bg-white text-sm text-module-title ${tagAmountError ? "border-red-400" : "border-module-border"}`}
            type="number"
            min={1}
            max={10}
            value={tagAmountInput}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const nextInput = event.currentTarget.value;
              setTagAmountInput(nextInput);

              const errorMessage = validateTagAmountInput(nextInput);
              setTagAmountError(errorMessage);
              setNodeFieldError(
                nodeId,
                AI_CLASSIFIER_TAGGER_FIELDS.tagAmount,
                errorMessage,
              );

              if (errorMessage !== null) {
                return;
              }

              const nextValue = parsePositiveIntegerInput(nextInput);
              if (nextValue === null) {
                return;
              }

              updateAiClassifierTaggerNodeData(nodeId, {
                tagAmount: nextValue,
              });
            }}
          />
          {tagAmountError ? (
            <p className="text-xs text-red-400">{tagAmountError}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default AiClassifierTaggerNodeSetting;
