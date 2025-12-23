import { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { Separator } from "@radix-ui/react-separator";
import { Check, ChevronDown, Play } from "lucide-react";

const modelOptions = ["gemini-1.5-flash", "gemini-1.5-pro"];
const outputOptions = ["JSON", "Text"];
const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

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

const SourceOption = ({
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
    className="flex items-center gap-2 text-sm text-module-title"
  >
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded border text-white transition",
        checked
          ? "border-green-500 bg-green-500"
          : "border-[#d4d3cc] bg-white text-transparent",
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
    {label}
  </button>
);
const helperTextClass = "text-xs text-module-muted";

const AiNodeSettings = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: AiCallNodeData;
}) => {
  const updateNodeData = useNodesStore((state) => state.updateNodeData);

  const handleModelChange = (value: string) =>
    updateNodeData(nodeId, { model: value });

  const handleOutputChange = (value: string) =>
    updateNodeData(nodeId, { outputFormat: value });

  const handleInputToggle = (field: keyof AiCallNodeData["inputs"]) => {
    updateNodeData(nodeId, {
      inputs: { ...data.inputs, [field]: !data.inputs[field] },
    });
  };

  const handlePromptChange = (value: string) =>
    updateNodeData(nodeId, { promptTemplate: value });

  const handleCmsFieldChange = (value: string) =>
    updateNodeData(nodeId, { cmsField: value });

  const handleTestInputChange = (value: string) =>
    updateNodeData(nodeId, { testInput: value });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">呼叫 AI 設定</p>
          <Separator className="bg-module-border" />
        </div>

        <section className="space-y-2">
          <p className={fieldLabelClass}>模型版本</p>
          <SelectField
            value={data.model}
            onChange={handleModelChange}
            options={modelOptions}
          />
        </section>

        <section className="space-y-3">
          <div className="space-y-2">
            <p className={fieldLabelClass}>輸入來源</p>
            <div className="space-y-2">
              <SourceOption
                label="標題"
                checked={data.inputs.title}
                onToggle={() => handleInputToggle("title")}
              />
              <SourceOption
                label="內文"
                checked={data.inputs.content}
                onToggle={() => handleInputToggle("content")}
              />
              <SourceOption
                label="摘要"
                checked={data.inputs.summary}
                onToggle={() => handleInputToggle("summary")}
              />
            </div>
          </div>
          <p className={helperTextClass}>選擇此任務的輸入欄位</p>
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>輸出格式</p>
          <SelectField
            value={data.outputFormat}
            onChange={handleOutputChange}
            options={outputOptions}
          />
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>Prompt 模板</p>
          <Textarea
            className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
            defaultValue={data.promptTemplate}
            onChange={(event) => handlePromptChange(event.target.value)}
          />
          <p className={helperTextClass}>
            {"支援變數：${title}, ${content}, ${summary}"}
          </p>
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>CMS 回寫欄位</p>
          <Input
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            value={data.cmsField}
            onChange={(event) => handleCmsFieldChange(event.target.value)}
          />
          <p className={helperTextClass}>指定要回寫到 CMS 的欄位名稱</p>
        </section>

        <Separator className="bg-module-border" />

        <section className="space-y-2">
          <p className={fieldLabelClass}>測試輸入</p>
          <Textarea
            className="min-h-[120px] rounded-[10px] border-module-border bg-white text-sm text-module-title"
            placeholder="貼上測試文字..."
            value={data.testInput}
            onChange={(event) => handleTestInputChange(event.target.value)}
          />
          <p className={helperTextClass}>在此輸入測試資料</p>
        </section>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border-module-border bg-[#f5f5f1] text-sm text-module-muted"
      >
        <Play className="size-4" strokeWidth={1.75} />
        測試執行
      </Button>
    </div>
  );
};
export default AiNodeSettings;
