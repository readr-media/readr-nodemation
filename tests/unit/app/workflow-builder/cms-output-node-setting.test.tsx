import type { ReactElement, ReactNode } from "react";
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

const getTextContent = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    return getTextContent((node as ReactElement).props.children);
  }

  return "";
};

const findButtonByLabel = (
  node: ReactNode,
  label: string,
): ReactElement | null => {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findButtonByLabel(child, label);
      if (match) return match;
    }

    return null;
  }

  if (typeof node === "object" && "props" in node) {
    const element = node as ReactElement;

    if (typeof element.type === "function") {
      return findButtonByLabel(element.type(element.props), label);
    }

    if (
      element.type === "button" &&
      getTextContent(element.props.children).includes(label)
    ) {
      return element;
    }

    return findButtonByLabel(element.props.children, label);
  }

  return null;
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

  it("clicking categories updates the node data with the derived mapping", async () => {
    updateCmsOutputNodeData.mockClear();

    const { default: CmsOutputNodeSetting } = await import(
      "@/app/[workflow-builder]/components/node-settings/cms-output-node-setting"
    );

    const tree = CmsOutputNodeSetting({
      nodeId: "cmsOutput-node",
      data: {
        title: "輸出文字到CMS",
        cmsConfigId: "",
        cmsName: "Readr CMS",
        cmsList: "Posts",
        cmsPostIds: "",
        cmsPostSlugs: "",
        mappings: [],
        mode: "overwrite",
        postStatus: "draft",
      },
    });

    const categoriesButton = findButtonByLabel(tree, "分類");

    expect(categoriesButton).not.toBeNull();
    categoriesButton?.props.onClick();

    expect(updateCmsOutputNodeData).toHaveBeenCalledWith("cmsOutput-node", {
      mappings: [
        {
          id: expect.any(String),
          sourceField: "{{ ai.categories }}",
          targetField: "categories",
        },
      ],
    });
  });
});
