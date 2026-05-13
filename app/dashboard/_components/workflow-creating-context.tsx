"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type WorkflowCreatingContextValue = {
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
};

const WorkflowCreatingContext = createContext<WorkflowCreatingContextValue>({
  isCreating: false,
  setIsCreating: () => {},
});

export function WorkflowCreatingProvider({ children }: { children: ReactNode }) {
  const [isCreating, setIsCreating] = useState(false);
  return (
    <WorkflowCreatingContext.Provider value={{ isCreating, setIsCreating }}>
      {children}
    </WorkflowCreatingContext.Provider>
  );
}

export function useWorkflowCreating() {
  return useContext(WorkflowCreatingContext);
}
