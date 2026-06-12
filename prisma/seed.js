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
        action: "從 CMS 輸入文章",
        action_code: "cms",
        description: "從 CMS 系統抓取文章內容",
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

const userSeed = [
  {
    id: "user-admin-amy",
    name: "林艾美",
    role: "admin",
    email: "amy@readr.tw",
  },
  {
    id: "user-editor-wxm",
    name: "王小明",
    role: "editor",
    email: "wxm@readr.tw",
  },
  {
    id: "user-reviewer-cxh",
    name: "陳曉華",
    role: "reviewer",
    email: "cxh@readr.tw",
  },
  {
    id: "user-producer-lsy",
    name: "李商隱",
    role: "producer",
    email: "lsy@readr.tw",
  },
  {
    id: "user-operator-hyh",
    name: "黃彥豪",
    role: "operator",
    email: "hyh@readr.tw",
  },
];

const demoArticleClassificationNodes = JSON.stringify([
  {
    id: "cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從 CMS 輸入文章",
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
      inputFields: {
        title: "source.title",
        content: "source.content",
      },
      promptTemplate: "",
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
      title: "輸出文字到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "classifier-ai-categories-to-categories",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "classifier-ai-tags-to-tags",
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
      title: "從 CMS 輸入文章",
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
    id: "title-aiTitle-node",
    type: "aiTitle",
    position: { x: 360, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI 文章標題",
      titleStyle: "seo",
      titleTemperature: 0.5,
      titleKeywords: "",
    },
  },
  {
    id: "title-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "title-ai-output-to-recommendedTitle",
          sourceField: "{{ ai.output }}",
          targetField: "recommendedTitle",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoTitleGenerationEdges = JSON.stringify([
  {
    id: "title-cmsInput-node->title-aiTitle-node",
    source: "title-cmsInput-node",
    target: "title-aiTitle-node",
  },
  {
    id: "title-aiTitle-node->title-cmsOutput-node",
    source: "title-aiTitle-node",
    target: "title-cmsOutput-node",
  },
]);

const demoEarthquakeNodes = JSON.stringify([
  {
    id: "earthquake-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從 CMS 輸入文章",
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
      title: "輸出文字到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "earthquake-ai-output-to-title",
          sourceField: "{{ ai.output }}",
          targetField: "title",
        },
        {
          id: "earthquake-ai-output-to-content",
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
      title: "從 CMS 輸入文章",
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
      podcastMode: "deepDive",
      podcastLength: "medium",
    },
  },
  {
    id: "podcast-cmsOutputAudio-node",
    type: "cmsOutputAudio",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出音檔到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Audio File",
      cmsAudioFileIds: "",
      mappings: [
        {
          key: "title",
          sourceField: "{{ ai.podcastTitle }}",
          targetField: "title",
        },
        {
          key: "description",
          sourceField: "{{ ai.podcastScript }}",
          targetField: "description",
        },
        {
          id: "podcast-ai-output-to-audioFile",
          sourceField: "{{ ai.audioFile }}",
          targetField: "audioFile",
        },
      ],
      mode: "create",
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
    id: "podcast-generation-node->podcast-cmsOutputAudio-node",
    source: "podcast-generation-node",
    target: "podcast-cmsOutputAudio-node",
  },
]);

const demoVotingNodes = JSON.stringify([
  {
    id: "voting-cmsInput-node",
    type: "cmsInput",
    position: { x: 80, y: 160 },
    data: {
      title: "從 CMS 輸入文章",
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
    id: "voting-aiPoll-node",
    type: "aiPoll",
    position: { x: 360, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "AI 投票建議",
      userPrompt: "",
      categoryAmount: 2,
    },
  },
  {
    id: "voting-cmsOutput-node",
    type: "cmsOutput",
    position: { x: 640, y: 160 },
    measured: { width: 240, height: 62 },
    data: {
      title: "輸出文字到 CMS",
      cmsConfigId: "",
      cmsName: "Readr CMS",
      cmsList: "Posts",
      cmsPostIds: "",
      cmsPostSlugs: "",
      mappings: [
        {
          id: "voting-ai-output-to-recommendedPoll",
          sourceField: "{{ ai.output }}",
          targetField: "recommendedPoll",
        },
      ],
      mode: "overwrite",
      postStatus: "draft",
    },
  },
]);

const demoVotingEdges = JSON.stringify([
  {
    id: "voting-cmsInput-node->voting-aiPoll-node",
    source: "voting-cmsInput-node",
    target: "voting-aiPoll-node",
  },
  {
    id: "voting-aiPoll-node->voting-cmsOutput-node",
    source: "voting-aiPoll-node",
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

  for (const user of userSeed) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
      create: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  }

  const primaryUserId = userSeed[0]?.id ?? null;

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
        user_id: primaryUserId,
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
        user_id: primaryUserId,
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
