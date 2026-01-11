import type { LucideIcon } from "lucide-react";
import ModuleUnit from "./module-unit";

const aiModules = [{ id: "1", name: "Module 1" }];
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
        id: "1",
        action: "呼叫 AI",
        description: "透過 AI 進行內容處理",
        icon: Sparkles,
        status: "active",
        statusIcon: CircleCheck,
      },
    ],
  },
  {
    name: "程式碼模組",
    units: [
      {
        id: "1",
        action: "撰寫程式碼",
        description: "輸入程式碼來處理資料",
        icon: Code2,
        status: "inactive",
        statusIcon: CircleCheck,
      },
    ],
  },
  {
    name: "CMS 模組",
    units: [
      {
        id: "1",
        action: "從 CMS 輸入",
        description: "從 CMS 系統抓取內容",
        icon: Database,
        status: "active",
      },
      {
        id: "2",
        action: "輸出到 CMS",
        description: "將內容輸出到 CMS 系統",
        icon: Share2,
        status: "active",
      },
      {
        id: "3",
        action: "從 CMS 輸入",
        description: "從 CMS 系統抓取內容",
        icon: Database,
        status: "active",
      },
      {
        id: "4",
        action: "輸出到 CMS",
        description: "將內容輸出到 CMS 系統",
        icon: Share2,
        status: "active",
      },
    ],
  },
  {
    name: "內容整理模組",
    units: [
      {
        id: "1",
        action: "匯出結果",
        description: "將處理結果匯出為檔案",
        icon: Download,
        status: "active",
      },
      {
        id: "2",
        action: "產出報告紀錄",
        description: "產出處理報告",
        icon: FileSpreadsheet,
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
          <div className="grid grid-cols-3 gap-x-5 gap-y-4">
            {type.units.map((unit) => (
              <ModuleUnit key={unit.id} {...unit} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
