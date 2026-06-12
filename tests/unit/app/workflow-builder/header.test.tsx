import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatWorkflowTimestamp } from "@/lib/format-datetime";

const workflowEditorState = vi.hoisted(() => ({
  workflowId: "workflow-123",
  name: "文章自動分類與標記",
  description: "說明",
  status: "draft" as "draft" | "published" | "template" | "running",
  updatedAt: null as string | null,
  lastRunAt: null as string | null,
  createdAt: null as string | null,
  resetBaseline: vi.fn(),
  syncServerStatus: vi.fn(),
  setCreatedAt: vi.fn(),
  setRunTriggered: vi.fn(),
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

const savedAt = "2026-06-10T03:00:00.000Z";
const createdAt = "2026-06-01T03:00:00.000Z";

describe("workflow builder header", () => {
  beforeEach(() => {
    workflowEditorState.workflowId = "workflow-123";
    workflowEditorState.name = "文章自動分類與標記";
    workflowEditorState.description = "說明";
    workflowEditorState.status = "draft";
    workflowEditorState.updatedAt = null;
    workflowEditorState.lastRunAt = null;
    workflowEditorState.createdAt = null;
    workflowEditorState.resetBaseline.mockReset();
    workflowEditorState.syncServerStatus.mockReset();
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

  it("shows saved activity text for a persisted draft workflow", async () => {
    workflowEditorState.status = "draft";
    workflowEditorState.updatedAt = savedAt;
    workflowEditorState.createdAt = createdAt;

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);
    const formattedTime = formatWorkflowTimestamp(savedAt);

    expect(formattedTime).toBeTruthy();
    expect(markup).toContain(`已於 ${formattedTime} 儲存`);
  });

  it("shows created activity text when updatedAt matches createdAt", async () => {
    workflowEditorState.status = "draft";
    workflowEditorState.updatedAt = savedAt;
    workflowEditorState.createdAt = savedAt;

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);
    const formattedTime = formatWorkflowTimestamp(savedAt);

    expect(markup).toContain(`已於 ${formattedTime} 建立`);
  });

  it("hides activity text for template workflows", async () => {
    workflowEditorState.status = "template";
    workflowEditorState.updatedAt = savedAt;

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).not.toContain("已於");
  });

  it("shows executed activity text while a workflow is running", async () => {
    workflowEditorState.status = "running";
    workflowEditorState.updatedAt = savedAt;

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);
    const formattedTime = formatWorkflowTimestamp(savedAt);

    expect(markup).toContain("執行中");
    expect(markup).toContain(`已於 ${formattedTime} 執行`);
  });

  it("shows completed activity text after a published run finishes", async () => {
    workflowEditorState.status = "published";
    workflowEditorState.updatedAt = savedAt;
    workflowEditorState.lastRunAt = savedAt;

    const { default: Header } =
      await import("@/components/layout/header-workflow-builder");
    const markup = renderToStaticMarkup(<Header />);
    const formattedTime = formatWorkflowTimestamp(savedAt);

    expect(markup).toContain("已執行");
    expect(markup).toContain(`已於 ${formattedTime} 完成執行`);
  });
});
