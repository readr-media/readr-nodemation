"use client";

import {
  ArrowLeftIcon,
  BugIcon,
  Clock3Icon,
  MoreHorizontalIcon,
  PlayIcon,
  SaveIcon,
  SendIcon,
  UploadIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserInfo } from "@/components/layout/user-info";
import ScheduleDialog from "./schedule-dialog";

function InlineEditableText() {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("文章自動分類與標記");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className={`transition-all w-36 body-1 px-2 py-1 ${
          isEditing
            ? "border-gray-600 w-[200px]"
            : "shadow-none border-none hover:bg-gray-300 cursor-pointer"
        }`}
      />
    </div>
  );
}

export default function Header() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  return (
    <header>
      <div className="flex h-16 w-full items-center justify-between border-b border-b-[#e8e7e2/80] bg-white/80 px-6 text-base font-normal">
        <div className="flex items-center gap-x-4">
          <Button className="has-[>svg]:px-2 border-none hover:bg-gray-300">
            <ArrowLeftIcon />
          </Button>
          <InlineEditableText />
          <Badge variant="draft">草稿</Badge>
        </div>

        <div className="flex items-center gap-x-3">
          <p className="body-3 text-gray-700">未儲存變更</p>
          <Button className="border-gray-100 text-gray-600">
            <BugIcon />
            測試節點
          </Button>
          <Button className="hover:bg-gray-300">
            <SaveIcon />
            儲存
          </Button>
          <Button className="hover:bg-gray-300">
            <UploadIcon />
            匯出
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="has-[>svg]:px-2 hover:bg-gray-300">
                <MoreHorizontalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border border-gray-400 bg-white p-1 shadow-2"
            >
              <DropdownMenuItem
                className="body-2 flex items-center gap-2 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-300 focus:bg-gray-300"
                onSelect={() => {
                  setIsScheduleDialogOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-gray-300 text-gray-700">
                  <Clock3Icon className="size-4" />
                </div>
                設定執行時間
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="border-green-500 bg-green-500 text-white hover:bg-green-700">
            <SendIcon />
            發布
          </Button>
          <Button className="border-green-500 text-green-700 hover:bg-green-100">
            <PlayIcon />
            執行
          </Button>
          <UserInfo />
        </div>
      </div>
      <ScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      />
    </header>
  );
}
