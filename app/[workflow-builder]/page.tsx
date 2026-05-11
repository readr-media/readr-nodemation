import WorkflowBuilder from "./components/workflow-builder";

type PageProps = {
  searchParams?: Promise<{
    workflowId?: string;
    templateId?: string;
  }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : { workflowId: undefined, templateId: undefined };

  return (
    <div className="flex flex-1 min-h-svh">
      <WorkflowBuilder
        workflowId={resolvedSearchParams.workflowId ?? null}
        templateId={resolvedSearchParams.templateId ?? null}
      />
    </div>
  );
};

export default Page;
