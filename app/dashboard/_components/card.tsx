export default function Card() {
  return (
    <div className="relative p-5 bg-white border border-[#e8e7e2] rounded-[14px] w-[398px]">
      <div className="absolute top-0 left-5 w-12 h-1 bg-[#00967D] rounded-bl-[6px] rounded-br-[6px] opacity-100" />
      <p className="font-normal text-base mb-4">AI 新聞處理流程</p>
      <div className="font-normal text-sm text-[#4a4842] flex flex-col gap-y-2">
        <p>2 小時前編輯</p>
        <p>執行於 35 分鐘前</p>
      </div>
    </div>
  );
}
