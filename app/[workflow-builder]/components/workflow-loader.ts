"use client";

import type { Edge, Node } from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";
import type { AiTitleGenerationNodeData } from "@/components/flow/nodes/ai-title-generation-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type {
  CmsAudioFieldMapping,
  CmsOutputAudioNodeData,
  CmsOutputAudioTargetField,
} from "@/components/flow/nodes/cms-output-audio-node";
import type {
  CmsFieldMapping,
  CmsOutputNodeData,
  CmsOutputTargetField,
} from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import { cronToSchedule } from "@/lib/cron-to-schedule";
import type { WorkflowStatus } from "@/lib/workflow-status";
import { useExecutionScheduleStore } from "@/stores/execution-schedule-store";
import { createAiClassifierTaggerNodeData } from "@/stores/flow-editor/slices/ai-classifier-tagger-node-slice";
import { createAiPollNodeData } from "@/stores/flow-editor/slices/ai-poll-node-slice";
import { createAiTitleGenerationNodeData } from "@/stores/flow-editor/slices/ai-title-generation-node-slice";
import { createCmsInputNodeData } from "@/stores/flow-editor/slices/cms-node-slice";
import { createCmsOutputAudioNodeData } from "@/stores/flow-editor/slices/cms-output-audio-node-slice";
import { createCmsOutputNodeData } from "@/stores/flow-editor/slices/cms-output-node-slice";
import type { PodcastGenerationNodeData } from "@/stores/flow-editor/slices/podcast-generation-node-slice";
import { generateId } from "@/utils/generate-id";

type WorkflowRecord = {
  id: string;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  nodes: string;
  edges: string;
  cron_expression?: string | null;
  updated_at?: string | null;
  last_run_at?: string | null;
  created_at?: string | null;
};

// applyScheduleFromCron re-populates the execution-schedule store from a
// workflow's stored cron_expression so the Schedule dialog reflects the saved
// schedule. A workflow with no schedule resets the store to a clean slate.
const applyScheduleFromCron = (cronExpression: string | null | undefined) => {
  const schedule = useExecutionScheduleStore.getState();
  const parsed = cronToSchedule(cronExpression);
  if (!parsed) {
    schedule.reset();
    return;
  }
  schedule.setFrequency(parsed.frequency);
  schedule.setSlots(parsed.slots);
  schedule.setEnabled(true);
};

type WorkflowTemplateRecord = {
  id: number;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  nodes: string;
  edges: string;
};

type LoadWorkflowIntoStoresInput = {
  workflowId: string | null;
  templateId: string | null;
  fetchImpl: typeof fetch;
  loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  hydrateFromWorkflow: (workflow: {
    workflowId: string | null;
    name: string;
    description?: string | null;
    status: WorkflowStatus;
    nodes: Node[];
    edges: Edge[];
    updatedAt?: string | null;
    lastRunAt?: string | null;
    createdAt?: string | null;
  }) => void;
};

export type WorkflowLoadResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "missing" }
  | { status: "error" };

const normalizeCmsInputData = (
  data: Record<string, unknown>,
): CmsInputNodeData => {
  const defaults = createCmsInputNodeData();

  return {
    ...defaults,
    title: typeof data.title === "string" ? data.title : defaults.title,
    cmsConfigId:
      typeof data.cmsConfigId === "string"
        ? data.cmsConfigId
        : defaults.cmsConfigId,
    cmsName: typeof data.cmsName === "string" ? data.cmsName : defaults.cmsName,
    cmsList: typeof data.cmsList === "string" ? data.cmsList : defaults.cmsList,
    cmsPostIds:
      typeof data.cmsPostIds === "string"
        ? data.cmsPostIds
        : defaults.cmsPostIds,
    cmsPostSlugs:
      typeof data.cmsPostSlugs === "string"
        ? data.cmsPostSlugs
        : defaults.cmsPostSlugs,
    sourceFields:
      typeof data.sourceFields === "object" && data.sourceFields !== null
        ? {
            ...defaults.sourceFields,
            title: Boolean(
              (data.sourceFields as Record<string, unknown>).title,
            ),
            category: Boolean(
              (data.sourceFields as Record<string, unknown>).category,
            ),
            content: Boolean(
              (data.sourceFields as Record<string, unknown>).content,
            ),
            tags: Boolean((data.sourceFields as Record<string, unknown>).tags),
          }
        : defaults.sourceFields,
  };
};

const normalizeAiCallData = (
  data: Record<string, unknown>,
): AiCallNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "呼叫 AI",
  inputs:
    typeof data.inputs === "object" && data.inputs !== null
      ? {
          title: Boolean((data.inputs as Record<string, unknown>).title),
          content: Boolean((data.inputs as Record<string, unknown>).content),
          summary: Boolean((data.inputs as Record<string, unknown>).summary),
        }
      : {
          title: true,
          content: true,
          summary: false,
        },
  outputFormat:
    typeof data.outputFormat === "string" ? data.outputFormat : "JSON",
  promptTemplate:
    typeof data.promptTemplate === "string"
      ? data.promptTemplate
      : typeof data.prompt === "string"
        ? data.prompt
        : "",
  cmsField:
    typeof data.cmsField === "string"
      ? data.cmsField
      : typeof data.targetField === "string"
        ? data.targetField
        : "",
  testInput: typeof data.testInput === "string" ? data.testInput : "",
});

const normalizeAiClassifierTaggerData = (
  data: Record<string, unknown>,
): AiClassifierTaggerNodeData => {
  const defaults = createAiClassifierTaggerNodeData();

  return {
    ...defaults,
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.label === "string"
          ? data.label
          : defaults.title,
    inputFields:
      typeof data.inputFields === "object" && data.inputFields !== null
        ? {
            ...defaults.inputFields,
            title:
              typeof (data.inputFields as Record<string, unknown>).title ===
              "string"
                ? ((data.inputFields as Record<string, unknown>)
                    .title as string)
                : defaults.inputFields.title,
            content:
              typeof (data.inputFields as Record<string, unknown>).content ===
              "string"
                ? ((data.inputFields as Record<string, unknown>)
                    .content as string)
                : defaults.inputFields.content,
          }
        : defaults.inputFields,
    promptTemplate:
      typeof data.promptTemplate === "string"
        ? data.promptTemplate
        : defaults.promptTemplate,
    categoryAmount:
      typeof data.categoryAmount === "number"
        ? data.categoryAmount
        : defaults.categoryAmount,
    tagAmount:
      typeof data.tagAmount === "number" ? data.tagAmount : defaults.tagAmount,
    responseFormat: defaults.responseFormat,
    outputFields: defaults.outputFields,
  };
};

const normalizeAiPollData = (
  data: Record<string, unknown>,
): AiPollNodeData => {
  const defaults = createAiPollNodeData();

  return {
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.label === "string"
          ? data.label
          : defaults.title,
    userPrompt:
      typeof data.userPrompt === "string"
        ? data.userPrompt
        : defaults.userPrompt,
    categoryAmount:
      typeof data.categoryAmount === "number"
        ? data.categoryAmount
        : defaults.categoryAmount,
  };
};

const normalizeAiTitleGenerationData = (
  data: Record<string, unknown>,
): AiTitleGenerationNodeData => {
  const defaults = createAiTitleGenerationNodeData();

  return {
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.label === "string"
          ? data.label
          : defaults.title,
    titleStyle:
      data.titleStyle === "seo" ||
      data.titleStyle === "social" ||
      data.titleStyle === "professional"
        ? data.titleStyle
        : defaults.titleStyle,
    titleTemperature:
      typeof data.titleTemperature === "number" &&
      data.titleTemperature >= 0 &&
      data.titleTemperature <= 1
        ? Math.round(data.titleTemperature * 10) / 10
        : defaults.titleTemperature,
    titleKeywords:
      typeof data.titleKeywords === "string"
        ? data.titleKeywords
        : defaults.titleKeywords,
  };
};

const normalizeCmsOutputData = (
  data: Record<string, unknown>,
): CmsOutputNodeData => {
  const defaults = createCmsOutputNodeData();
  const allowedTargetFields: CmsOutputTargetField[] = [
    "title",
    "recommendedTitle",
    "content",
    "summary",
    "categories",
    "tags",
    "recommendedPoll",
  ];

  const mappings: CmsFieldMapping[] = Array.isArray(data.mappings)
    ? data.mappings
        .map((mapping): CmsFieldMapping | null => {
          const record = mapping as Record<string, unknown>;
          if (
            typeof record.sourceField !== "string" ||
            typeof record.targetField !== "string" ||
            !allowedTargetFields.includes(
              record.targetField as CmsOutputTargetField,
            )
          ) {
            return null;
          }

          return {
            id: typeof record.id === "string" ? record.id : generateId(),
            sourceField: record.sourceField,
            targetField: record.targetField as CmsOutputTargetField,
          };
        })
        .filter((value): value is CmsFieldMapping => value !== null)
    : defaults.mappings;

  return {
    ...defaults,
    title: typeof data.title === "string" ? data.title : defaults.title,
    cmsConfigId:
      typeof data.cmsConfigId === "string"
        ? data.cmsConfigId
        : defaults.cmsConfigId,
    cmsName: typeof data.cmsName === "string" ? data.cmsName : defaults.cmsName,
    cmsList: typeof data.cmsList === "string" ? data.cmsList : defaults.cmsList,
    cmsPostIds:
      typeof data.cmsPostIds === "string"
        ? data.cmsPostIds
        : defaults.cmsPostIds,
    cmsPostSlugs:
      typeof data.cmsPostSlugs === "string"
        ? data.cmsPostSlugs
        : defaults.cmsPostSlugs,
    mappings,
    mode:
      data.mode === "overwrite" || data.mode === "append"
        ? data.mode
        : defaults.mode,
    postStatus:
      data.postStatus === "draft" || data.postStatus === "published"
        ? data.postStatus
        : defaults.postStatus,
  };
};

const normalizeCmsOutputAudioData = (
  data: Record<string, unknown>,
): CmsOutputAudioNodeData => {
  const defaults = createCmsOutputAudioNodeData();

  return {
    ...defaults,
    title:
      typeof data.title === "string"
        ? data.title
        : typeof data.label === "string"
          ? data.label
          : defaults.title,
    cmsConfigId:
      typeof data.cmsConfigId === "string"
        ? data.cmsConfigId
        : defaults.cmsConfigId,
    cmsName: typeof data.cmsName === "string" ? data.cmsName : defaults.cmsName,
    cmsList: typeof data.cmsList === "string" ? data.cmsList : defaults.cmsList,
    cmsAudioFileIds:
      typeof data.cmsAudioFileIds === "string"
        ? data.cmsAudioFileIds
        : defaults.cmsAudioFileIds,
    mappings: Array.isArray(data.mappings)
      ? data.mappings.map(
          (mapping): CmsAudioFieldMapping => ({
            id:
              typeof (mapping as Record<string, unknown>).id === "string"
                ? ((mapping as Record<string, unknown>).id as string)
                : generateId(),
            sourceField:
              typeof (mapping as Record<string, unknown>).sourceField ===
              "string"
                ? ((mapping as Record<string, unknown>).sourceField as string)
                : "",
            targetField:
              typeof (mapping as Record<string, unknown>).targetField ===
              "string"
                ? ((mapping as Record<string, unknown>)
                    .targetField as CmsOutputAudioTargetField)
                : "title",
          }),
        )
      : defaults.mappings,
  };
};

const normalizeCodeData = (data: Record<string, unknown>): CodeNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "撰寫程式碼",
  language: typeof data.language === "string" ? data.language : "JavaScript",
  code: typeof data.code === "string" ? data.code : "",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizePodcastGenerationData = (
  data: Record<string, unknown>,
): PodcastGenerationNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "Podcast 生成",
  podcastMode:
    data.podcastMode === "summary" ||
    data.podcastMode === "commentary" ||
    data.podcastMode === "debate" ||
    data.podcastMode === "deepDive"
      ? data.podcastMode
      : "deepDive",
  podcastLength:
    data.podcastLength === "short" ||
    data.podcastLength === "medium" ||
    data.podcastLength === "long"
      ? data.podcastLength
      : "medium",
});

const normalizeNode = (node: Node): Node => {
  const data = isRecord(node.data) ? node.data : {};

  switch (node.type) {
    case "aiClassifierTagger":
      return { ...node, data: normalizeAiClassifierTaggerData(data) };
    case "aiPoll":
      return { ...node, data: normalizeAiPollData(data) };
    case "aiTitle":
      return { ...node, data: normalizeAiTitleGenerationData(data) };
    case "cmsInput":
      return { ...node, data: normalizeCmsInputData(data) };
    case "aiCall":
      return { ...node, data: normalizeAiCallData(data) };
    case "cmsOutput":
      return { ...node, data: normalizeCmsOutputData(data) };
    case "cmsOutputAudio":
      return { ...node, data: normalizeCmsOutputAudioData(data) };
    case "codeBlock":
      return { ...node, data: normalizeCodeData(data) };
    case "podcastGeneration":
      return { ...node, data: normalizePodcastGenerationData(data) };
    default:
      return node;
  }
};

const parseGraphSnapshot = (record: { nodes: string; edges: string }) => ({
  nodes: (JSON.parse(record.nodes) as Node[]).map(normalizeNode),
  edges: JSON.parse(record.edges) as Edge[],
});

export const loadWorkflowIntoStores = async ({
  workflowId,
  templateId,
  fetchImpl,
  loadSnapshot,
  hydrateFromWorkflow,
}: LoadWorkflowIntoStoresInput): Promise<WorkflowLoadResult> => {
  if (!workflowId && !templateId) {
    // Brand-new workflow: start from a clean schedule.
    applyScheduleFromCron(null);
    return { status: "idle" };
  }

  try {
    const endpoint = workflowId
      ? `/api/workflows/${workflowId}`
      : `/api/workflow-templates/${templateId}`;
    const response = await fetchImpl(endpoint, { cache: "no-store" });

    if (response.status === 404) {
      return { status: "missing" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

    if (workflowId) {
      const workflow = (await response.json()) as WorkflowRecord;
      const snapshot = parseGraphSnapshot(workflow);

      loadSnapshot(snapshot);
      hydrateFromWorkflow({
        workflowId: workflow.id,
        name: workflow.name,
        description: workflow.description ?? "",
        status: workflow.status,
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        updatedAt: workflow.updated_at ?? null,
        lastRunAt: workflow.last_run_at ?? null,
        createdAt: workflow.created_at ?? null,
      });
      applyScheduleFromCron(workflow.cron_expression);

      return { status: "loaded" };
    }

    const template = (await response.json()) as WorkflowTemplateRecord;
    const snapshot = parseGraphSnapshot(template);

    loadSnapshot(snapshot);
    hydrateFromWorkflow({
      workflowId: null,
      name: template.name,
      description: template.description ?? "",
      status: "template",
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      updatedAt: null,
      lastRunAt: null,
      createdAt: null,
    });
    // Templates carry no schedule of their own.
    applyScheduleFromCron(null);

    return { status: "loaded" };
  } catch {
    return { status: "error" };
  }
};
