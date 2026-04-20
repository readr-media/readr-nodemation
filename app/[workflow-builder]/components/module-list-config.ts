import type { LucideIcon } from "lucide-react";
import { Code2, Database, Download, Share2, Sparkles } from "lucide-react";

export type ModuleNodeType =
  | "aiCall"
  | "aiClassifierTagger"
  | "codeBlock"
  | "cmsInput"
  | "cmsOutput"
  | "exportResult"
  | "podcastGeneration"
  | "cmsOutputAudio";

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
      {
        title: "AI自動分類與標籤",
        description: "專用於文章分類與標籤產生",
        icon: Sparkles,
        accent: "ai",
        nodeType: "aiClassifierTagger",
      },
      {
        title: "Podcast 生成",
        description: "將報導轉為 Podcast",
        icon: Sparkles,
        accent: "ai",
        nodeType: "podcastGeneration",
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
      {
        title: "輸出音檔到 CMS",
        description: "將音檔輸出到 CMS 系統",
        icon: Share2,
        accent: "cms",
        nodeType: "cmsOutputAudio",
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
