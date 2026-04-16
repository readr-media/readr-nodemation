"use client";

import type { Edge, Node } from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import type { ExportResultNodeData } from "@/components/flow/nodes/export-result-node";
import type { WorkflowStatus } from "@/lib/workflow-status";
import type { PodcastGenerationNodeData } from "@/stores/flow-editor/slices/podcast-generation-node-slice";

import { createAiClassifierTaggerNodeData } from "@/stores/flow-editor/slices/ai-classifier-tagger-node-slice";
import { createCmsInputNodeData } from "@/stores/flow-editor/slices/cms-node-slice";
import { createCmsOutputNodeData } from "@/stores/flow-editor/slices/cms-output-node-slice";
import { generateId } from "@/utils/generate-id";

type WorkflowRecord = {
  id: string;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  nodes: string;
  edges: string;
};

type LoadWorkflowIntoStoresInput = {
  workflowId: string | null;
  fetchImpl: typeof fetch;
  loadSnapshot: (payload: { nodes: Node[]; edges: Edge[] }) => void;
  hydrateFromWorkflow: (workflow: {
    workflowId: string | null;
    name: string;
    description?: string | null;
    status: WorkflowStatus;
    nodes: Node[];
    edges: Edge[];
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
  model: typeof data.model === "string" ? data.model : "gemini-1.5-flash",
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
    model: typeof data.model === "string" ? data.model : defaults.model,
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

const normalizeCmsOutputData = (
  _data: Record<string, unknown>,
): CmsOutputNodeData => createCmsOutputNodeData();

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

const normalizeExportResultData = (
  data: Record<string, unknown>,
): ExportResultNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "匯出結果",
  source: typeof data.source === "string" ? data.source : "AI Tagging → tags",
  format: typeof data.format === "string" ? data.format : "JSON",
  fileNamePattern:
    typeof data.fileNamePattern === "string" ? data.fileNamePattern : "",
  destination:
    typeof data.destination === "string" ? data.destination : "local_download",
  autoDownload: Boolean(data.autoDownload),
  zipFiles: Boolean(data.zipFiles),
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
  model: typeof data.model === "string" ? data.model : "gemini-1.5-flash",
  promptTemplate:
    typeof data.promptTemplate === "string"
      ? data.promptTemplate
      : typeof data.prompt === "string"
        ? data.prompt
        : "",
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
  if (node.type === "aiClassifierTagger") {
    return {
      ...node,
      data: normalizeAiClassifierTaggerData(
        isRecord(node.data) ? node.data : {},
      ),
    };
  }

  if (!node.data || typeof node.data !== "object") {
    return node;
  }

  const data = node.data as Record<string, unknown>;

  switch (node.type) {
    case "cmsInput":
      return { ...node, data: normalizeCmsInputData(data) };
    case "aiCall":
      return { ...node, data: normalizeAiCallData(data) };
    case "cmsOutput":
      return { ...node, data: normalizeCmsOutputData(data) };
    case "codeBlock":
      return { ...node, data: normalizeCodeData(data) };
    case "exportResult":
      return { ...node, data: normalizeExportResultData(data) };
    case "podcastGeneration":
      return { ...node, data: normalizePodcastGenerationData(data) };
    default:
      return node;
  }
};

const parseGraphSnapshot = (workflow: WorkflowRecord) => ({
  nodes: (JSON.parse(workflow.nodes) as Node[]).map(normalizeNode),
  edges: JSON.parse(workflow.edges) as Edge[],
});

export const loadWorkflowIntoStores = async ({
  workflowId,
  fetchImpl,
  loadSnapshot,
  hydrateFromWorkflow,
}: LoadWorkflowIntoStoresInput): Promise<WorkflowLoadResult> => {
  if (!workflowId) {
    return { status: "idle" };
  }

  try {
    const response = await fetchImpl(`/api/workflows/${workflowId}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return { status: "missing" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

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
    });

    return { status: "loaded" };
  } catch {
    return { status: "error" };
  }
};
