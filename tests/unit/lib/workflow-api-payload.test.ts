import { describe, expect, it } from "vitest";
import {
  buildWorkflowCreateData,
  buildWorkflowUpdateData,
} from "@/lib/workflow-api-payload";

describe("workflow-api-payload timestamp handling", () => {
  it("fills created_at and updated_at on workflow creation", () => {
    const result = buildWorkflowCreateData({
      name: "新工作流",
      nodes: [],
      edges: [],
      status: "draft",
    });

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it("preserves provided timestamps on workflow creation", () => {
    const createdAt = "2026-06-01T01:02:03.000Z";
    const updatedAt = "2026-06-02T04:05:06.000Z";

    const result = buildWorkflowCreateData({
      name: "有時間戳的工作流",
      nodes: [],
      edges: [],
      status: "draft",
      created_at: createdAt,
      updated_at: updatedAt,
    });

    expect(result.created_at).toEqual(new Date(createdAt));
    expect(result.updated_at).toEqual(new Date(updatedAt));
  });

  it("always refreshes updated_at when building update payloads", () => {
    const putResult = buildWorkflowUpdateData(
      {
        name: "更新工作流",
        nodes: [],
        edges: [],
        status: "published",
      },
      "put",
    );
    const patchResult = buildWorkflowUpdateData(
      {
        name: "只更新名稱",
      },
      "patch",
    );

    expect(putResult.updated_at).toBeInstanceOf(Date);
    expect(patchResult.updated_at).toBeInstanceOf(Date);
  });
});
