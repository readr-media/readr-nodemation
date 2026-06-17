"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { Code2 } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import { getNodeShellClassName } from "./node-shell-styles";

export type EarthquakeInputNodeData = {
  title: string;
};
export type EarthquakeInputNodeType = Node<
  EarthquakeInputNodeData,
  "earthquakeInput"
>;

const handleClass =
  "!h-3 !w-3 !rounded-full !border !border-[#d4d3cc] !bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.1)]";

const EarthquakeInputNode = ({
  data,
  selected,
}: NodeProps<EarthquakeInputNodeType>) => {
  const title = data.title;

  return (
    <div className={getNodeShellClassName(selected, "code")}>
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#f5f5f1]">
          <Code2 className="size-4 text-[#a09d92]" strokeWidth={1.5} />
        </div>
        <p className="text-base font-medium leading-6 text-module-title">
          {title}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={cn(handleClass, "-right-3 top-1/2 -translate-y-1/2")}
      />
    </div>
  );
};

export default memo(EarthquakeInputNode);
