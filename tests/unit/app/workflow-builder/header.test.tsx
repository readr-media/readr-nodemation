import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const workflowEditorState = vi.hoisted(() => ({
  workflowId: "workflow-123",
  sourceWorkflowId: "workflow-123",
  name: "文章自動分類與標記",
  description: "說明",
  status: "draft" as const,
  isDirty: false,
  setName: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

vi.mock("@/components/layout/user-info", () => ({
  UserInfo: () => <div>使用者資訊</div>,
}));

vi.mock("@/app/[workflow-builder]/components/save-workflow-dialog", () => ({
  default: (props: {
    workflowName: string;
    workflowDescription: string;
    workflowStatus: string;
  }) => (
    <div
      data-save-dialog="true"
      data-workflow-name={props.workflowName}
      data-workflow-description={props.workflowDescription}
      data-workflow-status={props.workflowStatus}
    />
  ),
}));

vi.mock("@/stores/workflow-editor/store", () => ({
  useWorkflowEditorStore: (selector: (state: typeof workflowEditorState) => unknown) =>
    selector(workflowEditorState),
}));

describe("workflow builder header", () => {
  beforeEach(() => {
    workflowEditorState.workflowId = "workflow-123";
    workflowEditorState.sourceWorkflowId = "workflow-123";
    workflowEditorState.name = "文章自動分類與標記";
    workflowEditorState.description = "說明";
    workflowEditorState.status = "draft";
    workflowEditorState.isDirty = false;
    workflowEditorState.setName.mockReset();
  });

  it("renders the loaded workflow name and status without dirty text", async () => {
    workflowEditorState.name = "既有工作流程";
    workflowEditorState.status = "published";

    const { default: Header } = await import(
      "@/app/[workflow-builder]/components/header"
    );
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain('value="既有工作流程"');
    expect(markup).toContain("已發佈");
    expect(markup).not.toContain("未儲存變更");
    expect(markup).toContain('data-save-dialog="true"');
    expect(markup).toContain('data-workflow-name="既有工作流程"');
    expect(markup).toContain('data-workflow-description="說明"');
    expect(markup).toContain('data-workflow-status="published"');
  });

  it("shows dirty state only when the workflow has unsaved changes", async () => {
    workflowEditorState.isDirty = true;

    const { default: Header } = await import(
      "@/app/[workflow-builder]/components/header"
    );
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain("未儲存變更");
  });
});
