"use client";

import type { ReactNode } from "react";
import WorkflowCardSkeleton from "./workflow-card-skeleton";
import { useWorkflowCreating } from "./workflow-creating-context";

type UserWorkflowGridProps = {
  children: ReactNode;
};

export default function UserWorkflowGrid({ children }: UserWorkflowGridProps) {
  const { isCreating } = useWorkflowCreating();

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {isCreating ? <WorkflowCardSkeleton /> : null}
      {children}
    </div>
  );
}
