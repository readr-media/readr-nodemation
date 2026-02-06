const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const moduleSeed = [
  {
    name: "AI 模組",
    sort_order: 1,
    units: [
      {
        action: "呼叫 AI",
        action_code: "ai",
        description: "透過 AI 進行內容處理",
        active: true,
        icon_key: "Sparkles",
        sort_order: 1,
      },
    ],
  },
  {
    name: "程式碼模組",
    sort_order: 2,
    units: [
      {
        action: "撰寫程式碼",
        action_code: "code",
        description: "輸入程式碼來處理資料",
        active: false,
        icon_key: "Code2",
        sort_order: 1,
      },
    ],
  },
  {
    name: "CMS 模組",
    sort_order: 3,
    units: [
      {
        action: "從 CMS 輸入",
        action_code: "cms",
        description: "從 CMS 系統抓取內容",
        active: true,
        icon_key: "Database",
        sort_order: 1,
      },
      {
        action: "輸出到 CMS",
        action_code: "cms",
        description: "將內容輸出到 CMS 系統",
        active: true,
        icon_key: "Share2",
        sort_order: 2,
      },
    ],
  },
  {
    name: "內容整理模組",
    sort_order: 4,
    units: [
      {
        action: "匯出結果",
        action_code: "content",
        description: "將處理結果匯出為檔案",
        active: true,
        icon_key: "Download",
        sort_order: 1,
      },
      {
        action: "產出報告紀錄",
        action_code: "content",
        description: "產出處理報告",
        active: true,
        icon_key: "FileSpreadsheet",
        sort_order: 2,
      },
    ],
  },
];

const templateSeed = [
  {
    name: "自動標籤文章",
    description: "快速為文章產生相關標籤",
    status: "template",
    sort_order: 1,
  },
  {
    name: "自動地震速報",
    description: "自動產生地震速報",
    status: "template",
    sort_order: 2,
  },
];

const workflowSeed = [
  {
    id: "sample-workflow-1",
    name: "AI 模組卡片",
    description: "剛剛編輯",
    status: "draft",
    nodes: "[]",
    edges: "[]",
    last_run_at: null,
    updated_at: new Date("2026-02-06T09:00:00Z"),
  },
  {
    id: "sample-workflow-2",
    name: "AI 新聞處理流程",
    description: "2 小時前編輯",
    status: "published",
    nodes: "[]",
    edges: "[]",
    last_run_at: new Date("2026-02-06T08:24:00Z"),
    updated_at: new Date("2026-02-06T07:00:00Z"),
  },
  {
    id: "sample-workflow-3",
    name: "文章自動分類與標記",
    description: "1 天前編輯",
    status: "running",
    nodes: "[]",
    edges: "[]",
    last_run_at: new Date("2026-02-03T09:00:00Z"),
    updated_at: new Date("2026-02-05T09:00:00Z"),
  },
];

async function main() {
  await prisma.moduleUnit.deleteMany();
  await prisma.moduleType.deleteMany();
  await prisma.workflowTemplate.deleteMany();

  for (const moduleType of moduleSeed) {
    await prisma.moduleType.create({
      data: {
        name: moduleType.name,
        sort_order: moduleType.sort_order,
        units: {
          create: moduleType.units.map((unit) => ({
            action: unit.action,
            action_code: unit.action_code,
            description: unit.description,
            active: unit.active,
            icon_key: unit.icon_key,
            sort_order: unit.sort_order,
          })),
        },
      },
    });
  }

  for (const template of templateSeed) {
    await prisma.workflowTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        status: template.status,
        sort_order: template.sort_order,
      },
    });
  }

  for (const workflow of workflowSeed) {
    await prisma.workflow.upsert({
      where: { id: workflow.id },
      update: {
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        nodes: workflow.nodes,
        edges: workflow.edges,
        last_run_at: workflow.last_run_at,
        updated_at: workflow.updated_at,
      },
      create: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        nodes: workflow.nodes,
        edges: workflow.edges,
        last_run_at: workflow.last_run_at,
        updated_at: workflow.updated_at,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
