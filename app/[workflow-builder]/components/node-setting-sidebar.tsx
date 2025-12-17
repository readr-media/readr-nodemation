import { Cog } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const EmptyState = () => (
  <div className="flex w-28 flex-col items-center gap-4 text-center">
    <div className="flex size-16 items-center justify-center rounded-2xl bg-module-iconBg">
      <Cog className="size-8 text-gray-600" strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-base font-medium leading-6 text-gray-700">
        請選擇一個節點
      </p>
      <p className="text-sm leading-[21px] text-gray-600">以開始編輯內容</p>
    </div>
  </div>
);

const NodeSettingSidebar = () => (
  <Sidebar side="right" className="border-l border-module-border bg-white">
    <SidebarHeader className="node-settings-header">
      <h2 className="text-lg font-medium text-module-title">節點設定</h2>
      <SidebarTrigger
        aria-label="Close node settings"
        className="cursor-pointer text-gray-600 hover:text-gray-700"
      />
    </SidebarHeader>
    <SidebarContent className="flex flex-1 px-8 py-0">
      <div className="flex flex-1 items-center justify-center">
        <EmptyState />
      </div>
    </SidebarContent>
    <SidebarFooter className="border-t border-module-border px-4 py-3" />
  </Sidebar>
);

export default NodeSettingSidebar;
