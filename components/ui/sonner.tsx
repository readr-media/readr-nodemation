"use client";

import { InfoIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    toastOptions={{
      classNames: {
        toast:
          "rounded-xl border border-gray-300 bg-white px-6 py-6 text-gray-900 shadow-2",
        title: "body-1 text-gray-900",
        description: "body-2 text-gray-700",
      },
    }}
    {...props}
  />
);

export { Toaster, toast, InfoIcon };
