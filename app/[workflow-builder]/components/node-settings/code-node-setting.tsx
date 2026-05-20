"use client";

import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import { Textarea } from "@/components/ui/textarea";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const languages = ["JavaScript", "TypeScript", "Python"];
const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperClass = "text-xs text-module-muted";

const CodeNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: CodeNodeData;
}) => {
  const updateCodeNodeData = useNodesStore((state) => state.updateCodeNodeData);

  const handleLanguageChange = (value: string) =>
    updateCodeNodeData(nodeId, { language: value });
  const handleCodeChange = (value: string) =>
    updateCodeNodeData(nodeId, { code: value });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={labelClass}>程式語言</p>
          <select
            value={data.language}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-purple-500 focus-visible:ring-0"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <p className={helperClass}>選擇要執行的程式語言</p>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>程式碼</p>
          <Textarea
            className="min-h-[200px] rounded-[10px] border-module-border bg-white font-mono text-sm leading-6 text-module-title"
            value={data.code}
            onChange={(event) => handleCodeChange(event.target.value)}
          />
          <p className={helperClass}>輸入程式碼來處理資料</p>
        </section>
      </div>
    </div>
  );
};

export default CodeNodeSetting;
