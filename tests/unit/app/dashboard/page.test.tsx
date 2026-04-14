import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserWorkflowsMock = vi.hoisted(() => vi.fn());
const getWorkflowTemplatesMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/workflows", () => ({
  getUserWorkflows: getUserWorkflowsMock,
}));

vi.mock("@/lib/workflow-templates", () => ({
  getWorkflowTemplates: getWorkflowTemplatesMock,
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

describe("dashboard page", () => {
  beforeEach(() => {
    getUserWorkflowsMock.mockReset();
    getWorkflowTemplatesMock.mockReset();
  });

  it("uses a responsive grid and full-span empty state for user workflows", async () => {
    getUserWorkflowsMock.mockResolvedValue([]);
    getWorkflowTemplatesMock.mockResolvedValue([]);

    const { default: Page } = await import("@/app/dashboard/page");
    const markup = renderToStaticMarkup(await Page());

    expect(markup).toContain(
      'class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"',
    );
    expect(markup).toContain('class="body-2 col-span-full text-gray-500"');
    expect(markup).toContain("尚無工作流");
  });
});
