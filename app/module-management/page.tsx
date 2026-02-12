import ModuleDashboard from "./_components/module-dashboard";
import ModuleSection from "./_components/module-section";

export default function Page() {
  return (
    <main className="flex flex-col py-10 px-15 gap-y-10 bg-gray-200 min-h-screen">
      <ModuleDashboard />
      <ModuleSection />
    </main>
  );
}
