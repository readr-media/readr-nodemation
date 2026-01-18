"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom_select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewModulePopUp() {
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const inputPseudoStyle =
    "placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600";
  const selectTriggerStyle =
    "w-full cursor-pointer data-[placeholder]:text-gray-600 data-[state=open]:border-gray-600";

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>

        <DialogContent className="max-w-[512px] border border-gray-400 rounded-xl p-6 bg-gray-200 gap-y-5 [&_[data-slot=dialog-close]:hover]:bg-gray-400 [&_[data-slot=dialog-close]:hover]:ring-0 [&_[data-slot=dialog-close]:hover]:ring-offset-0 [&_[data-slot=dialog-close]]:cursor-pointer [&_[data-slot=dialog-close]]:p-2 [&_[data-slot=dialog-close]]:rounded-lg">
          <DialogHeader>
            <DialogTitle className="title-4 text-gray-900">
              新增模組
            </DialogTitle>
          </DialogHeader>

          <div>
            <Label htmlFor="模組名稱" className={labelStyle}>
              模組名稱
            </Label>
            <Input
              id="module-name"
              name="模組名稱"
              placeholder="請輸入名稱"
              className={cn(inputBasicStyle, inputPseudoStyle)}
            />
          </div>

          <div className="body-2">
            <Label htmlFor="模組類型" className={labelStyle}>
              模組類型
            </Label>
            <Select>
              <SelectTrigger
                className={cn(inputBasicStyle, selectTriggerStyle)}
              >
                <SelectValue placeholder="請選擇模組類型" />
              </SelectTrigger>

              <SelectContent side="bottom" sideOffset={9}>
                <SelectItem value="ai" className="cursor-pointer">
                  AI 模組
                </SelectItem>
                <SelectItem value="code" className="cursor-pointer">
                  程式碼模組
                </SelectItem>
                <SelectItem value="cms" className="cursor-pointer">
                  CMS 模組
                </SelectItem>
                <SelectItem value="content" className="cursor-pointer">
                  內容整理模組
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="模組說明" className={labelStyle}>
              模組說明（選填）
            </Label>
            <Input
              id="module-description"
              name="模組說明"
              placeholder="請輸入內容"
              defaultValue=""
              className={cn(inputBasicStyle, inputPseudoStyle)}
            />
          </div>

          <DialogFooter className="flex gap-x-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-3 border-gray-400 bg-white text-gray-900 hover:bg-gray-400"
              >
                <X size={16} />
                <span>取消</span>
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="flex-1 px-3 border-gray-400 text-white bg-green-500 hover:bg-green-700"
            >
              <Save size={16} />
              <span>儲存</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
