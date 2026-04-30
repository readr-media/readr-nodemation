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
      {
        action: "Podcast 生成",
        action_code: "podcast_generation",
        description: "將報導轉為 Podcast",
        active: true,
        icon_key: "Sparkles",
        sort_order: 4,
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
    ],
  },
];

const templateSeed = [
  {
    name: "AI 自動分類",
    description: "使用 AI 自動分類文章",
    status: "template",
    sort_order: 1,
  },
  {
    name: "AI 文章標題",
    description: "使用 AI 產生文章標題",
    status: "template",
    sort_order: 2,
  },
  {
    name: "自動地震文",
    description: "使用 AI 產生地震文",
    status: "template",
    sort_order: 3,
  },
  {
    name: "Podcast 生成",
    description: "使用 AI 產生 Podcast",
    status: "template",
    sort_order: 4,
  },
  {
    name: "AI 投票建議",
    description: "使用 AI 產生投票建議",
    status: "template",
    sort_order: 5,
  },
];

const demoArticleClassificationNodes = JSON.stringify([
  {
    id: "cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "demo-cms-config",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
  {
    id: "aiClassifierTagger-node",
    type: "aiClassifierTagger",
    position: { x: 360, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI自動分類與標籤",
      model: "gemini-1.5-flash",
      inputFields: {
        title: "source.title",
        content: "source.content",
      },
      promptTemplate:
        '你是一個新聞編輯助理，請根據文章內容產出分類與標籤。\n\n請嚴格依照以下 JSON 格式輸出，且不要加入任何說明文字：\n\n{\n  "categories": ["string"],\n  "tags": ["string"]\n}\n\n文章標題：{{title}}\n文章內文：{{content}}\n\n請產出 {{categoryAmount}} 個分類與 {{tagAmount}} 個標籤。',
      categoryAmount: 1,
      tagAmount: 3,
      responseFormat: {
        type: "json",
        schema: {
          categories: "array[string]",
          tags: "array[string]",
        },
      },
      outputFields: {
        categories: "array[string]",
        tags: "array[string]",
      },
    },
  },
  {
    id: "cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "ai-categories-to-categories",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "ai-tags-to-tags",
          sourceField: "{{ ai.tags }}",
          targetField: "tags",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoArticleClassificationEdges = JSON.stringify([
  {
    id: "cmsInput-node->aiClassifierTagger-node",
    source: "cmsInput-node",
    target: "aiClassifierTagger-node",
  },
  {
    id: "aiClassifierTagger-node->cmsOutput-node",
    source: "aiClassifierTagger-node",
    target: "cmsOutput-node",
  },
]);

const demoTitleGenerationNodes = JSON.stringify([
  {
    id: "title-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
  {
    id: "title-aiCall-node",
    type: "aiCall",
    position: { x: 360, y: 160 },
    data: {
      title: "AI 文章標題",
      model: "gemini-1.5-flash",
      inputs: {
        title: true,
        content: true,
        summary: false,
      },
      outputFormat: "JSON",
      promptTemplate:
        "請閱讀新聞內容並產生 3 個可用於發布的中文新聞標題，請回傳 JSON。",
      cmsField: "title",
      testInput: "",
    },
  },
  {
    id: "title-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "title-ai-to-cms",
          sourceField: "{{ ai.output }}",
          targetField: "title",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoTitleGenerationEdges = JSON.stringify([
  {
    id: "title-cmsInput-node->title-aiCall-node",
    source: "title-cmsInput-node",
    target: "title-aiCall-node",
  },
  {
    id: "title-aiCall-node->title-cmsOutput-node",
    source: "title-aiCall-node",
    target: "title-cmsOutput-node",
  },
]);

const demoEarthquakeNodes = JSON.stringify([
  {
    id: "earthquake-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
  {
    id: "earthquake-aiCall-node",
    type: "aiCall",
    position: { x: 360, y: 160 },
    data: {
      title: "自動地震文",
      model: "gemini-1.5-flash",
      inputs: {
        title: true,
        content: true,
        summary: true,
      },
      outputFormat: "JSON",
      promptTemplate:
        "請依地震資訊撰寫速報稿，內容需包含地點、規模、時間與提醒事項。",
      cmsField: "content",
      testInput: "",
    },
  },
  {
    id: "earthquake-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "earthquake-ai-to-content",
          sourceField: "{{ ai.output }}",
          targetField: "content",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoEarthquakeEdges = JSON.stringify([
  {
    id: "earthquake-cmsInput-node->earthquake-aiCall-node",
    source: "earthquake-cmsInput-node",
    target: "earthquake-aiCall-node",
  },
  {
    id: "earthquake-aiCall-node->earthquake-cmsOutput-node",
    source: "earthquake-aiCall-node",
    target: "earthquake-cmsOutput-node",
  },
]);

const demoPodcastNodes = JSON.stringify([
  {
    id: "podcast-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
  {
    id: "podcast-generation-node",
    type: "podcastGeneration",
    position: { x: 360, y: 160 },
    data: {
      title: "Podcast 生成",
      model: "gemini-1.5-flash",
      promptTemplate: "請將內容轉換成可朗讀的 Podcast 腳本",
      podcastMode: "deepDive",
      podcastLength: "medium",
    },
  },
  {
    id: "podcast-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "podcast-script-to-content",
          sourceField: "{{ podcast.script }}",
          targetField: "content",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoPodcastEdges = JSON.stringify([
  {
    id: "podcast-cmsInput-node->podcast-generation-node",
    source: "podcast-cmsInput-node",
    target: "podcast-generation-node",
  },
  {
    id: "podcast-generation-node->podcast-cmsOutput-node",
    source: "podcast-generation-node",
    target: "podcast-cmsOutput-node",
  },
]);

const demoVotingNodes = JSON.stringify([
  {
    id: "voting-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從CMS輸入",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      sourceFields: {
        title: true,
        category: false,
        content: true,
        tags: false,
      },
      outputFields: {
        title: "string",
        categories: "array[string]",
        content: "string",
        tags: "array[string]",
      },
      outputFormat: "json",
    },
  },
  {
    id: "voting-aiCall-node",
    type: "aiCall",
    position: { x: 360, y: 160 },
    data: {
      title: "AI 投票建議",
      model: "gemini-1.5-flash",
      inputs: {
        title: true,
        content: true,
        summary: true,
      },
      outputFormat: "JSON",
      promptTemplate:
        "請依新聞內容提出 3 個可投票選項，並附上各選項一行理由，使用 JSON 回傳。",
      cmsField: "content",
      testInput: "",
    },
  },
  {
    id: "voting-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "voting-ai-to-content",
          sourceField: "{{ ai.output }}",
          targetField: "content",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoVotingEdges = JSON.stringify([
  {
    id: "voting-cmsInput-node->voting-aiCall-node",
    source: "voting-cmsInput-node",
    target: "voting-aiCall-node",
  },
  {
    id: "voting-aiCall-node->voting-cmsOutput-node",
    source: "voting-aiCall-node",
    target: "voting-cmsOutput-node",
  },
]);

const templateGraphSeedByName = {
  "AI 自動分類": {
    nodes: demoArticleClassificationNodes,
    edges: demoArticleClassificationEdges,
  },
  "AI 文章標題": {
    nodes: demoTitleGenerationNodes,
    edges: demoTitleGenerationEdges,
  },
  自動地震文: {
    nodes: demoEarthquakeNodes,
    edges: demoEarthquakeEdges,
  },
  "Podcast 生成": {
    nodes: demoPodcastNodes,
    edges: demoPodcastEdges,
  },
  "AI 投票建議": {
    nodes: demoVotingNodes,
    edges: demoVotingEdges,
  },
};

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
    description: "PM demo：從 CMS 取文後交給 AI 自動分類並回寫標記",
    status: "published",
    nodes: demoArticleClassificationNodes,
    edges: demoArticleClassificationEdges,
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
    const templateGraph = templateGraphSeedByName[template.name] ?? {
      nodes: "[]",
      edges: "[]",
    };

    await prisma.workflowTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        status: template.status,
        nodes: templateGraph.nodes,
        edges: templateGraph.edges,
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
