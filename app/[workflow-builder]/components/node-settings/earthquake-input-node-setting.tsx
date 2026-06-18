"use client";

import type { EarthquakeInputNodeData } from "@/components/flow/nodes/earthquake-input-node";
import { Input } from "@/components/ui/input";
import {
  EARTHQUAKE_DATA_SOURCE,
  EARTHQUAKE_TRIGGER_CONDITION,
  EARTHQUAKE_UPDATE_METHOD,
} from "@/lib/earthquake-workflow";

const labelClass =
  "text-sm font-medium leading-6 text-module-title tracking-tight";

const readOnlyInputClass =
  "h-9 rounded-[10px] border-module-border bg-gray-400 text-sm text-module-title";

const EarthquakeInputNodeSetting = ({
  data: _data,
}: {
  nodeId: string;
  data: EarthquakeInputNodeData;
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="space-y-6">
        <section className="space-y-2">
          <p className={labelClass}>資料來源</p>
          <Input
            value={EARTHQUAKE_DATA_SOURCE}
            disabled
            className={readOnlyInputClass}
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>觸發條件</p>
          <Input
            value={EARTHQUAKE_TRIGGER_CONDITION}
            disabled
            className={readOnlyInputClass}
          />
        </section>

        <section className="space-y-2">
          <p className={labelClass}>更新方式</p>
          <Input
            value={EARTHQUAKE_UPDATE_METHOD}
            disabled
            className={readOnlyInputClass}
          />
        </section>
      </div>
    </div>
  );
};

export default EarthquakeInputNodeSetting;
