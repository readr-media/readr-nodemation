"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  type ExecutionScheduleStore,
  type ScheduleSlot,
  useExecutionScheduleStore,
  WEEKDAYS,
  type Weekday,
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

const isWeekdayValue = (value: unknown): value is Weekday =>
  typeof value === "string" && WEEKDAYS.includes(value as Weekday);

const isSlotPayload = (slot: unknown): slot is ScheduleSlot => {
  if (!slot || typeof slot !== "object") return false;
  const { id, time, frequency } = slot as {
    id?: unknown;
    time?: unknown;
    frequency?: unknown;
  };

  if (typeof id !== "string" || typeof time !== "string") return false;
  if (
    frequency !== "daily" &&
    frequency !== "weekly" &&
    frequency !== "monthly" &&
    frequency !== "yearly"
  ) {
    return false;
  }

  if (frequency === "weekly") {
    const { daysOfWeek } = slot as { daysOfWeek?: unknown };
    return (
      Array.isArray(daysOfWeek) &&
      daysOfWeek.every(isWeekdayValue)
    );
  }

  if (frequency === "monthly") {
    const { dayOfMonth } = slot as { dayOfMonth?: unknown };
    return (
      typeof dayOfMonth === "number" &&
      Number.isInteger(dayOfMonth) &&
      dayOfMonth >= 1 &&
      dayOfMonth <= 31
    );
  }

  if (frequency === "yearly") {
    const { month, dayOfMonth } = slot as {
      month?: unknown;
      dayOfMonth?: unknown;
    };
    return (
      typeof month === "number" &&
      Number.isInteger(month) &&
      month >= 1 &&
      month <= 12 &&
      typeof dayOfMonth === "number" &&
      Number.isInteger(dayOfMonth) &&
      dayOfMonth >= 1 &&
      dayOfMonth <= 31
    );
  }

  return true;
};

const isSchedulePayload = (
  value: unknown,
): value is ExportPayload["schedule"] => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    enabled?: unknown;
    frequency?: unknown;
    slots?: unknown;
  };

  if (typeof candidate.enabled !== "boolean") return false;
  if (
    candidate.frequency !== "daily" &&
    candidate.frequency !== "weekly" &&
    candidate.frequency !== "monthly" &&
    candidate.frequency !== "yearly"
  ) {
    return false;
  }
  if (!Array.isArray(candidate.slots)) return false;

  return candidate.slots.every((slot) => isSlotPayload(slot));
};

const FlowDebugControls = () => {
  const loadSnapshot = useNodesStore((state) => state.loadSnapshot);
  const setFrequency = useExecutionScheduleStore((state) => state.setFrequency);
  const setSlots = useExecutionScheduleStore((state) => state.setSlots);
  const setEnabled = useExecutionScheduleStore((state) => state.setEnabled);
  const resetSchedule = useExecutionScheduleStore((state) => state.reset);

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
        if (isSchedulePayload(parsed?.schedule)) {
          setFrequency(parsed.schedule.frequency);
          setSlots(parsed.schedule.slots);
          setEnabled(parsed.schedule.enabled);
        } else {
          resetSchedule();
        }
        window.alert("匯入成功 (測試用)");
      } else {
        window.alert("JSON 格式不正確");
      }
    } catch (error) {
      console.error(error);
      window.alert("解析 JSON 時發生錯誤");
    }
  }, [loadSnapshot, resetSchedule, setEnabled, setFrequency, setSlots]);

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
