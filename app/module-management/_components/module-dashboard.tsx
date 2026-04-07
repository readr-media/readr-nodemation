type ModuleDashboardProps = {
  total: number;
  active: number;
  inactive: number;
};

export default function ModuleDashboard({
  total,
  active,
  inactive,
}: ModuleDashboardProps) {
  const moduleDashboardUnits = [
    { id: "sum", name: "模組總數", number: total },
    { id: "active", name: "已啟用", number: active },
    { id: "inactive", name: "未啟用", number: inactive },
  ];

  return (
    <div className="grid grid-cols-3 px-6 py-4 bg-white border border-gray-400 rounded-xl">
      {moduleDashboardUnits.map((unit) => (
        <div key={unit.id}>
          <div className="title-6 text-gray-600">{unit.name}</div>
          <div className="title-1 text-gray-900">{unit.number}</div>
        </div>
      ))}
    </div>
  );
}
