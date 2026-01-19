"use client";

import { Save, Settings, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ModuleSettingPopUpLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const DialogContentStyle =
    "max-w-[512px] border border-gray-400 rounded-xl p-6 bg-gray-200 gap-y-5 [&_[data-slot=dialog-close]:hover]:bg-gray-400 [&_[data-slot=dialog-close]:hover]:ring-0 [&_[data-slot=dialog-close]:hover]:ring-offset-0 [&_[data-slot=dialog-close]]:cursor-pointer [&_[data-slot=dialog-close]]:p-2 [&_[data-slot=dialog-close]]:rounded-lg";
  const labelStyle = "title-6 text-gray-900 mb-2";
  const inputBasicStyle =
    "border border-gray-400 rounded-lg py-2 px-3 bg-white body-2 text-gray-900";
  const inputPseudoStyle =
    "placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600";
  const inputDisableStyle = "bg-gray-400 border-gray-500";

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="border-none has-[>svg]:px-2 hover:bg-gray-300">
            <Settings size={16} color="#6e6b5e" />
          </Button>
        </DialogTrigger>

        <DialogContent className={DialogContentStyle}>
          <DialogHeader>
            <DialogTitle className="title-4 text-gray-900">
              編輯模組設定
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="模組名稱" className={labelStyle}>
                模組名稱
              </Label>
              <Input
                disabled
                id="module-name"
                name="模組名稱"
                defaultValue="" // 待更新
                className={cn(inputBasicStyle, inputDisableStyle)}
              />
            </div>

            <div>
              <Label htmlFor="模組說明" className={labelStyle}>
                模組說明（選填）
              </Label>
              <Input
                id="module-description"
                name="模組說明"
                placeholder="請輸入內容"
                defaultValue="" // 待更新
                className={cn(inputBasicStyle, inputPseudoStyle)}
              />
            </div>
          </div>

          <Separator className="text-module-border" />

          {children}

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
