"use client";

import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Database,
  Download,
  FileSpreadsheet,
  Share2,
  Sparkles,
} from "lucide-react";
import type { ModuleTypeData } from "@/lib/module-types";
import AiModulePopUpChild from "./ai-module-popup-child";
import CmsModulePopUpChild from "./cms-module-popup-child";
import CodeModulePopUpChild from "./code-module-popup-child";
import ContentModulePopUpChild from "./content-module-popup-child";
import ModuleUnit from "./module-unit";

export type PopUpChildProps = {
  action?: string;
};

type ModuleSectionProps = {
  moduleTypes: ModuleTypeData[];
};

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Code2,
  Database,
  Share2,
  Download,
  FileSpreadsheet,
};

const popUpChildMap = {
  ai: <AiModulePopUpChild />,
  code: <CodeModulePopUpChild />,
  cms: <CmsModulePopUpChild />,
  content: <ContentModulePopUpChild />,
};

export default function ModuleSection({ moduleTypes }: ModuleSectionProps) {
  if (moduleTypes.length === 0) {
    return (
      <section className="rounded-xl border border-gray-400 bg-white px-6 py-8">
        <p className="body-3 text-gray-600">目前沒有可用模組。</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-y-10">
      {moduleTypes.map((type) => (
        <div key={type.id}>
          <h3 className="title-4 text-balance text-gray-900 pb-4">
            {type.name}
          </h3>
          <div className="grid grid-cols-3 gap-x-5 gap-y-6">
            {type.units.map((unit) => {
              const actionIcon = iconMap[unit.iconKey] ?? Sparkles;
              const popUpChild = popUpChildMap[unit.actionCode];

              return (
                <ModuleUnit
                  key={unit.id}
                  id={unit.id}
                  action={unit.action}
                  actionIcon={actionIcon}
                  actionCode={unit.actionCode}
                  description={unit.description}
                  active={unit.active}
                  popUpChild={popUpChild}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
