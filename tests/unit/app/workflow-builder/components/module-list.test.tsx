import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNodesStore } from "@/stores/flow-editor/nodes-store";
import { moduleGroups } from "../../../../../app/[workflow-builder]/components/module-list-config";

const mockModuleCardState = vi.hoisted(() => ({
  cardsByTitle: new Map<string, { onClick?: () => void }>(),
}));

vi.mock("../../../../../app/[workflow-builder]/components/module-card", () => ({
  ModuleCard: ({ title, onClick }: { title: string; onClick?: () => void }) => {
    mockModuleCardState.cardsByTitle.set(title, { onClick });

    return (
      <button type="button" data-title={title} onClick={onClick}>
        {title}
      </button>
    );
  },
}));

describe("module list", () => {
  beforeEach(() => {
    mockModuleCardState.cardsByTitle.clear();
    useNodesStore.getState().loadSnapshot({ nodes: [], edges: [] });
  });

  it("lists AI modules in the module config", () => {
    const aiGroup = moduleGroups.find((group) => group.title === "AI 模組");

    expect(aiGroup?.modules.map((module) => module.nodeType)).toEqual([
      "aiCall",
      "aiClassifierTagger",
      "aiTitleGeneration",
      "podcastGeneration",
      "aiVoteSuggestion",
    ]);
    expect(aiGroup?.modules.map((module) => module.title)).toEqual([
      "呼叫 AI",
      "AI自動分類與標籤",
      "AI 文章標題",
      "Podcast 生成",
      "AI 投票建議",
    ]);
  });

  it("adds an aiCall title-generation node when the AI title module is clicked", async () => {
    const { default: ModuleList } =
      await import("../../../../../app/[workflow-builder]/components/module-list");

    renderToStaticMarkup(<ModuleList />);

    const titleCard = mockModuleCardState.cardsByTitle.get("AI 文章標題");

    expect(titleCard).toBeDefined();

    titleCard?.onClick?.();

    expect(useNodesStore.getState().nodes.at(-1)).toMatchObject({
      type: "aiCall",
      data: {
        title: "AI 文章標題",
        cmsField: "title",
      },
    });
  });

  it("adds an aiCall vote-suggestion node when the AI voting module is clicked", async () => {
    const { default: ModuleList } =
      await import("../../../../../app/[workflow-builder]/components/module-list");

    renderToStaticMarkup(<ModuleList />);

    const votingCard = mockModuleCardState.cardsByTitle.get("AI 投票建議");

    expect(votingCard).toBeDefined();

    votingCard?.onClick?.();

    expect(useNodesStore.getState().nodes.at(-1)).toMatchObject({
      type: "aiCall",
      data: {
        title: "AI 投票建議",
        cmsField: "recommendedPoll",
      },
    });
  });

  it("adds an aiClassifierTagger node when the AI classifier module is clicked", async () => {
    const { default: ModuleList } =
      await import("../../../../../app/[workflow-builder]/components/module-list");

    renderToStaticMarkup(<ModuleList />);

    const classifierCard =
      mockModuleCardState.cardsByTitle.get("AI自動分類與標籤");

    expect(classifierCard).toBeDefined();

    classifierCard?.onClick?.();

    expect(useNodesStore.getState().nodes.at(-1)).toMatchObject({
      type: "aiClassifierTagger",
    });
  });
});
