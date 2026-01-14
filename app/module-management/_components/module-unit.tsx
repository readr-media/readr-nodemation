import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ModuleType } from "./module-section";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Settings } from "lucide-react";
import Image from "next/image";
import toggleActive from "@/public/module-management/toggle-active.svg";
import toggleInactive from "@/public/module-management/toggle-inactive.svg";

const actionIconVariants = cva(
  "flex items-center justify-center size-10 rounded-[10px] text-white",
  {
    variants: {
      actionCode: {
        ai: "bg-red-500",
        code: "bg-purple-500",
        cms: "bg-green-500",
        content: "bg-blue-500",
      },
    },
    defaultVariants: {
      actionCode: "ai",
    },
  }
);

const actionCodeVariants = cva("absolute top-0 left-4 w-12 h-1 rounded-b-md", {
  variants: {
    actionCode: {
      ai: "bg-red-500",
      code: "bg-purple-500",
      cms: "bg-green-500",
      content: "bg-blue-500",
    },
  },
  defaultVariants: {
    actionCode: "ai",
  },
});

export default function ModuleUnit({
  action,
  actionIcon: ActionIcon,
  actionCode,
  description,
  active,
}: ModuleType["units"][number] &
  VariantProps<typeof actionIconVariants> &
  VariantProps<typeof actionCodeVariants>) {
  const activeUnit = (
    <div className="flex justify-between items-center border-t border-gray-400 pt-4">
      <div className="flex items-center gap-x-2 text-green-500">
        <CircleCheck size={16} />
        <div className="body-3">啟用中</div>
      </div>
      <div className="flex items-center gap-x-3">
        <Image
          src={toggleActive}
          width={30}
          height={16}
          alt="啟用模組"
          className="cursor-pointer"
        />
        <Button className="border-none has-[>svg]:px-2 hover:bg-gray-300">
          <Settings size={16} color="#6e6b5e" />
        </Button>
      </div>
    </div>
  );

  const inactiveUnit = (
    <div className="flex justify-between items-center border-t border-gray-400 pt-4">
      <div className="flex items-center gap-x-2 text-gray-600">
        <CircleX size={16} />
        <div className="body-3">未啟用</div>
      </div>
      <div className="flex items-center gap-x-3">
        <Image
          src={toggleInactive}
          width={30}
          height={16}
          alt="停用模組"
          className="cursor-pointer"
        />
        <Button className="border-none has-[>svg]:px-2 hover:bg-gray-300">
          <Settings size={16} color="#6e6b5e" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative bg-white border border-gray-400 rounded-xl flex flex-col gap-y-4 p-4">
      <div className={cn(actionCodeVariants({ actionCode: actionCode }))} />
      <div className="flex gap-x-3 items-center">
        <div className={cn(actionIconVariants({ actionCode: actionCode }))}>
          <ActionIcon size={20} />
        </div>
        <div>
          <div className="title-5 text-gray-900">{action}</div>
          <div className="body-3 text-gray-700">{description}</div>
        </div>
      </div>
      {active ? activeUnit : inactiveUnit}
    </div>
  );
}
