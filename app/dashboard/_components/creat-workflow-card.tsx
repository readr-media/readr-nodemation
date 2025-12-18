import { Card, CardContent } from "@/components/ui/card";
import IconAdd from "@/public/add.svg";
import Image from "next/image";

export default function CreatWorkflowCard() {
  return (
    <Card className="flex flex-col items-center justify-center rounded-2xl px-4 py-6 bg-white border-module-border w-[398px] hover:shadow-2">
      <CardContent className="p-0 flex flex-col items-center justify-center">
        <Image src={IconAdd} width={48} height={48} alt="add icon" />
        <div className="mt-5 text-center">
          <p className="font-normal text-base">建立新工作流</p>
          <p className="font-normal text-sm text-[#4a4842]">
            從空白開始設計流程
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
