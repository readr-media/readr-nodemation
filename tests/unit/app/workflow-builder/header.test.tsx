import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const workflowEditorState = vi.hoisted(() => ({
  workflowId: "workflow-123",
  name: "文章自動分類與標記",
  description: "說明",
  status: "draft" as "draft" | "published" | "template" | "running",
  resetBaseline: vi.fn(),
  setStatus: vi.fn(),
}));

const nodesStoreState = vi.hoisted(() => ({
  nodes: [] as unknown[],
  edges: [] as unknown[],
  nodeFieldErrors: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/components/layout/user-info", () => ({
  UserInfo: () => <div>使用者資訊</div>,
}));

vi.mock("@/hooks/use-flow-json", () => ({
  useFlowJSON: () => ({ handleExport: vi.fn() }),
}));

vi.mock("@/app/[workflow-builder]/components/schedule-dialog", () => ({
  default: () => <div data-schedule-dialog="true" />,
}));

vi.mock("@/app/[workflow-builder]/components/save-workflow-action", () => ({
  saveWorkflow: vi.fn(),
}));

vi.mock("@/stores/workflow-editor/store", () => ({
  useWorkflowEditorStore: (
    selector: (state: typeof workflowEditorState) => unknown,
  ) => selector(workflowEditorState),
}));

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof nodesStoreState) => unknown) =>
    selector(nodesStoreState),
}));

describe("workflow builder header", () => {
  beforeEach(() => {
    workflowEditorState.workflowId = "workflow-123";
    workflowEditorState.name = "文章自動分類與標記";
    workflowEditorState.description = "說明";
    workflowEditorState.status = "draft";
    workflowEditorState.resetBaseline.mockReset();
    workflowEditorState.setStatus.mockReset();
  });

  it("renders the loaded workflow name in the header", async () => {
    workflowEditorState.name = "既有工作流程";
    workflowEditorState.status = "published";

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain("既有工作流程");
  });

  it("shows template badge when status is template", async () => {
    workflowEditorState.status = "template";

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain("模板");
  });

  it("does not show template badge for non-template status", async () => {
    workflowEditorState.status = "draft";

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).not.toContain("模板");
  });
});
