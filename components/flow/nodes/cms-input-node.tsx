"use client";

import { memo } from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Database } from "lucide-react";

import { cn } from "@/lib/utils";

export type CmsInputNodeData = {
  title: string;
  source: string;
  entryId: string;
  fields: {
    title: boolean;
    content: boolean;
    author: boolean;
    category: boolean;
  };
  outputFormat: string;
};
export type CmsInputNodeType = Node<CmsInputNodeData, "cmsInput">;

const handleClass =
  "!h-3 !w-3 !rounded-full !border !border-[#d4d3cc] !bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.1)]";

const CmsInputNode = ({ data }: NodeProps<CmsInputNodeType>) => {
  const title = data.title;

  return (
    <div className="relative min-w-60 rounded-[14px] border border-[#0f9b81] bg-white px-5 py-3 shadow-[0_0_0_4px_rgba(0,150,125,0.2)]">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[#f5f5f1]">
          <Database className="size-4 text-[#a09d92]" strokeWidth={1.5} />
        </div>
        <p className="text-base font-medium leading-6 text-module-title">
          {title}
        </p>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className={cn(handleClass, "-left-3 top-1/2 -translate-y-1/2")}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(handleClass, "-right-3 top-1/2 -translate-y-1/2")}
      />
    </div>
  );
};

export default memo(CmsInputNode);
