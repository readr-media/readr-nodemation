export type SaveMode = "update" | "save-as-new";

export const getInitialSaveMode = (workflowId: string | null): SaveMode =>
  workflowId ? "update" : "save-as-new";

export const shouldShowSaveModeSelector = (
  workflowId: string | null,
): boolean => Boolean(workflowId);

export const getSaveModeForDialogOpenState = ({
  workflowId,
  isOpen,
  currentSaveMode,
}: {
  workflowId: string | null;
  isOpen: boolean;
  currentSaveMode: SaveMode;
}): SaveMode => {
  if (!isOpen) {
    return currentSaveMode;
  }

  return getInitialSaveMode(workflowId);
};

export const getSaveWorkflowSubmitLabel = ({
  saveMode,
  isSaving,
}: {
  saveMode: SaveMode;
  isSaving: boolean;
}): string => {
  if (isSaving) {
    return "儲存中…";
  }

  return saveMode === "update" ? "更新原 workflow" : "另存新 workflow";
};
