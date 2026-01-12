import type { LucideIcon } from "lucide-react";
import ModuleUnit from "./module-unit";
import {
  Code2,
  Database,
  Download,
  FileSpreadsheet,
  Share2,
  Sparkles,
  CircleCheck,
} from "lucide-react";

const moduleTypes = [
  {
    name: "AI 模組",
    units: [
      {
        id: 1,
        action: "呼叫 AI",
        actionIcon: Sparkles,
        actionCode: "ai",
        description: "透過 AI 進行內容處理",
        status: "active",
      },
    ],
  },
  {
    name: "程式碼模組",
    units: [
      {
        id: 1,
        action: "撰寫程式碼",
        actionIcon: Code2,
        actionCode: "code",
        description: "輸入程式碼來處理資料",
        status: "inactive",
      },
    ],
  },
  {
    name: "CMS 模組",
    units: [
      {
        id: 1,
        action: "從 CMS 輸入",
        actionIcon: Database,
        actionCode: "cms",
        description: "從 CMS 系統抓取內容",
        status: "active",
      },
      {
        id: 2,
        action: "輸出到 CMS",
        actionIcon: Share2,
        actionCode: "cms",
        description: "將內容輸出到 CMS 系統",
        status: "active",
      },
    ],
  },
  {
    name: "內容整理模組",
    units: [
      {
        id: 1,
        action: "匯出結果",
        actionIcon: Download,
        actionCode: "content",
        description: "將處理結果匯出為檔案",
        status: "active",
      },
      {
        id: 2,
        action: "產出報告紀錄",
        actionIcon: FileSpreadsheet,
        actionCode: "content",
        description: "產出處理報告",
        status: "active",
      },
    ],
  },
];

export default function ModuleSection() {
  return (
    <section className="flex flex-col gap-y-10">
      {moduleTypes.map((type) => (
        <div key={type.name}>
          <h3 className="title-4 text-gray-900 pb-4">{type.name}</h3>
          <div className="grid grid-cols-3 gap-x-5 gap-y-6">
            {type.units.map((unit) => (
              <ModuleUnit key={unit.id} {...unit} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
