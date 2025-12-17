import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  ClockIcon,
  PlayIcon,
  MoreVerticalIcon,
} from "lucide-react";

type Status = "published" | "draft" | "template" | "running";

type CardProps = {
  name: string;
  description: string;
  time: string;
  status: Status;
};

const statusMap = {
  published: "已發佈",
  draft: "草稿",
  template: "模板",
  running: "執行中",
};

export default function UserWorkflowCard({
  name,
  description,
  time,
  status,
}: CardProps) {
  return (
    <Card className="relative p-4 pt-5 bg-white border-module-border rounded-xl min-w-[344px] hover:shadow-2">
      <div className="absolute top-0 left-5 w-12 h-1 bg-green-500 rounded-b-md opacity-100" />
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon size={20} className="text-green-500" />
            <h3 className="title-5 text-gray-900">{name}</h3>
          </div>
          {/* TODO: 點擊後的 modal */}
          <div className="inline-flex items-center justify-center p-2   hover:bg-gray-300 rounded-lg">
            <MoreVerticalIcon size={16} />
          </div>
        </div>
        <div className="body-2 text-gray-800 flex flex-col gap-y-2 mt-5">
          <div className="flex gap-x-2 items-center">
            <ClockIcon size={16} />
            <p>{time}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-x-2 items-center">
              <PlayIcon size={16} />
              <p>{description}</p>
            </div>
            <Badge variant={status}>{statusMap[status]}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
