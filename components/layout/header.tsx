"use client";

import { ClockIcon, DownloadIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { UserInfo } from "@/components/layout/user-info";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useUser } from "@/providers/user-provider";
import IconLogo from "@/public/logo.svg";
import HistoryHeader from "./header-history";
import ModuleManagementHeader from "./header-module-management";
import WorkflowBuilderHeader from "./header-workflow-builder";

type ImportPayload = {
  name?: unknown;
  description?: unknown;
  nodes?: unknown;
  edges?: unknown;
};

function DashboardHeader() {
  const router = useRouter();
  const { activeUserId, isLoading: isLoadingActiveUser } = useUser();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importRawJson, setImportRawJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImportWorkflow = async () => {
    if (isImporting) return;

    if (!activeUserId) {
      toast.error("請先選擇帳號後再匯入工作流");
      return;
    }

    if (!importRawJson.trim()) {
      toast.error("請貼上工作流 JSON");
      return;
    }

    let parsed: ImportPayload;
    try {
      parsed = JSON.parse(importRawJson) as ImportPayload;
    } catch (error) {
      console.error(error);
      toast.error("JSON 格式不正確，請確認後再試");
      return;
    }

    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      toast.error("匯入內容缺少 nodes / edges 陣列");
      return;
    }

    const importedName =
      typeof parsed.name === "string" && parsed.name.trim()
        ? `${parsed.name.trim()}（已匯入）`
        : "匯入工作流（已匯入）";
    const importedDescription =
      typeof parsed.description === "string"
        ? parsed.description
        : "由匯入工作流建立";

    setIsImporting(true);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: importedName,
          description: importedDescription,
          nodes: parsed.nodes,
          edges: parsed.edges,
          status: "draft",
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "匯入失敗");
      }

      setImportRawJson("");
      setIsImportDialogOpen(false);
      router.refresh();
      toast.success("匯入成功，已建立新工作流");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "匯入失敗，請稍後再試",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <header>
      <div className="bg-white/80 px-15 font-normal text-base flex items-center border-b-[#e8e7e2/80] border-b justify-between h-16">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="flex gap-x-4 items-center shrink-0"
          >
            <Image src={IconLogo} width={36} height={36} alt="go to homepage" />
            <span className="text-gray-900 body-1">AI 新聞工作台</span>
          </Link>
        </div>

        <div className="flex items-center gap-x-3">
          {!activeUserId || isLoadingActiveUser ? (
            <Button disabled>
              <ClockIcon />
              查看紀錄
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/history/${activeUserId}`}>
                <ClockIcon />
                查看紀錄
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/module-management">
              <SparklesIcon />
              查看模組
            </Link>
          </Button>
          <Button
            disabled={!activeUserId || isLoadingActiveUser}
            onClick={() => setIsImportDialogOpen(true)}
          >
            <DownloadIcon />
            匯入工作流
          </Button>
          <UserInfo />
        </div>
      </div>

      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open);
          if (!open) {
            setImportRawJson("");
          }
        }}
      >
        <DialogContent className="max-w-[640px] rounded-2xl border border-gray-400 bg-white p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="title-4 text-gray-900">
              匯入工作流
            </DialogTitle>
            <DialogDescription className="body-2 text-gray-700">
              貼上先前匯出的 JSON。匯入後會建立一筆草稿工作流。
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={importRawJson}
            onChange={(event) => setImportRawJson(event.target.value)}
            className="min-h-56 w-full rounded-lg border border-gray-400 px-3 py-2 body-2 text-gray-900 focus-visible:border-gray-600 focus-visible:outline-none"
            placeholder="請貼上包含 nodes 與 edges 的 JSON"
          />
          <DialogFooter className="flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-gray-400 text-gray-900 hover:bg-gray-300"
              disabled={isImporting}
              onClick={() => setIsImportDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="bg-green-500 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600"
              disabled={isImporting || !activeUserId}
              onClick={() => void handleImportWorkflow()}
            >
              {isImporting ? "匯入中..." : "匯入"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default function HeaderSwitcher() {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname.startsWith("/workflow-builder"))
      return <WorkflowBuilderHeader />;

    if (pathname.startsWith("/module-management"))
      return <ModuleManagementHeader />;

    if (pathname.startsWith("/history")) return <HistoryHeader />;

    if (pathname === "/dashboard") return <DashboardHeader />;

    return null;
  }, [pathname]);
}
