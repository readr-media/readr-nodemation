import { describe, expect, it } from "vitest";

import {
  getInitialSaveMode,
  getSaveWorkflowSubmitLabel,
  shouldShowSaveModeSelector,
} from "@/app/[workflow-builder]/components/save-workflow-dialog-state";

describe("save workflow dialog state", () => {
  it("defaults to update mode when editing an existing workflow", () => {
    expect(getInitialSaveMode("workflow-123")).toBe("update");
    expect(shouldShowSaveModeSelector("workflow-123")).toBe(true);
    expect(
      getSaveWorkflowSubmitLabel({
        saveMode: "update",
        isSaving: false,
      }),
    ).toBe("更新原 workflow");
  });

  it("defaults to save as new when creating a brand-new workflow", () => {
    expect(getInitialSaveMode(null)).toBe("save-as-new");
    expect(shouldShowSaveModeSelector(null)).toBe(false);
    expect(
      getSaveWorkflowSubmitLabel({
        saveMode: "save-as-new",
        isSaving: false,
      }),
    ).toBe("另存新 workflow");
  });

  it("shows a saving label while a request is in flight", () => {
    expect(
      getSaveWorkflowSubmitLabel({
        saveMode: "update",
        isSaving: true,
      }),
    ).toBe("儲存中…");
  });
});
