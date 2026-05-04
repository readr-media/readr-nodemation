"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { UserInfo } from "@/components/layout/user-info";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function HistoryHeader() {
  const router = useRouter();
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <header>
      <div className="bg-white/80 px-6 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center gap-x-4">
          <Button className="p-2 border-none" onClick={handleBack}>
            <ArrowLeftIcon size={16} />
          </Button>
          <h2>執行紀錄</h2>
        </div>
        <UserInfo />
      </div>
    </header>
  );
}
