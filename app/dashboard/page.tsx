import { getWorkflowTemplates } from "@/lib/workflow-templates";
import { getUserWorkflows } from "@/lib/workflows";
import CreateWorkflowDialog from "./_components/create-workflow-dialog";
import TemplateWorkflowCard from "./_components/template-workflow-card";
import UserWorkflowCard from "./_components/user-workflow-card";

export const runtime = "nodejs";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatDate = (value: Date) => dateFormatter.format(value);

export default async function Page() {
  const [userWorkflows, templateWorkflows] = await Promise.all([
    getUserWorkflows(),
    getWorkflowTemplates(),
  ]);

  const userCards = userWorkflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.updatedAt
      ? `編輯於 ${formatDate(workflow.updatedAt)}`
      : "尚無編輯紀錄",
    time: workflow.lastRunAt
      ? `執行於 ${formatDate(workflow.lastRunAt)}`
      : "尚無執行紀錄",
    status: workflow.status,
  }));

  const templateCards = templateWorkflows.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    status: template.status,
    nodes: template.nodes,
    edges: template.edges,
  }));

  return (
    <main className="px-15 py-10 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="title-4 text-gray-900">我的工作流</h2>
        <CreateWorkflowDialog templates={templateCards} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {userCards.length === 0 ? (
          <p className="body-2 col-span-full text-gray-500">尚無工作流</p>
        ) : (
          userCards.map((card) => (
            <UserWorkflowCard
              key={card.id}
              id={card.id}
              name={card.name}
              description={card.description}
              time={card.time}
              status={card.status}
            />
          ))
        )}
      </div>

      <h2 className="title-4 text-gray-900 mt-10">工作流模板</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templateCards.length === 0 ? (
          <p className="body-2 text-gray-500">尚無模板</p>
        ) : (
          templateCards.map((card) => (
            <TemplateWorkflowCard
              key={card.id}
              name={card.name}
              description={card.description}
              status={card.status}
            />
          ))
        )}
      </div>
    </main>
  );
}
