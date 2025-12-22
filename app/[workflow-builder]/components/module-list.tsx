"use client";
import type { LucideIcon } from "lucide-react";
import {
  FileSpreadsheet,
  Share2,
  Sparkles,
  Database,
  Code2,
  Download,
} from "lucide-react";
import { ModuleCard } from "./module-card";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

type ModuleItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "ai" | "code" | "cms" | "content";
  nodeType?: "aiCall" | "codeBlock" | "cmsInput";
};

const moduleGroups: Array<{ title: string; modules: ModuleItem[] }> = [
  {
    title: "AI 模組",
    modules: [
      {
        title: "呼叫 AI",
        description: "透過 AI 進行內容處理",
        icon: Sparkles,
        accent: "ai",
        nodeType: "aiCall",
      },
    ],
  },
  {
    title: "程式碼模組",
    modules: [
      {
        title: "撰寫程式碼",
        description: "輸入程式碼來處理資料",
        icon: Code2,
        accent: "code",
        nodeType: "codeBlock",
      },
    ],
  },
  {
    title: "CMS 模組",
    modules: [
      {
        title: "從 CMS 輸入",
        description: "從 CMS 系統抓取內容",
        icon: Database,
        accent: "cms",
        nodeType: "cmsInput",
      },
      {
        title: "輸出到 CMS",
        description: "將內容輸出到 CMS 系統",
        icon: Share2,
        accent: "cms",
      },
    ],
  },
  {
    title: "內容整理模組",
    modules: [
      {
        title: "匯出結果",
        description: "將處理結果匯出為檔案",
        icon: Download,
        accent: "content",
      },
      {
        title: "產出報告紀錄",
        description: "產出處理報告",
        icon: FileSpreadsheet,
        accent: "content",
      },
    ],
  },
] as const;

const ModuleList = () => {
  const { addAiNode, addCodeNode, addCmsNode } = useNodesStore();

  return (
    <div className="flex flex-col gap-6 px-4 pb-4 pt-4">
      {moduleGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <p className="text-sm font-normal leading-5 tracking-[-0.01em] text-module-muted">
            {group.title}
          </p>
          <div className="flex flex-col gap-2">
            {group.modules.map(({ nodeType, ...cardProps }) => (
              <ModuleCard
                key={cardProps.title}
                {...cardProps}
                onClick={() => {
                  if (nodeType === "aiCall") {
                    addAiNode();
                  }
                  if (nodeType === "codeBlock") {
                    addCodeNode();
                  }
                  if (nodeType === "cmsInput") {
                    addCmsNode();
                  }
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleList;
