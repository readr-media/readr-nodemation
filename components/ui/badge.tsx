import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 text-xs font-normal w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        published:
          "bg-green-100 border-green-300 text-green-700",
        draft:
          "bg-yellow-100 border-yellow-300 text-yellow-700",
        template:
          "bg-gray-300 border-gray-400 text-gray-700",
        running:
          "bg-red-100 border-red-300 text-red-700",
        success:
          "border-0 bg-green-100 px-3 text-green-500 py-1 text-sm",
        failed:
          "border-0 bg-red-100 px-3 bg-red-100 text-red-500 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "published",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
