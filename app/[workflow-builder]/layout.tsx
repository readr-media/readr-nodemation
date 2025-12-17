import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ModuleSideBar from "./components/module-sidebar";
import NodeSettingSidebar from "./components/node-setting-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false} className="bg-[#F8F7F3]">
      <ModuleSideBar />
      <main className="flex min-h-svh flex-1 flex-col">
        <SidebarTrigger triggerVariant="floating" className="ml-auto" />
        {children}
      </main>
      <NodeSettingSidebar />
    </SidebarProvider>
  );
}
