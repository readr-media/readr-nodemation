"use client";

import { useReactFlow } from "@xyflow/react";
import { Expand, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconClass = "size-4 stroke-[1.5] text-module-heading";
const baseButtonClass =
  "size-9 rounded-lg border border-module-border bg-white shadow-[0px_8px_10px_-3px_rgba(0,0,0,0.05),0px_2px_4px_-4px_rgba(0,0,0,0.05)] text-module-heading transition-colors hover:bg-white focus-visible:ring-ring/40 focus-visible:ring-4 focus-visible:border-ring";

const WorkFlowControls = () => {
  const reactFlow = useReactFlow();

  const actions = useMemo(
    () => [
      {
        label: "放大",
        icon: ZoomIn,
        handler: () => reactFlow.zoomIn(),
      },
      {
        label: "縮小",
        icon: ZoomOut,
        handler: () => {
          reactFlow.zoomOut();
        },
      },
      {
        label: "重設視角",
        icon: Expand,
        handler: () => reactFlow.fitView({ padding: 0.2 }),
      },
    ],
    [reactFlow],
  );

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          type="button"
          size="icon"
          variant="ghost"
          aria-label={action.label}
          className={cn(baseButtonClass)}
          onClick={action.handler}
        >
          <action.icon className={iconClass} />
        </Button>
      ))}
    </div>
  );
};

export default WorkFlowControls;
