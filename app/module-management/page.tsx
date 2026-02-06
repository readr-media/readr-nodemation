import { getModuleTypesWithUnits } from "@/lib/modules";
import ModuleDashboard from "./_components/module-dashboard";
import ModuleSection from "./_components/module-section";

export const runtime = "nodejs";

export default async function Page() {
  const moduleTypes = await getModuleTypesWithUnits();
  const units = moduleTypes.flatMap((type) => type.units);
  const activeCount = units.filter((unit) => unit.active).length;
  const inactiveCount = units.length - activeCount;

  return (
    <main className="flex flex-col py-10 px-15 gap-y-10 bg-gray-200 min-h-screen">
      <ModuleDashboard
        total={units.length}
        active={activeCount}
        inactive={inactiveCount}
      />
      <ModuleSection moduleTypes={moduleTypes} />
    </main>
  );
}
