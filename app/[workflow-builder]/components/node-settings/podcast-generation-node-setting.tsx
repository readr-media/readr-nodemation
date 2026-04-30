import { Separator } from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import type { PodcastGenerationNodeData } from "@/stores/flow-editor/slices/podcast-generation-node-slice";
import { Textarea } from "@/components/ui/textarea";

const modelOptions = ["gemini-1.5-flash", "gemini-1.5-pro"];
const fieldLabelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperTextClass = "text-xs text-module-muted";

const styleOptions: Array<{
  value: PodcastGenerationNodeData["podcastMode"];
  label: string;
}> = [
  { value: "deepDive", label: "深入探索" },
  { value: "summary", label: "摘要" },
  { value: "commentary", label: "評論" },
  { value: "debate", label: "辯論" },
];

const lengthOptions: Array<{
  value: PodcastGenerationNodeData["podcastLength"];
  label: string;
}> = [
  { value: "short", label: "短" },
  { value: "medium", label: "適中" },
  { value: "long", label: "長" },
];

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

const RadioField = ({
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
    className="flex items-center gap-2 text-sm text-module-title"
  >
    <span
      className={cn(
        "flex size-4 items-center justify-center rounded-full border transition",
        checked ? "border-green-500 bg-white" : "border-[#d4d3cc] bg-white",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full transition",
          checked ? "bg-green-500" : "bg-transparent",
        )}
      />
    </span>
    {label}
  </button>
);

const PodcastGenerationNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: PodcastGenerationNodeData;
}) => {
  const updatePodcastGenerationNodeData = useNodesStore(
    (state) => state.updatePodcastGenerationNodeData,
  );

  const handleModelChange = (value: string) =>
    updatePodcastGenerationNodeData(nodeId, { model: value });

  const handlePromptChange = (value: string) =>
    updatePodcastGenerationNodeData(nodeId, { promptTemplate: value });

  const handleStyleChange = (value: PodcastGenerationNodeData["podcastMode"]) =>
    updatePodcastGenerationNodeData(nodeId, { podcastMode: value });

  const handleLengthChange = (
    value: PodcastGenerationNodeData["podcastLength"],
  ) => updatePodcastGenerationNodeData(nodeId, { podcastLength: value });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            Podcast 生成 設定
          </p>
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

        <section className="space-y-2">
          <p className={fieldLabelClass}>Prompt 模板</p>
          <Textarea
            className="min-h-[140px] rounded-[10px] border-module-border bg-white text-sm leading-6 text-module-title"
            value={data.promptTemplate}
            onChange={(event) => handlePromptChange(event.target.value)}
          />
          <p className={helperTextClass}>
            {`支援變數：\${title}, \${content}, \${summary}`}
          </p>
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>格式</p>
          <div className="space-y-2">
            {styleOptions.map((option) => (
              <RadioField
                key={option.value}
                label={option.label}
                checked={data.podcastMode === option.value}
                onSelect={() => handleStyleChange(option.value)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <p className={fieldLabelClass}>長度</p>
          <div className="space-y-2">
            {lengthOptions.map((option) => (
              <RadioField
                key={option.value}
                label={option.label}
                checked={data.podcastLength === option.value}
                onSelect={() => handleLengthChange(option.value)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PodcastGenerationNodeSetting;
