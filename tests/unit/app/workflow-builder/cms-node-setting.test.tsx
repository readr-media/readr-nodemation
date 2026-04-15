import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const updateCmsNodeData = vi.fn();

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

const mockStoreState = {
  updateCmsNodeData,
};

describe("cms node setting", () => {
  it("renders the approved cmsInput settings UI", async () => {
    const { default: CmsNodeSetting } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-node-setting"
    );

    const markup = renderToStaticMarkup(
      <CmsNodeSetting
        nodeId="cmsInput-node"
        data={
          {
            title: "從CMS輸入",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
            cmsPostSlugs: "",
            sourceFields: {
              title: true,
              category: false,
              content: true,
              tags: false,
            },
            outputFields: {
              title: "string",
              categories: "array[string]",
              content: "string",
              tags: "array[string]",
            },
            outputFormat: "json",
          } as never
        }
      />,
    );

    expect(markup).toContain("來源CMS名稱");
    expect(markup).toContain("來源CMS List");
    expect(markup).toContain("文章ID");
    expect(markup).toContain("文章slug");
    expect(markup).toContain("標題");
    expect(markup).toContain("分類");
    expect(markup).toContain("內文");
    expect(markup).toContain("標籤");
    expect(markup).not.toContain("作者");
  });
});
