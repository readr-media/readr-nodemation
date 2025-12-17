import ModuleSideBar from "./components/module-sidebar";
import NodeSettingSidebar from "./components/node-setting-sidebar";
import WorkflowBuilder from "./components/workflow-builder";

const Page = () => (
  <div className="flex flex-1 min-h-svh">
    <WorkflowBuilder />
  </div>
);

export default Page;
