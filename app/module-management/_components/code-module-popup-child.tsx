"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom_select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CodeModulePopUpChild() {
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const selectTriggerStyle =
    "w-full cursor-pointer data-[placeholder]:text-gray-600 data-[state=open]:border-gray-600";
  const languages = ["JavaScript", "TypeScript", "Python"];

  return (
    <div>
      <h4 className="title-6 text-gray-600 mb-1">程式碼設定</h4>
      <div className="body-2">
        <Label htmlFor="模組類型" className={labelStyle}>
          模組類型
        </Label>
        <Select>
          <SelectTrigger className={cn(inputBasicStyle, selectTriggerStyle)}>
            <SelectValue placeholder="請選擇模組類型" />
          </SelectTrigger>

          <SelectContent side="bottom" sideOffset={9}>
            {languages.map((language) => (
              <SelectItem
                key={language}
                value={language}
                className="cursor-pointer"
              >
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
