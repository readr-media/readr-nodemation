import { describe, expect, it } from "vitest";

import { moduleGroups } from "../../../../../app/[workflow-builder]/components/module-list-config";

describe("module list config", () => {
  it("keeps only export result in content module group", () => {
    const contentGroup = moduleGroups.find(
      (group) => group.title === "內容整理模組",
    );

    expect(contentGroup).toBeDefined();
    expect(contentGroup?.modules).toHaveLength(1);
    expect(contentGroup?.modules[0]).toMatchObject({
      title: "匯出結果",
      nodeType: "exportResult",
    });

    const nodeTypes = contentGroup?.modules.map((item) => item.nodeType);
    const titles = contentGroup?.modules.map((item) => item.title);
    expect(nodeTypes).not.toContain("reportRecord");
    expect(titles).not.toContain("產出報告紀錄");
  });
});
