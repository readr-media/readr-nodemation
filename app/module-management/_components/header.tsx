import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { UserInfo } from "@/components/layout/user-info";

export default function Header() {
  return (
    <header>
      <div className="flex justify-between items-center h-16 px-6 bg-gray-100 border-b border-b-[#e8e7e2]">
        <div className="flex items-center gap-x-2">
          <Button className="border-none has-[>svg]:px-2 gray-800 bg-gray-100 hover:bg-white">
            <ArrowLeftIcon />
          </Button>
          <h2 className="body-1 text-gray-900 px-2">模組管理</h2>
        </div>
        <div className="flex items-center gap-x-3 px-3">
          <Button className="text-sm/[1.5] bg-green-500 text-gray-100">
            <PlusIcon />
            新增模組
          </Button>
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
