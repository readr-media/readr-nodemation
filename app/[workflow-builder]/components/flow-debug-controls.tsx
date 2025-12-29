"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const FlowDebugControls = () => {
  const loadSnapshot = useNodesStore((state) => state.loadSnapshot);

  const handleExport = useCallback(() => {
    const { nodes, edges } = useNodesStore.getState();
    const payload = JSON.stringify({ nodes, edges }, null, 2);
    try {
      void navigator.clipboard?.writeText(payload);
      window.alert("Flow JSON 已複製到剪貼簿 (測試用)");
    } catch (error) {
      console.warn("Clipboard not available", error);
      window.prompt("請手動複製 JSON", payload);
    }
  }, []);

  const handleImport = useCallback(() => {
    const raw = window.prompt("貼上先前匯出的 Flow JSON", "");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.edges)) {
        loadSnapshot({ nodes: parsed.nodes, edges: parsed.edges });
        window.alert("匯入成功 (測試用)");
      } else {
        window.alert("JSON 格式不正確");
      }
    } catch (error) {
      console.error(error);
      window.alert("解析 JSON 時發生錯誤");
    }
  }, [loadSnapshot]);

  return (
    <div className="pointer-events-auto flex gap-2 rounded-xl border border-dashed border-module-border bg-white/90 px-3 py-2 text-xs text-module-muted shadow-sm">
      <Button size="sm" variant="outline" onClick={handleExport}>
        匯出 JSON
      </Button>
      <Button size="sm" variant="outline" onClick={handleImport}>
        匯入 JSON
      </Button>
    </div>
  );
};

export default FlowDebugControls;
