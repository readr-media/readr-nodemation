import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "./components/header";
import ModuleSideBar from "./components/module-sidebar";
import NodeSettingSidebar from "./components/node-setting-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <SidebarProvider defaultOpen={false}>
        <ModuleSideBar />
        <main className="flex-1 min-w-0">
          <SidebarTrigger triggerVariant="floating" />
          {children}
        </main>
        <NodeSettingSidebar />
      </SidebarProvider>
    </div>
  );
}
