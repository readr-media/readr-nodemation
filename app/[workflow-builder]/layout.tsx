import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ModuleSideBar from "./components/module-sidebar";
import NodeSettingSidebar from "./components/node-setting-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <ModuleSideBar />
      <main>
        <SidebarTrigger triggerVariant="floating" />
        {children}
      </main>
      <NodeSettingSidebar />
    </SidebarProvider>
  );
}
