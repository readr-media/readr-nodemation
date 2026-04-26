import WorkflowBuilder from "./components/workflow-builder";

type PageProps = {
  searchParams?: Promise<{
    workflowId?: string;
  }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : { workflowId: undefined };

  return (
    <div className="flex flex-1 min-h-svh">
      <WorkflowBuilder workflowId={resolvedSearchParams.workflowId ?? null} />
    </div>
  );
};

export default Page;
