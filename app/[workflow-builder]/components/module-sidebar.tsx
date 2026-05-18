import ModuleList from "./module-list";
import ModuleSearch from "./module-search";

const ModuleSideBar = () => {
  return (
    <div className="shadow-gray-400 shadow-sm min-w-3xs flex h-full min-h-0 flex-col overflow-hidden">
      <ModuleSearch />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ModuleList />
      </div>
    </div>
  );
};

export default ModuleSideBar;
