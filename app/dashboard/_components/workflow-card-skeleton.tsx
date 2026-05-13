import { DownloadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowCardSkeleton() {
  return (
    <Card className="relative w-full min-w-0 rounded-xl border-module-border bg-white p-4 pt-5">
      <div className="absolute top-0 left-5 w-12 h-1 bg-green-500 rounded-b-md opacity-100" />
      <CardContent className="p-0 h-full flex flex-col justify-around">
        <div className="flex items-center gap-3">
          <DownloadIcon size={20} className="text-gray-400 animate-pulse" />
          <p className="body-2 text-gray-700">正在匯入工作流...</p>
        </div>
        <div className="mt-5 flex gap-x-2">
          <Skeleton className="h-4 w-4 rounded-[4px] bg-gray-200" />
          <Skeleton className="h-4 w-40 rounded-[4px] bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}
