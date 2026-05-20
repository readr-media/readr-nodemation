import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserWorkflowsMock = vi.hoisted(() => vi.fn());
const getWorkflowTemplatesMock = vi.hoisted(() => vi.fn());
const getActiveUserIdMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/workflows", () => ({
  getUserWorkflows: getUserWorkflowsMock,
}));

vi.mock("@/lib/workflow-templates", () => ({
  getWorkflowTemplates: getWorkflowTemplatesMock,
}));

vi.mock("@/lib/active-user", () => ({
  getActiveUserId: getActiveUserIdMock,
}));

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ComponentProps<"button">) => <button {...props} />,
}));

vi.mock("lucide-react", () => ({
  PlusIcon: () => <span data-plus-icon="true" />,
}));

vi.mock("@/app/dashboard/_components/user-workflow-card", () => ({
  default: ({ name }: { name: string }) => (
    <article data-user-workflow-card="true">{name}</article>
  ),
}));

vi.mock("@/app/dashboard/_components/template-workflow-card", () => ({
  default: ({ name }: { name: string }) => (
    <article data-template-workflow-card="true">{name}</article>
  ),
}));

vi.mock("@/app/dashboard/_components/create-workflow-dialog", () => ({
  default: () => <div data-create-workflow-dialog="true" />,
}));

vi.mock("@/app/dashboard/_components/user-workflow-grid", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div
      data-user-workflow-grid="true"
      className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </div>
  ),
}));

vi.mock("@/app/dashboard/_components/workflow-creating-context", () => ({
  WorkflowCreatingProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("dashboard page", () => {
  beforeEach(() => {
    getUserWorkflowsMock.mockReset();
    getWorkflowTemplatesMock.mockReset();
    getActiveUserIdMock.mockReset();
  });

  it("uses a responsive grid and shows create-workflow dialog as the user workflow empty state", async () => {
    getActiveUserIdMock.mockResolvedValue("user-123");
    getUserWorkflowsMock.mockResolvedValue([]);
    getWorkflowTemplatesMock.mockResolvedValue([]);

    const { default: Page } = await import("@/app/dashboard/page");
    const markup = renderToStaticMarkup(await Page());

    expect(markup).toContain(
      'class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"',
    );
    expect(markup).toContain('data-create-workflow-dialog="true"');
    expect(markup).toContain("尚無模板");
  });
});
