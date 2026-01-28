"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ContentModulePopUpChild({
  action,
}: {
  action?: string;
}) {
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const selectTriggerStyle =
    "w-full cursor-pointer data-[placeholder]:text-gray-600 data-[state=open]:border-gray-600";
  const outputFormat = ["CSV", "JSON", "Markdown", "TXT"];
  const reportFormat = ["PDF", "DOCX"];
  const popUpFormat = action === "匯出結果" ? outputFormat : reportFormat;

  return (
    <div>
      <h4 className="title-6 text-gray-600 mb-1">內容整理設定</h4>
      <div className="body-2">
        <Label htmlFor="output-format" className={labelStyle}>
          預設輸出格式
        </Label>
        <Select>
          <SelectTrigger
            id="output-format"
            className={cn(inputBasicStyle, selectTriggerStyle)}
          >
            <SelectValue placeholder="請選擇格式" />
          </SelectTrigger>

          <SelectContent side="bottom" sideOffset={9}>
            {popUpFormat.map((format) => (
              <SelectItem
                key={format}
                value={format}
                className="cursor-pointer"
              >
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
