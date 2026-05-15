import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ModuleSideBar from "./components/module-sidebar";
import NodeSettingSidebar from "./components/node-setting-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-0 flex-col overflow-hidden">
      <SidebarProvider defaultOpen={false} className="h-full min-h-0">
        <ModuleSideBar />
        <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
          <SidebarTrigger triggerVariant="floating" />
          {children}
        </main>
        <NodeSettingSidebar />
      </SidebarProvider>
    </div>
  );
}
