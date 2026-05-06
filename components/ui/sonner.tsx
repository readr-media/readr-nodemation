"use client";

import { CheckIcon, InfoIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
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

const SolidIcon = ({
  tone,
  children,
}: {
  tone: "success" | "error" | "info";
  children: ReactNode;
}) => {
  const toneClass =
    tone === "success"
      ? "bg-green-500"
      : tone === "error"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <span
      className={`flex size-5 items-center justify-center rounded-full ${toneClass}`}
    >
      {children}
    </span>
  );
};

export const appToast = {
  success: (message: string) =>
    toast(message, {
      icon: (
        <SolidIcon tone="success">
          <CheckIcon className="size-4 text-white" strokeWidth={3} />
        </SolidIcon>
      ),
    }),
  error: (message: string) =>
    toast(message, {
      icon: (
        <SolidIcon tone="error">
          <XIcon className="size-4 text-white" strokeWidth={3} />
        </SolidIcon>
      ),
    }),
  info: (message: string) =>
    toast(message, {
      icon: (
        <SolidIcon tone="info">
          <InfoIcon className="size-4 text-white" />
        </SolidIcon>
      ),
    }),
};

export { Toaster, toast, InfoIcon };
