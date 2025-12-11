import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NodeSettingSidebar = () => (
  <Sidebar side="right">
    <SidebarHeader className="flex justify-end">
      <SidebarTrigger aria-label="Close node settings" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
);

export default NodeSettingSidebar;
