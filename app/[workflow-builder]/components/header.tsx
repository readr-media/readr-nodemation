"use client";
import IconAvatar from "@/public/avatar.svg";
import Image from "next/image";
import {
  SaveIcon,
  UploadIcon,
  SendIcon,
  PlayIcon,
  MoreHorizontalIcon,
  BugIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { UserInfo } from "@/components/layout/user-info";

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
        onChange={(e) => setValue(e.target.value)}
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
  return (
    <header>
      <div className="w-full bg-white/80 px-6 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center gap-x-4">
          <Button className="has-[>svg]:px-2 border-none hover:bg-gray-300">
            <ArrowLeftIcon />
          </Button>
          <InlineEditableText />
          <Badge variant="draft">草稿</Badge>
        </div>

        <div className="flex items-center gap-x-3">
          <p className="text-gray-700 body-3">未儲存變更</p>
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
          <Button className="has-[>svg]:px-2 hover:bg-gray-300">
            <MoreHorizontalIcon size={16} />
          </Button>
          <Button className="bg-green-500 text-white border-green-500 hover:bg-green-700">
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
    </header>
  );
}
