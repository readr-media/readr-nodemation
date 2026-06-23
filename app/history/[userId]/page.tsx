"use client";

import WorkflowSearchBar from "../_components/workflow-search-bar";
import WorkflowList from "../_components/workflow-list";
import { useUser } from "@/providers/user-provider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [timeRange, setTimeRange] = useState("all");
  const [status, setStatus] = useState("all");
  const { activeUserId } = useUser();
  const params = useParams<{ userId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!activeUserId) {
      return;
    }

    if (params.userId !== activeUserId) {
      router.replace(`/history/${activeUserId}`);
    }
  }, [activeUserId, params.userId, router]);

  return (
    <main className="px-30 py-10 flex flex-col gap-y-6">
      <WorkflowSearchBar
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        status={status}
        onStatusChange={setStatus}
      />
      <WorkflowList
        userId={activeUserId}
        timeRange={timeRange}
        status={status}
      />
    </main>
  );
}
