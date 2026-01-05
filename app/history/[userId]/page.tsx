import WorkflowSearchBar from "../_components/workflow-search-bar";
import WorkflowList from "../_components/workflow-list";

export default function Page() {
  return (
    <main className="px-30 py-10 flex flex-col gap-y-6">
      <WorkflowSearchBar />
      <WorkflowList />
    </main>
  );
}
