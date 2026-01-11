export default function ModuleUnit(unit: {
  id: string;
  action: string;
  description: string;
  status: string;
}) {
  const activeUnit = (
    <div className="flex justify-between items-center border-t border-gray-400 py-[7px]">
      <div className="flex items-center gap-x-2">
        <div>icon</div>
        <div className="body-3 text-green-500">啟用中</div>
      </div>
      <div>b</div>
    </div>
  );

  const inactiveUnit = (
    <div className="flex justify-between items-center border-t border-gray-400 py-[7px]">
      <div className="flex items-center gap-x-2">
        <div>icon</div>
        <div className="body-3 text-gray-600">未啟用</div>
      </div>
      <div>b</div>
    </div>
  );

  return (
    <div
      key={unit.id}
      className="bg-gray-100 border border-gray-400 rounded-xl flex flex-col gap-y-4 p-4"
    >
      <div className="flex gap-x-3">
        <div>我是 icon</div>
        <div>
          <div className="title-5 text-gray-900">{unit.action}</div>
          <div className="body-3 text-gray-700">{unit.description}</div>
        </div>
      </div>
      {unit.status === "active" ? activeUnit : inactiveUnit}
    </div>
  );
}
