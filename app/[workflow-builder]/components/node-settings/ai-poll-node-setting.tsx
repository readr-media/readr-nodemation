"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_POLL_FIELDS,
  parsePositiveIntegerInput,
  validatePollOptionCountInput,
} from "@/lib/workflow-node-validation";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

const USER_PROMPT_PLACEHOLDER =
  "[可在此輸入進階指令（選填）]\n例如：\n請設計根據個人經驗回答的投票\n請設計支持 / 反對立場投票\n請設計預測未來發展的投票";

type AiPollNodeSettingProps = {
  nodeId: string;
  data: AiPollNodeData;
};

const AiPollNodeSetting = ({ nodeId, data }: AiPollNodeSettingProps) => {
  const updateAiPollNodeData = useNodesStore(
    (state) => state.updateAiPollNodeData,
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

  useEffect(() => {
    return () => {
      clearNodeFieldErrors(nodeId);
    };
  }, [clearNodeFieldErrors, nodeId]);

  useEffect(() => {
    const nextInput = String(data.categoryAmount);
    setCategoryAmountInput(nextInput);

    const errorMessage = validatePollOptionCountInput(nextInput);
    setCategoryAmountError(errorMessage);
    setNodeFieldError(nodeId, AI_POLL_FIELDS.categoryAmount, errorMessage);
  }, [data.categoryAmount, nodeId, setNodeFieldError]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={fieldLabelClass}>進階指令（User Prompt）</p>
          <Textarea
            placeholder={USER_PROMPT_PLACEHOLDER}
            className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
            value={data.userPrompt ?? ""}
            onInput={(event: FormEvent<HTMLTextAreaElement>) =>
              updateAiPollNodeData(nodeId, {
                userPrompt: event.currentTarget.value,
              })
            }
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>生成投票選項數量（請輸入 2-10）</p>
          <Input
            className={`h-9 rounded-[10px] bg-white text-sm text-module-title ${categoryAmountError ? "border-red-400" : "border-module-border"}`}
            type="number"
            min={2}
            max={10}
            value={categoryAmountInput}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const nextInput = event.currentTarget.value;
              setCategoryAmountInput(nextInput);

              const errorMessage = validatePollOptionCountInput(nextInput);
              setCategoryAmountError(errorMessage);
              setNodeFieldError(
                nodeId,
                AI_POLL_FIELDS.categoryAmount,
                errorMessage,
              );

              if (errorMessage !== null) {
                return;
              }

              const nextValue = parsePositiveIntegerInput(nextInput);
              if (nextValue === null) {
                return;
              }

              updateAiPollNodeData(nodeId, {
                categoryAmount: nextValue,
              });
            }}
          />
          {categoryAmountError ? (
            <p className="text-xs text-red-400">{categoryAmountError}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default AiPollNodeSetting;
