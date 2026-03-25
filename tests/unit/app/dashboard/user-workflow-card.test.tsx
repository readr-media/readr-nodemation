import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UserWorkflowCard from "@/app/dashboard/_components/user-workflow-card";

describe("UserWorkflowCard", () => {
  it("renders a keyboard-accessible link to the workflow builder", () => {
    const markup = renderToStaticMarkup(
      <UserWorkflowCard
        id="workflow-123"
        name="晨間自動發稿"
        description="編輯於 2026/03/25"
        time="執行於 2026/03/24"
        status="draft"
      />,
    );

    expect(markup).toContain('href="/workflow-builder?workflowId=workflow-123"');
    expect(markup).toContain("<a");
    expect(markup).toContain("晨間自動發稿");
    expect(markup).toContain("編輯於 2026/03/25");
    expect(markup).toContain("執行於 2026/03/24");
  });
});
