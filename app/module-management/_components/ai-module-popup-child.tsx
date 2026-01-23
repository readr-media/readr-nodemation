"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AiModulePopUpChild() {
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const inputPseudoStyle =
    "placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600";

  return (
    <div>
      <h4 className="title-6 text-gray-600 mb-1">AI 設定</h4>
      <div className="flex flex-col gap-y-3">
        <div>
          <Label htmlFor="API 金鑰" className={labelStyle}>
            API 金鑰
          </Label>
          <Input
            id="api-key"
            name="API 金鑰"
            className={cn(inputBasicStyle, inputPseudoStyle)}
          />
        </div>

        <div>
          <Label htmlFor="逾時時間" className={labelStyle}>
            逾時時間（秒）
          </Label>
          <Input
            id="api-timeout"
            name="逾時時間"
            className={cn(inputBasicStyle, inputPseudoStyle)}
          />
        </div>
      </div>
    </div>
  );
}
