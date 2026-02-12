"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { FileSpreadsheet } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export type ReportNodeData = {
  title: string;
  reportName: string;
  storageLocation: string;
  format: string;
};

export type ReportNodeType = Node<ReportNodeData, "reportRecord">;

const handleClass =
  "!h-3 !w-3 !rounded-full !border !border-[#d4d3cc] !bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.1)]";

const ReportNode = ({ data }: NodeProps<ReportNodeType>) => (
  <div className="relative min-w-60 rounded-[14px] border border-[#4a90e2] bg-white px-5 py-3 shadow-[0_0_0_4px_rgba(74,144,226,0.2)]">
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-2xl bg-module-iconBg">
        <FileSpreadsheet className="size-4 text-[#a09d92]" strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium leading-6 text-module-title">
        {data.title}
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

export default memo(ReportNode);
