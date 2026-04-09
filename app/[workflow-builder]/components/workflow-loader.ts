"use client";

import type { Edge, Node } from "@xyflow/react";
import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import type { ExportResultNodeData } from "@/components/flow/nodes/export-result-node";
import type { WorkflowStatus } from "@/lib/workflow-status";
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

const normalizeCmsInputData = (data: Record<string, unknown>): CmsInputNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "從 CMS 輸入",
  source:
    typeof data.source === "string"
      ? data.source
      : typeof data.cmsSource === "string"
        ? data.cmsSource
        : "READr CMS",
  entryId: typeof data.entryId === "string" ? data.entryId : "",
  fields:
    typeof data.fields === "object" && data.fields !== null
      ? {
          title: Boolean((data.fields as Record<string, unknown>).title),
          content: Boolean((data.fields as Record<string, unknown>).content),
          author: Boolean((data.fields as Record<string, unknown>).author),
          category: Boolean((data.fields as Record<string, unknown>).category),
        }
      : typeof data.enabledFields === "object" && data.enabledFields !== null
        ? {
            title: Boolean((data.enabledFields as Record<string, unknown>).title),
            content: Boolean((data.enabledFields as Record<string, unknown>).content),
            author: Boolean((data.enabledFields as Record<string, unknown>).author),
            category: Boolean((data.enabledFields as Record<string, unknown>).category),
          }
        : {
            title: true,
            content: true,
            author: false,
            category: false,
          },
  outputFormat: typeof data.outputFormat === "string" ? data.outputFormat : "JSON",
});

const normalizeAiCallData = (data: Record<string, unknown>): AiCallNodeData => ({
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
  outputFormat: typeof data.outputFormat === "string" ? data.outputFormat : "JSON",
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

const normalizeCmsOutputData = (
  data: Record<string, unknown>,
): CmsOutputNodeData => ({
  title:
    typeof data.title === "string"
      ? data.title
      : typeof data.label === "string"
        ? data.label
        : "輸出到 CMS",
  cmsLocation:
    typeof data.cmsLocation === "string"
      ? data.cmsLocation
      : typeof data.cmsDestination === "string"
        ? data.cmsDestination
        : "READr",
  articleIdOrSlug:
    typeof data.articleIdOrSlug === "string" ? data.articleIdOrSlug : "",
  mappings: Array.isArray(data.mappings)
    ? data.mappings.map((mapping) => ({
        id:
          typeof (mapping as Record<string, unknown>).id === "string"
            ? ((mapping as Record<string, unknown>).id as string)
            : generateId(),
        sourceField:
          typeof (mapping as Record<string, unknown>).sourceField === "string"
            ? ((mapping as Record<string, unknown>).sourceField as string)
            : "",
        targetField:
          typeof (mapping as Record<string, unknown>).targetField === "string"
            ? ((mapping as Record<string, unknown>).targetField as string)
            : "",
      }))
    : [],
  mode: data.mode === "append" ? "append" : "overwrite",
});

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
  source:
    typeof data.source === "string" ? data.source : "AI Tagging → tags",
  format: typeof data.format === "string" ? data.format : "JSON",
  fileNamePattern:
    typeof data.fileNamePattern === "string" ? data.fileNamePattern : "",
  destination:
    typeof data.destination === "string" ? data.destination : "local_download",
  autoDownload: Boolean(data.autoDownload),
  zipFiles: Boolean(data.zipFiles),
});

const normalizeNode = (node: Node): Node => {
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
