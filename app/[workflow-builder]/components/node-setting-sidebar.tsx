"use client";

import { Cog, InfoIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import type { AiCallNodeData } from "@/components/flow/nodes/ai-call-node";
import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";
import type { AiTitleGenerationNodeData } from "@/components/flow/nodes/ai-title-generation-node";
import type { CmsInputNodeData } from "@/components/flow/nodes/cms-input-node";
import type { CmsOutputAudioNodeData } from "@/components/flow/nodes/cms-output-audio-node";
import type { CmsOutputNodeData } from "@/components/flow/nodes/cms-output-node";
import type { CodeNodeData } from "@/components/flow/nodes/code-node";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/sonner";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import type { PodcastGenerationNodeData } from "@/stores/flow-editor/slices/podcast-generation-node-slice";
import { useWorkflowEditorStore } from "@/stores/workflow-editor/store";
import AiClassifierTaggerNodeSetting from "./node-settings/ai-classifier-tagger-node-setting";
import AiNodeSettings from "./node-settings/ai-node-setting";
import AiPollNodeSetting from "./node-settings/ai-poll-node-setting";
import AiTitleGenerationNodeSetting from "./node-settings/ai-title-generation-node-setting";
import CmsNodeSetting from "./node-settings/cms-node-setting";
import CmsOutputAudioNodeSetting from "./node-settings/cms-output-audio-node-setting";
import CmsOutputNodeSetting from "./node-settings/cms-output-node-setting";
import CodeNodeSetting from "./node-settings/code-node-setting";
import PodcastGenerationNodeSetting from "./node-settings/podcast-generation-node-setting";

const EmptyState = () => (
  <div className="flex w-40 flex-col items-center gap-4 text-center">
    <div className="flex size-16 items-center justify-center rounded-2xl bg-module-iconBg">
      <Cog className="size-8 text-gray-600" strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-base font-medium leading-6 text-gray-700">
        請選擇一個節點
      </p>
      <p className="text-sm leading-[21px] text-gray-600">以開始編輯內容</p>
    </div>
  </div>
);

const NodeSettingSidebar = () => {
  const workflowStatus = useWorkflowEditorStore((state) => state.status);
  const { nodes, selectedNodeId } = useNodesStore(
    useShallow((state) => ({
      nodes: state.nodes,
      selectedNodeId: state.selectedNodeId,
    })),
  );
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const isTemplateReadonly = workflowStatus === "template";

  const showReadonlyToast = () => {
    toast("此為模板工作流，請複製一份再進行編輯", {
      id: "template-readonly-sidebar",
      icon: <InfoIcon className="size-5 text-blue-500" />,
    });
  };

  let content: ReactNode;
  switch (selectedNode?.type) {
    case "aiCall":
      content = (
        <AiNodeSettings
          nodeId={selectedNode.id}
          data={selectedNode.data as AiCallNodeData}
        />
      );
      break;
    case "aiPoll":
      content = (
        <AiPollNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as AiPollNodeData}
        />
      );
      break;
    case "aiTitle":
      content = (
        <AiTitleGenerationNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as AiTitleGenerationNodeData}
        />
      );
      break;
    case "aiClassifierTagger":
      content = (
        <AiClassifierTaggerNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as AiClassifierTaggerNodeData}
        />
      );
      break;
    case "codeBlock":
      content = (
        <CodeNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as CodeNodeData}
        />
      );
      break;
    case "cmsInput":
      content = (
        <CmsNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as CmsInputNodeData}
        />
      );
      break;
    case "cmsOutput":
      content = (
        <CmsOutputNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as CmsOutputNodeData}
        />
      );
      break;
    case "cmsOutputAudio":
      content = (
        <CmsOutputAudioNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as CmsOutputAudioNodeData}
        />
      );
      break;
    case "podcastGeneration":
      content = (
        <PodcastGenerationNodeSetting
          nodeId={selectedNode.id}
          data={selectedNode.data as PodcastGenerationNodeData}
        />
      );
      break;
    default:
      content = <EmptyState />;
  }

  return (
    <Sidebar
      side="right"
      className="border-l border-module-border bg-white md:top-16 md:h-[calc(100svh-4rem)]"
      style={{ "--sidebar-width": "18rem" } as CSSProperties}
    >
      <SidebarHeader className="node-settings-header p-4">
        <h2 className="text-lg font-medium text-module-title">
          {`${(selectedNode?.data as { title?: string })?.title ?? "節點"} 設定`}
        </h2>
        <SidebarTrigger
          aria-label="Close node settings"
          className="cursor-pointer text-gray-600 hover:text-gray-700"
        />
      </SidebarHeader>
      <SidebarContent className="flex flex-1 px-0 py-0">
        <div className="relative flex w-full">
          {content}
          {isTemplateReadonly && selectedNode ? (
            <button
              type="button"
              className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
              onClick={showReadonlyToast}
              aria-label="模板工作流節點設定為唯讀"
            />
          ) : null}
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-module-border px-4 py-3" />
    </Sidebar>
  );
};

export default NodeSettingSidebar;
