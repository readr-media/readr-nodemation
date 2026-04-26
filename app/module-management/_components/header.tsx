"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";
import NewModulePopUp from "./new-module-pop-up";
import { getSafeReturnTo } from "./return-to";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBackClick = () => {
    const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
    router.push(returnTo);
  };

  return (
    <header>
      <div className="flex justify-between items-center h-16 px-6 bg-white border-b border-gray-400">
        <div className="flex items-center gap-x-2">
          <Button
            className="border-none has-[>svg]:px-2 hover:bg-gray-300"
            onClick={handleBackClick}
            aria-label="返回首頁或上一頁"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h2 className="body-1 text-gray-900 px-2">模組管理</h2>
        </div>
        <div className="flex items-center gap-x-3 px-3">
          <NewModulePopUp />
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
