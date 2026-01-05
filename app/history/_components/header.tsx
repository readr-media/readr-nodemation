import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
} from "lucide-react";
import { UserInfo } from "@/components/layout/user-info";

export default function Header() {
  return (
    <header>
      <div className="bg-white/80 px-6 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center gap-x-4">
          <Button className="p-2 border-none">
            <ArrowLeftIcon size={16} />
          </Button>
          <h2>執行紀錄</h2>
        </div>
        <UserInfo />
      </div>
    </header>
  );
}
