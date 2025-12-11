import ModuleList from "./module-list";
import ModuleSearch from "./module-search";

const ModuleSideBar = () => {
  return (
    <div className="shadow-gray-400 shadow-sm min-w-3xs flex flex-col">
      <ModuleSearch />
      <ModuleList />
    </div>
  );
};

export default ModuleSideBar;
