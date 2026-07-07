import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { AiPollNodeData } from "@/components/flow/nodes/ai-poll-node";

const updateAiPollNodeData = vi.fn();
const setNodeFieldError = vi.fn();
const clearNodeFieldErrors = vi.fn();

const mockStoreState = {
  updateAiPollNodeData,
  setNodeFieldError,
  clearNodeFieldErrors,
};

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

const sampleData: AiPollNodeData = {
  title: "AI 投票建議",
  userPrompt: "",
  categoryAmount: 2,
};

describe("ai poll node setting", () => {
  it("renders the poll settings panel with the option-count field and prompt placeholder", async () => {
    const { default: AiPollNodeSetting } = await import(
      "@/app/[workflow-builder]/components/node-settings/ai-poll-node-setting"
    );

    const markup = renderToStaticMarkup(
      <AiPollNodeSetting nodeId="aiPoll-node" data={sampleData} />,
    );

    expect(markup).toContain("進階指令（User Prompt）");
    expect(markup).toContain("生成投票選項數量（請輸入 2-10）");
    // multi-line 進階指令 placeholder from the PRD
    expect(markup).toContain("可在此輸入進階指令");
    expect(markup).toContain("請設計支持 / 反對立場投票");
  });

  it("keeps the 進階指令 textarea editable (not disabled)", async () => {
    const { default: AiPollNodeSetting } = await import(
      "@/app/[workflow-builder]/components/node-settings/ai-poll-node-setting"
    );

    const markup = renderToStaticMarkup(
      <AiPollNodeSetting nodeId="aiPoll-node" data={sampleData} />,
    );

    // A disabled control renders the attribute form `disabled=""` (the
    // `disabled:` substring in Tailwind class names is unrelated). Neither the
    // 進階指令 textarea nor the option-count input should carry it.
    expect(markup).not.toContain('disabled=""');
  });
});
