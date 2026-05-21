import { describe, expect, it } from "vitest";

import { moduleGroups } from "../../../../../app/[workflow-builder]/components/module-list-config";

describe("module list config", () => {
  it("does not include the deprecated content module group", () => {
    const contentGroup = moduleGroups.find(
      (group) => group.title === "內容整理模組",
    );

    expect(contentGroup).toBeUndefined();

    const nodeTypes = moduleGroups.flatMap((group) =>
      group.modules.map((item) => item.nodeType),
    );
    const titles = moduleGroups.flatMap((group) =>
      group.modules.map((item) => item.title),
    );

    expect(nodeTypes).not.toContain("exportResult");
    expect(titles).not.toContain("匯出結果");
    expect(nodeTypes).not.toContain("reportRecord");
    expect(titles).not.toContain("產出報告紀錄");
  });
});
