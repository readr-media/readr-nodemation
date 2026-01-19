"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom_select";

export default function ContentModulePopUpChild() {
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const selectTriggerStyle =
    "w-full cursor-pointer data-[placeholder]:text-gray-600 data-[state=open]:border-gray-600";
  const outputFormat = ["CSV", "JSON"];
  const reportFormat = ["PDF", "DOCX"];

  return (
    <div>
      <h4 className="title-6 text-gray-600 mb-1">內容整理設定</h4>
      <div className="body-2">
        <Label htmlFor="預設輸出格式" className={labelStyle}>
          預設輸出格式
        </Label>
        <Select>
          <SelectTrigger className={cn(inputBasicStyle, selectTriggerStyle)}>
            <SelectValue placeholder="請選擇格式" />
          </SelectTrigger>

          <SelectContent side="bottom" sideOffset={9}>
            {outputFormat.map((outputFormat) => (
              <SelectItem
                key={outputFormat}
                value={outputFormat}
                className="cursor-pointer"
              >
                {outputFormat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
