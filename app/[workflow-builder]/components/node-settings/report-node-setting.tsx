"use client";

import type { ReportNodeData } from "@/components/flow/nodes/report-node";
import { Input } from "@/components/ui/input";
import { useNodesStore } from "@/stores/flow-editor/nodes-store";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";
const helperClass = "text-xs text-module-muted";

const storageOptions = [
  { value: "mcp_task_log_system", label: "MCP 任務紀錄系統" },
  { value: "internal_report_database", label: "內部報表資料庫" },
];
const formatOptions = ["JSON", "純文字（.txt）"];

const selectClass =
  "h-10 w-full rounded-lg border border-module-border bg-white px-3 text-sm text-module-title shadow-[0_1px_3px_rgba(0,0,0,0.05)] focus-visible:border-blue-400 focus-visible:ring-0";

const ReportNodeSetting = ({
  nodeId,
  data,
}: {
  nodeId: string;
  data: ReportNodeData;
}) => {
  const updateReportNodeData = useNodesStore(
    (state) => state.updateReportNodeData,
  );

  const handleDataChange = (payload: Partial<ReportNodeData>) => {
    updateReportNodeData(nodeId, payload);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-medium text-module-title">
            產出報告紀錄 設定
          </p>
        </div>

        <section className="space-y-2">
          <p className={labelClass}>報告名稱</p>
          <Input
            value={data.reportName}
            placeholder="例：Tagging 測試報告"
            className="h-9 rounded-[10px] border-module-border bg-white text-sm text-module-title"
            onChange={(event) =>
              handleDataChange({ reportName: event.target.value })
            }
          />
          <p className={helperClass}>可手動命名，或預設使用 workflow 名稱</p>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>儲存位置</p>
          <select
            value={data.storageLocation}
            onChange={(event) =>
              handleDataChange({ storageLocation: event.target.value })
            }
            className={selectClass}
          >
            {storageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-2">
          <p className={labelClass}>報告格式</p>
          <select
            value={data.format}
            onChange={(event) =>
              handleDataChange({ format: event.target.value })
            }
            className={selectClass}
          >
            {formatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>
      </div>
    </div>
  );
};

export default ReportNodeSetting;
