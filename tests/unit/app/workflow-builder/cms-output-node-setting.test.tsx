import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const updateCmsOutputNodeData = vi.fn();

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

const mockStoreState = {
  updateCmsOutputNodeData,
};

describe("cms output node setting", () => {
  it("renders the approved cmsOutput settings UI", async () => {
    const { default: CmsOutputNodeSetting } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const markup = renderToStaticMarkup(
      <CmsOutputNodeSetting
        nodeId="cmsOutput-node"
        data={
          {
            title: "輸出文字到CMS",
            cmsConfigId: "",
            cmsName: "Readr CMS",
            cmsList: "Posts",
            cmsPostIds: "",
            cmsPostSlugs: "",
            mappings: [],
            mode: "overwrite",
            postStatus: "draft",
          } as never
        }
      />,
    );

    expect(markup).toContain("輸出文字到 CMS 設定");
    expect(markup).toContain('value="Readr CMS"');
    expect(markup).toContain(">Posts<");
    expect(markup).toContain("disabled");
    expect(markup).toContain("回寫欄位");
    expect(markup).toContain("標題");
    expect(markup).toContain("建議標題");
    expect(markup).toContain("內文");
    expect(markup).toContain("重點摘要");
    expect(markup).toContain("分類");
    expect(markup).toContain("標籤");
    expect(markup).toContain("建議投票選項");
    expect(markup).toContain("CMS 狀態");
    expect(markup).toContain("Draft（草稿）");
    expect(markup).toContain("Published（發布）");
    expect(markup).not.toContain("文章 ID 或 slug");
    expect(markup).not.toContain("欄位對應");
  });

  it("checking categories creates the ai.categories mapping", async () => {
    const { toggleCmsOutputFieldMapping } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const mappings = toggleCmsOutputFieldMapping([], "categories", true);

    expect(mappings).toMatchObject([
      {
        id: expect.any(String),
        sourceField: "{{ ai.categories }}",
        targetField: "categories",
      },
    ]);
  });

  it("checking tags creates the ai.tags mapping", async () => {
    const { toggleCmsOutputFieldMapping } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const mappings = toggleCmsOutputFieldMapping([], "tags", true);

    expect(mappings).toMatchObject([
      {
        id: expect.any(String),
        sourceField: "{{ ai.tags }}",
        targetField: "tags",
      },
    ]);
  });

  it("unchecking a selected field removes its mapping", async () => {
    const { toggleCmsOutputFieldMapping } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const mappings = toggleCmsOutputFieldMapping(
      [
        {
          id: "mapping-1",
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
        {
          id: "mapping-2",
          sourceField: "{{ ai.tags }}",
          targetField: "tags",
        },
      ],
      "categories",
      false,
    );

    expect(mappings).toEqual([
      {
        id: "mapping-2",
        sourceField: "{{ ai.tags }}",
        targetField: "tags",
      },
    ]);
  });

  it("disabled fields do not create mappings", async () => {
    const { toggleCmsOutputFieldMapping } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const mappings = toggleCmsOutputFieldMapping([], "title", true);

    expect(mappings).toEqual([]);
  });
});
