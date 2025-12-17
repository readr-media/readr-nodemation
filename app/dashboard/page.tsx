import UserWorkflowCard from "./_components/user-workflow-card";
import TemplateWorkflowCard from "./_components/template-workflow-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const userCards = [
  {
    id: 1,
    name: "AI 模組卡片",
    description: "剛剛編輯",
    time: "尚無執行紀錄",
    status: "draft",
  },
  {
    id: 2,
    name: "AI 新聞處理流程",
    description: "2 小時前編輯",
    time: "執行於 36 分鐘前",
    status: "published",
  },
  {
    id: 3,
    name: "文章自動分類與標記",
    time: "執行於 3 天前",
    description: "1 天前編輯",
    status: "running",
  },
];

const templateCards = [
  {
    id: 1,
    name: "自動標籤文章",
    description: "快速為文章產生相關標籤",
    status: "template",
  },
  {
    id: 2,
    name: "自動地震速報",
    description: "自動產生地震速報",
    status: "template",
  },
];

export default function Page() {
  return (
    <main className="px-15 py-10 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="title-4 text-gray-900">我的工作流</h2>
        {/* TODO: 確認刪除 modal */}
        <Button className="bg-green-500 text-white">
          <PlusIcon className="bg-green-500 text-white" />
          建立新工作流
        </Button>
      </div>
      <div className="flex gap-x-6 mt-4">
        {userCards.map((card) => (
          <UserWorkflowCard
            key={card.id}
            name={card.name}
            description={card.description}
            time={card.time}
            status={card.status as "draft" | "published" | "running"}
          />
        ))}
      </div>

      <h2 className="title-4 text-gray-900 mt-10">工作流模板</h2>
      <div className="flex gap-x-6 mt-4">
        {templateCards.map((card) => (
          <TemplateWorkflowCard
            key={card.id}
            name={card.name}
            description={card.description}
            status={card.status as "draft" | "published" | "running"}
          />
        ))}
      </div>
    </main>
  );
}
