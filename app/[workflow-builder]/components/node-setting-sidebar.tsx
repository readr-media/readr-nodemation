import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

const NodeSettingSidebar = () => (
  <Sidebar side="right">
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
);

export default NodeSettingSidebar;
