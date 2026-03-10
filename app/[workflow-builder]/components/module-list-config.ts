import type { LucideIcon } from "lucide-react";
import { Code2, Database, Download, Share2, Sparkles } from "lucide-react";

export type ModuleNodeType =
  | "aiCall"
  | "codeBlock"
  | "cmsInput"
  | "cmsOutput"
  | "exportResult";

export type ModuleItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "ai" | "code" | "cms" | "content";
  nodeType: ModuleNodeType;
};

export const moduleGroups: Array<{ title: string; modules: ModuleItem[] }> = [
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
        nodeType: "cmsOutput",
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
        nodeType: "exportResult",
      },
    ],
  },
] as const;
