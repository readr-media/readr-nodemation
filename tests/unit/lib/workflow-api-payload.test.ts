import { describe, expect, it } from "vitest";
import {
  buildWorkflowCreateData,
  buildWorkflowUpdateData,
} from "@/lib/workflow-api-payload";

describe("workflow-api-payload timestamp handling", () => {
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
