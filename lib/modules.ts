import { unstable_noStore as noStore } from "next/cache";
import type { ModuleActionCode, ModuleTypeData } from "@/lib/module-types";
import { prisma } from "@/lib/prisma";

export const getModuleTypesWithUnits = async (): Promise<ModuleTypeData[]> => {
  noStore();

  const moduleTypes = await prisma.moduleType.findMany({
    orderBy: { sort_order: "asc" },
    select: {
      id: true,
      name: true,
      sort_order: true,
      units: {
        orderBy: { sort_order: "asc" },
        select: {
          id: true,
          action: true,
          action_code: true,
          description: true,
          active: true,
          icon_key: true,
          sort_order: true,
        },
      },
    },
  });

  return moduleTypes.map((moduleType) => ({
    id: moduleType.id,
    name: moduleType.name,
    units: moduleType.units.map((unit) => ({
      id: unit.id,
      action: unit.action,
      actionCode: unit.action_code as ModuleActionCode,
      description: unit.description,
      active: unit.active,
      iconKey: unit.icon_key,
    })),
  }));
};
