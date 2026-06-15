import type { LucideIcon } from "lucide-react";
import { Code2, Database, Share2, Sparkles } from "lucide-react";

export type ModuleNodeType =
  | "aiCall"
  | "aiClassifierTagger"
  | "codeBlock"
  | "cmsInput"
  | "cmsOutput"
  | "podcastGeneration"
  | "cmsOutputAudio"
  | "aiTitleGeneration"
  | "aiPoll";

export type ModuleItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "ai" | "code" | "cms";
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
        description: "透過 AI 為文章分類",
        icon: Sparkles,
        accent: "ai",
        nodeType: "aiClassifierTagger",
      },
      {
        title: "AI 文章標題",
        description: "透過 AI 為文章下標",
        icon: Sparkles,
        accent: "ai",
        nodeType: "aiTitleGeneration",
      },
      {
        title: "Podcast 生成",
        description: "將報導轉為 Podcast",
        icon: Sparkles,
        accent: "ai",
        nodeType: "podcastGeneration",
      },
      {
        title: "AI 投票建議",
        description: "AI 產生文章的投票建議",
        icon: Sparkles,
        accent: "ai",
        nodeType: "aiPoll",
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
        title: "從 CMS 輸入文章",
        description: "從 CMS 系統抓取內容",
        icon: Database,
        accent: "cms",
        nodeType: "cmsInput",
      },
      {
        title: "輸出文字到 CMS",
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
] as const;
