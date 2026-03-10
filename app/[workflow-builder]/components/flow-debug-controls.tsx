"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { isSchedulePayload } from "@/lib/schedule-import-validation";
import {
  type ExecutionScheduleStore,
  useExecutionScheduleStore,
} from "@/stores/execution-schedule-store";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

type ExportPayload = {
  nodes: unknown[];
  edges: unknown[];
  schedule: Pick<
    ExecutionScheduleStore,
    "enabled" | "frequency" | "slots" | "lastUpdated"
  >;
};

const FlowDebugControls = () => {
  const loadSnapshot = useNodesStore((state) => state.loadSnapshot);
  const setFrequency = useExecutionScheduleStore((state) => state.setFrequency);
  const setSlots = useExecutionScheduleStore((state) => state.setSlots);
  const setEnabled = useExecutionScheduleStore((state) => state.setEnabled);

  const handleExport = useCallback(async () => {
    const { nodes, edges } = useNodesStore.getState();
    const { enabled, frequency, slots, lastUpdated } =
      useExecutionScheduleStore.getState();
    const payload: ExportPayload = {
      nodes,
      edges,
      schedule: { enabled, frequency, slots, lastUpdated },
    };
    const json = JSON.stringify(payload, null, 2);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(json);
        window.alert("Flow JSON 已複製到剪貼簿 (測試用)");
        return;
      } catch (error) {
        console.warn("Clipboard write failed", error);
      }
    }

    window.prompt("請手動複製 JSON", json);
  }, []);

  const handleImport = useCallback(() => {
    const raw = window.prompt("貼上先前匯出的 Flow JSON", "");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.edges)) {
        loadSnapshot({ nodes: parsed.nodes, edges: parsed.edges });
        const hasScheduleField =
          typeof parsed === "object" && parsed !== null && "schedule" in parsed;

        if (!hasScheduleField) {
          // Backward compatibility: legacy JSON may only contain flow graph.
          window.alert("匯入成功 (測試用)");
          return;
        }

        if (isSchedulePayload(parsed?.schedule)) {
          setFrequency(parsed.schedule.frequency);
          setSlots(parsed.schedule.slots);
          setEnabled(parsed.schedule.enabled);
          window.alert("匯入成功 (測試用)");
        } else {
          window.alert("排程設定格式不正確，排程未匯入。");
        }
      } else {
        window.alert("JSON 格式不正確");
      }
    } catch (error) {
      console.error(error);
      window.alert("解析 JSON 時發生錯誤");
    }
  }, [loadSnapshot, setEnabled, setFrequency, setSlots]);

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
