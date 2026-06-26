import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: () => vi.fn(),
}));

describe("earthquake input node setting", () => {
  it("renders read-only earthquake input fields with default placeholders", async () => {
    const { default: EarthquakeInputNodeSetting } =
      await import("@/app/[workflow-builder]/components/node-settings/earthquake-input-node-setting");

    const markup = renderToStaticMarkup(
      <EarthquakeInputNodeSetting
        nodeId="earthquakeInput-node"
        data={{
          title: "取得地震資訊",
        }}
      />,
    );

    expect(markup).toContain("資料來源");
    expect(markup).toContain("中央氣象署");
    expect(markup).toContain("觸發條件");
    expect(markup).toContain("最低規模 4.0 以上地震");
    expect(markup).toContain("更新方式");
    expect(markup).toContain("每3分鐘自動監測");
    expect(markup).toContain("disabled");
  });
});

describe("ai node setting", () => {
  it("renders read-only user prompt field", async () => {
    const { default: AiNodeSettings } =
      await import("@/app/[workflow-builder]/components/node-settings/ai-node-setting");

    const markup = renderToStaticMarkup(
      <AiNodeSettings
        nodeId="aiCall-node"
        data={{
          title: "呼叫 AI",
          userPrompt: "",
        }}
      />,
    );

    expect(markup).toContain("進階指令");
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("輸入來源");
    expect(markup).not.toContain("Prompt 模板");
    expect(markup).not.toContain("測試執行");
  });
});
