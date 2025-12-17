import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 text-xs font-normal w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        published:
          "border-transparent bg-green-100 border-green-300 text-green-700 font-normal",
        draft:
          "border-transparent bg-yellow-100 border-yellow-300 text-yellow-700 font-normal",
        template:
          "border-transparent bg-gray-300 border-gray-400 text-gray-700 font-normal",
        running:
          "border-transparent bg-red-100 border-red-300 text-red-700 font-normal",
      },
    },
    defaultVariants: {
      variant: "published",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
