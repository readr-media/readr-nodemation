import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header>
      <div className="flex justify-between items-center h-16 px-6 bg-white border-b border-b-border-b-gray-400">
        <div className="flex items-center gap-x-2">
          <Button className="border-none has-[>svg]:px-2 hover:bg-gray-300">
            <ArrowLeftIcon size={16} />
          </Button>
          <h2 className="body-1 text-gray-900 px-2">模組管理</h2>
        </div>
        <div className="flex items-center gap-x-3 px-3">
          <Button className="text-sm/[1.5] bg-green-500 text-white hover:bg-green-700">
            <PlusIcon size={16} />
            新增模組
          </Button>
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
