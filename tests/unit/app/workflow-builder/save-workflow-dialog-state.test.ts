import { describe, expect, it } from "vitest";

import {
  getInitialSaveMode,
  getSaveModeForDialogOpenState,
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

  it("resets save mode to the workflow default when the dialog opens", () => {
    expect(
      getSaveModeForDialogOpenState({
        workflowId: "workflow-123",
        isOpen: true,
        currentSaveMode: "save-as-new",
      }),
    ).toBe("update");

    expect(
      getSaveModeForDialogOpenState({
        workflowId: null,
        isOpen: true,
        currentSaveMode: "update",
      }),
    ).toBe("save-as-new");
  });

  it("preserves the current save mode while the dialog is closed", () => {
    expect(
      getSaveModeForDialogOpenState({
        workflowId: "workflow-123",
        isOpen: false,
        currentSaveMode: "save-as-new",
      }),
    ).toBe("save-as-new");
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
