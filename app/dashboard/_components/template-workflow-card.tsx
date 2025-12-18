import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagsIcon } from "lucide-react";

type Status = "published" | "draft" | "template" | "running";

type CardProps = {
  name: string;
  description: string;
  status: Status;
};

const statusMap = {
  published: "已發佈",
  draft: "草稿",
  template: "模板",
  running: "執行中",
};

export default function TemplateWorkflowCard({
  name,
  description,
  status,
}: CardProps) {
  return (
    <Card className="relative p-4 pt-5 bg-white border-module-border rounded-xl min-w-[344px] hover:shadow-2">
      <div className="absolute top-0 left-5 w-12 h-1 bg-blue-500 rounded-b-md opacity-100" />
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          <TagsIcon size={20} className="text-blue-500" />
          <h3 className="title-5 text-gray-900">{name}</h3>
        </div>
        <div className="body-2 text-gray-800 flex flex-col gap-y-2 mt-4">
          <div className="flex items-center justify-between">
            <p>{description}</p>
            <Badge variant={status}>{statusMap[status]}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
