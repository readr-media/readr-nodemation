 "use client";

import WorkflowSearchBar from "../_components/workflow-search-bar";
import WorkflowList from "../_components/workflow-list";
import { useState } from "react";

export default function Page() {
  const [timeRange, setTimeRange] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <main className="px-30 py-10 flex flex-col gap-y-6">
      <WorkflowSearchBar
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        status={status}
        onStatusChange={setStatus}
      />
      <WorkflowList timeRange={timeRange} status={status} />
    </main>
  );
}
