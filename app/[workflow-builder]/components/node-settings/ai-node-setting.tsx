"use client";

import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import { Textarea } from "@/components/ui/textarea";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

const readOnlyTextareaClass =
  "min-h-[280px] rounded-[10px] border-module-border bg-gray-400 text-sm leading-6 text-module-title";

const AiNodeSettings = ({
  data,
}: {
  nodeId: string;
  data: AiCallNodeData;
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={labelClass}>進階指令</p>
          <Textarea
            value={data.userPrompt}
            disabled
            readOnly
            className={readOnlyTextareaClass}
          />
        </section>
      </div>
    </div>
  );
};

export default AiNodeSettings;
