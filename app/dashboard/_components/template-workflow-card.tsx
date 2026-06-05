import { TagsIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WORKFLOW_STATUS_LABELS, WorkflowStatus } from "@/lib/workflow-status";

type CardProps = {
  id: number;
  name: string;
  description: string;
  status: WorkflowStatus;
};

export default function TemplateWorkflowCard({
  id,
  name,
  description,
  status,
}: CardProps) {
  return (
    <Link href={`/workflow-builder?templateId=${id}`} className="block w-full">
      <Card className="relative w-full min-w-0 rounded-xl border-module-border bg-white p-4 pt-5 hover:shadow-2">
        <div className="absolute top-0 left-5 w-12 h-1 bg-blue-500 rounded-b-md opacity-100" />
        <CardContent className="p-0">
          <div className="flex items-center gap-3">
            <TagsIcon size={20} className="text-blue-500" />
            <h3 className="title-5 text-gray-900">{name}</h3>
          </div>
          <div className="body-2 text-gray-800 flex flex-col gap-y-2 mt-4">
            <div className="flex items-center justify-between">
              <p>{description}</p>
              <Badge variant={status}>{WORKFLOW_STATUS_LABELS[status]}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
