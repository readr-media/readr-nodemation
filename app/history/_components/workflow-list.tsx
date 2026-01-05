"use client";

import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CopyIcon,
  CircleCheckIcon,
  XCircleIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 15;

const workflows = [
  {
    id: 1,
    name: "社交媒體數據分析",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: {
      mcp_version: "1.0",
      task: {
        task_id: "task_20251218_00123",
        task_name: "Auto Tag Generation",
        task_type: "tag_generation",
        status: "success",
        created_at: "2025-12-18T09:32:15Z",
        finished_at: "2025-12-18T09:32:22Z",
        duration_ms: 7000,
      },
      pipeline: {
        modules: [
          {
            module_id: "input_parser",
            module_type: "preprocess",
            config: {
              language: "zh-TW",
              strip_html: true,
            },
          },
          {
            module_id: "llm_tag_generator",
            module_type: "ai_inference",
            model: "gpt-4.1",
            config: {
              temperature: 0.3,
              max_tokens: 256,
            },
          },
          {
            module_id: "post_validator",
            module_type: "postprocess",
            config: {
              max_tags: 10,
              deduplicate: true,
            },
          },
        ],
        module_summary: "preprocess → ai_inference → postprocess",
      },
      input: {
        source: "editor_manual",
        content: {
          title: "2025 夏季新品發表會",
          body: "本次發表會介紹多款輕量化戶外裝備，主打防水與環保材質。",
        },
      },
      output: {
        result: {
          tags: ["夏季新品", "戶外裝備", "防水", "環保材質", "產品發表會"],
        },
        confidence: 0.92,
      },
      error: null,
      actions: {
        rerunnable: true,
        exportable: true,
      },
      meta: {
        triggered_by: "user_456",
        client: "web_desktop",
        retry_of: null,
      },
    },
  },
  {
    id: 2,
    name: "文章自動分類與標記",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: "詳細資料",
  },
  {
    id: 3,
    name: "市場趨勢預測",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: "詳細資料",
  },
  {
    id: 4,
    name: "社交媒體數據分析",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "failed",
    detail: "詳細資料",
  },
  {
    id: 5,
    name: "客戶滿意度調查",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: "詳細資料",
  },
  {
    id: 6,
    name: "數據安全檢查",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: "詳細資料",
  },
  {
    id: 7,
    name: "社交媒體數據分析",
    lastTime: "2025/11/26 09:15",
    nextTime: "2025/11/28 11:20",
    status: "success",
    detail: "詳細資料",
  },
];

const statusConfig = {
  success: { label: "成功", Icon: CircleCheckIcon, variant: "success" },
  failed: { label: "失敗", Icon: XCircleIcon, variant: "failed" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const config =
    statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.Icon size={16}/>
      {config.label}
    </Badge>
  );
}



export default function WorkflowList() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openRow, setOpenRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setOpenRow(openRow === id ? null : id);
  };

  const total = workflows.length;

  const indexOfLastItem = currentPage * PAGE_SIZE;
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;

  const currentWorkflows = workflows.slice(indexOfFirstItem, indexOfLastItem);

  const startIndex = total === 0 ? 0 : indexOfFirstItem + 1;
  const endIndex = Math.min(indexOfLastItem, total);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="rounded-xl border border-gray-400 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-300 border-b border-gray-400">
            <TableHead className="px-4 py-3 title-6 text-gray-700">
              工作流名稱
            </TableHead>
            <TableHead className="px-4 py-3 title-6 text-gray-700">
              上次執行時間
            </TableHead>
            <TableHead className="px-4 py-3 title-6 text-gray-700">
              下次執行時間
            </TableHead>
            <TableHead className="px-4 py-3 title-6 text-gray-700 w-30">
              狀態
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!currentWorkflows.length ? (
            <TableRow className="bg-white border-b border-gray-400">
              <TableCell
                colSpan={4}
                className="py-15 body-1 text-center text-gray-700 h-51"
              >
                目前沒有執行紀錄
              </TableCell>
            </TableRow>
          ) : (
            currentWorkflows.map((item) => (
              <Fragment key={item.id}>
                <TableRow
                  className="border-b border-gray-400 bg-white"
                >
                  <TableCell className="p-4 body-1">
                    <div className="flex items-center gap-x-1">
                      <Button
                        className="px-2 border-none"
                        onClick={() => toggleRow(item.id)}
                      >
                        {openRow === item.id ? (
                          <ChevronDownIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </Button>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="p-4 body-1 text-gray-700">
                    {item.lastTime}
                  </TableCell>

                  <TableCell className="p-4 body-1 text-gray-700">
                    {item.nextTime}
                  </TableCell>

                  <TableCell className="p-4 body-1 w-30">
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>

                {openRow === item.id && (
                  <TableRow className="border-b border-gray-400 bg-gray-300">
                    <TableCell colSpan={4} className="p-0">
                      <div className="relative p-4 min-h-150 overflow-y-auto">
                        <pre className="body-3">
                          {JSON.stringify(item.detail, null, 2)}
                        </pre>
                        <Button className="absolute px-2 py-0 top-4 border-green-500 right-4 text-green-700 body-3">
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
            className="text-gray-600"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeftIcon />
            上一頁
          </Button>
          <div className="flex items-center gap-x-1">
            <Button>{currentPage}</Button>
          </div>
          <Button
            className="text-gray-600"
            disabled={currentPage === totalPages || total === 0}
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