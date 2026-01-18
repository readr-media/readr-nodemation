import { ArrowLeftIcon } from "lucide-react";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";
import NewModulePopUp from "./new-module-pop-up";

export default function Header() {
  return (
    <header>
      <div className="flex justify-between items-center h-16 px-6 bg-white border-b border-gray-400">
        <div className="flex items-center gap-x-2">
          <Button className="border-none has-[>svg]:px-2 hover:bg-gray-300">
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
