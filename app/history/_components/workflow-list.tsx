"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { formatJobStartedAt } from "@/lib/format-datetime";
import { getJobStatusConfig } from "@/lib/job-status";
import type { JobListItem } from "@/lib/jobs";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDebounceCallback, useCopyToClipboard } from "usehooks-ts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 15;

type JobsApiResponse = {
  items: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
};

function StatusBadge({ status }: { status: string }) {
  const config = getJobStatusConfig(status);

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.Icon
        size={16}
        className={status === "running" ? "animate-spin" : ""}
      />
      {config.label}
    </Badge>
  );
}

function formatSnapshotText(snapshot: unknown | null): string {
  if (snapshot === null || snapshot === undefined) {
    return "";
  }

  return typeof snapshot === "string"
    ? snapshot
    : JSON.stringify(snapshot, null, 2);
}

export default function WorkflowList({
  userId,
  timeRange,
  status,
}: {
  userId: string | null;
  timeRange: string;
  status: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();
  const [isCopyActive, setIsCopyActive] = useState(false);

  const copySnapshot = useDebounceCallback(async (snapshot: unknown | null) => {
    if (isCopyActive) return;

    const text = formatSnapshotText(snapshot);
    if (!text) {
      toast.error("沒有可複製的 JSON 內容");
      return;
    }

    try {
      await copyToClipboard(text);
      setIsCopyActive(true);
      window.setTimeout(() => {
        setIsCopyActive(false);
      }, 1000);
      toast.success("已複製到剪貼簿");
    } catch {
      toast.error("複製失敗，請稍後再試");
    }
  }, 500);

  const fetchJobs = useCallback(async () => {
    if (!userId) {
      setJobs([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeRange,
        status,
        page: String(currentPage),
        pageSize: String(PAGE_SIZE),
      });
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const result = (await response.json()) as JobsApiResponse;
      setJobs(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (fetchError) {
      console.error(fetchError);
      setJobs([]);
      setTotal(0);
      setError("載入執行紀錄失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  }, [userId, timeRange, status, currentPage]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setCurrentPage(1);
    setOpenRow(null);
  }, [timeRange, status, userId]);

  const toggleRow = (id: string) => {
    setOpenRow(openRow === id ? null : id);
  };

  const indexOfLastItem = currentPage * PAGE_SIZE;
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
  const startIndex = total === 0 ? 0 : indexOfFirstItem + 1;
  const endIndex = Math.min(indexOfLastItem, total);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="rounded-xl border border-gray-400 overflow-hidden">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[45%]" />
          <col className="w-[35%]" />
          <col className="w-[20%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-gray-300 border-b border-gray-400">
            <TableHead className="px-4 py-3 title-6 text-gray-700">
              工作流名稱
            </TableHead>
            <TableHead className="px-4 py-3 title-6 text-gray-700">
              執行時間
            </TableHead>
            <TableHead className="px-4 py-3 pr-26 title-6 text-right text-gray-700">
              狀態
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow className="bg-white border-b border-gray-400">
              <TableCell
                colSpan={3}
                className="py-15 body-1 text-center text-gray-700 h-51"
              >
                載入中...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow className="bg-white border-b border-gray-400">
              <TableCell
                colSpan={3}
                className="py-15 body-1 text-center text-gray-700 h-51"
              >
                {error}
              </TableCell>
            </TableRow>
          ) : !jobs.length ? (
            <TableRow className="bg-white border-b border-gray-400">
              <TableCell
                colSpan={3}
                className="py-15 body-1 text-center text-gray-700 h-51"
              >
                目前沒有執行紀錄
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((item) => (
              <Fragment key={item.id}>
                <TableRow className="border-b border-gray-400 bg-white">
                  <TableCell className="p-4 body-1">
                    <div className="flex min-w-0 items-center gap-x-1">
                      <Button
                        className="shrink-0 px-2 border-none"
                        onClick={() => toggleRow(item.id)}
                      >
                        {openRow === item.id ? (
                          <ChevronDownIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </Button>
                      <span className="truncate text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="p-4 body-1 text-gray-700">
                    {formatJobStartedAt(item.startedAt) ?? "—"}
                  </TableCell>

                  <TableCell className="p-4 body-1">
                    <div className="flex items-center justify-end gap-4">
                      <StatusBadge status={item.status} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-700 hover:bg-gray-300"
                          >
                            <MoreVerticalIcon size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-gray-900"
                            onClick={() =>
                              void copySnapshot(item.workflowSnapshot)
                            }
                          >
                            <DownloadIcon className="text-gray-700" size={14} />
                            匯出 JSON
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>

                {openRow === item.id && (
                  <TableRow className="border-b border-gray-400 bg-gray-300">
                    <TableCell colSpan={3} className="p-0">
                      <div className="relative p-4 h-[600px] overflow-y-auto">
                        <pre className="body-3">
                          {formatSnapshotText(item.workflowSnapshot) ||
                            "尚無 workflow snapshot 資料"}
                        </pre>
                        <Button
                          className="absolute px-2 py-0 top-4 border-green-500 right-4 text-green-700 body-3"
                          onClick={() =>
                            void copySnapshot(item.workflowSnapshot)
                          }
                        >
                          <CopyIcon className="text-green-700" />
                          複製程式碼
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center text-gray-700 bg-gray-300 px-6 py-4">
        <span className="body-2 text-gray-700">
          第 {startIndex} - {endIndex} 筆 / 共 {total} 筆
        </span>
        <div className="flex items-center gap-x-2">
          <Button
            className="text-gray-900"
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeftIcon />
            上一頁
          </Button>
          <div className="flex items-center gap-x-1">
            {Array.from({ length: totalPages }, (_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? "default" : "outline"}
                  className={
                    isActive
                      ? "bg-green-500 text-white hover:bg-green-500 hover:text-white"
                      : "text-gray-900"
                  }
                  disabled={total === 0 || isLoading}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            className="text-gray-900"
            disabled={currentPage === totalPages || total === 0 || isLoading}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一頁
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
