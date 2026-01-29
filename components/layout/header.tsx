import {
  ClockIcon,
  DownloadIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import IconLogo from "@/public/logo.svg";

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
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
