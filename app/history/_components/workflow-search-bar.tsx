"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

const timeFilters = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "最近 7 天", value: "7d" },
  { label: "最近 30 天", value: "30d" },
  { label: "最近 60 天", value: "60d" },
];

const statusFilters = [
  { label: "全部", value: "all" },
  { label: "成功", value: "success" },
  { label: "失敗", value: "failed" },
];

export default function WorkflowSearchBar({
  timeRange,
  onTimeRangeChange,
  status,
  onStatusChange,
}: {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl p-6 border border-gray-400 bg-white">
      <div className="flex flex-col gap-y-4">
        <div className="w-full">
          <InputGroup className="h-10 rounded-lg border-module-border bg-white">
            <InputGroupInput
              className="body-2 text-module-text placeholder:text-module-placeholder"
              placeholder="搜尋工作流名稱..."
            />
            <InputGroupAddon>
              <SearchIcon className="size-4 text-module-placeholder" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-center gap-x-4">
          <span className="text-gray-700 body-2">時間</span>
          <div className="flex items-center gap-x-2">
            {timeFilters.map((item) => (
              <Button
                key={item.value}
                className={`px-3 h-8 ${
                  timeRange === item.value &&
                  "bg-green-500 text-white hover:bg-green-500 hover:text-white"
                }`}
                variant="outline"
                onClick={() => onTimeRangeChange(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <span className="text-gray-700 body-2">狀態</span>
          <div className="flex items-center gap-x-2">
            {statusFilters.map((item) => (
              <Button
                key={item.value}
                className={`px-3 h-8 ${
                  status === item.value &&
                  "bg-green-500 text-white hover:bg-green-500 hover:text-white"
                }`}
                variant="outline"
                onClick={() => onStatusChange(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
