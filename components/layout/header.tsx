import Link from "next/link";
import { Button } from "../ui/button";
import IconLogo from "@/public/logo.svg";
import IconAvatar from "@/public/avatar.svg";
import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  SearchIcon,
  ClockIcon,
  SparklesIcon,
  DownloadIcon,
} from "lucide-react";

export default function Header() {
  return (
    <header>
      <div className="bg-white/80 px-15 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="flex gap-x-4 items-center shrink-0">
            <Image src={IconLogo} width={36} height={36} alt="go to homepage" />
            <span className="text-gray-900 body-1">AI 新聞工作台</span>
          </Link>

          <div className="ml-4 w-[400px]">
            <InputGroup className="h-10 rounded-lg border-module-border bg-white">
              <InputGroupInput
                className="body-2 text-module-text placeholder:text-module-placeholder"
                placeholder="搜尋工作流"
              />
              <InputGroupAddon>
                <SearchIcon className="size-4 text-module-placeholder" />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <div className="flex items-center gap-x-3">
          <Button>
            <ClockIcon />
            查看紀錄
          </Button>
          <Button>
            <SparklesIcon />
            查看模組
          </Button>
          <Button>
            <DownloadIcon />
            匯入工作流
          </Button>
          <div className="flex items-center gap-x-3 px-3 border-l border-gray-400 rounded-lg py-2">
            <Image width={32} height={32} src={IconAvatar} alt="avatar" />
            <p className="text-gray-900 body-2 whitespace-nowrap">王小明</p>
          </div>
        </div>
      </div>
    </header>
  );
}
