import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const iconVariants = cva(
  "flex size-10 items-center justify-center rounded-[10px] text-white",
  {
    variants: {
      accent: {
        ai: "bg-red-500",
        code: "bg-purple-500",
        cms: "bg-green-500",
        content: "bg-blue-500",
      },
    },
    defaultVariants: {
      accent: "ai",
    },
  },
);

export type ModuleCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
} & VariantProps<typeof iconVariants>;

const ModuleCard = ({
  title,
  description,
  icon: Icon,
  accent = "ai",
  className,
  ...props
}: ModuleCardProps & React.ComponentProps<"div">) => (
  <div
    className={cn(
      "module-card cursor-pointer rounded-[12px] border border-module-border bg-white p-4 transition hover:border-module-hover",
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-3">
      <div className={cn(iconVariants({ accent }))}>
        <Icon className="size-5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-base font-medium leading-6 text-module-title">
          {title}
        </p>
        <p className="text-xs leading-[18px] text-module-muted">{description}</p>
      </div>
    </div>
  </div>
);

export { ModuleCard };
