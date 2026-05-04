"use client";

import Image from "next/image";
import Link from "next/link";
import IconLogo from "@/public/logo.svg";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";
import { ClockIcon, SparklesIcon, DownloadIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import WorkflowBuilderHeader from "./header-workflow-builder";
import ModuleManagementHeader from "./header-module-management";
import HistoryHeader from "./header-history";

export default function HeaderSwitcher() {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname.startsWith("/workflow-builder"))
      return <WorkflowBuilderHeader />;

    if (pathname.startsWith("/module-management"))
      return <ModuleManagementHeader />;

    if (pathname.startsWith("/history")) return <HistoryHeader />;

    if (pathname === "/dashboard")
      return (
        <header>
          <div className="bg-white/80 px-15 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex gap-x-4 items-center shrink-0"
              >
                <Image
                  src={IconLogo}
                  width={36}
                  height={36}
                  alt="go to homepage"
                />
                <span className="text-gray-900 body-1">AI 新聞工作台</span>
              </Link>
            </div>

            <div className="flex items-center gap-x-3">
              <Button asChild>
                <Link href="/history/1">
                  {/* TODO:  userid */}
                  <ClockIcon />
                  查看紀錄
                </Link>
              </Button>
              <Button asChild>
                <Link href="/module-management">
                  <SparklesIcon />
                  查看模組
                </Link>
              </Button>
              {/* TODO: 匯入工作流 */}
              <Button>
                <DownloadIcon />
                匯入工作流
              </Button>
              <UserInfo />
            </div>
          </div>
        </header>
      );

    return null;
  }, [pathname]);
}
