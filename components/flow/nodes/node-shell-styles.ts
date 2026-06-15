import { cn } from "@/lib/utils";

type NodeAccent = "ai" | "cms" | "code";

const accentBorderStyles: Record<NodeAccent, string> = {
  ai: "border-red-500",
  cms: "border-[#0f9b81]",
  code: "border-[#9333ea]",
};

const accentSelectedShadowStyles: Record<NodeAccent, string> = {
  ai: "shadow-[0_0_0_4px_rgba(255,107,74,0.2)]",
  cms: "shadow-[0_0_0_4px_rgba(0,150,125,0.2)]",
  code: "shadow-[0_0_0_4px_rgba(147,51,234,0.2)]",
};

export function getNodeShellClassName(selected: boolean, accent: NodeAccent) {
  return cn(
    "relative min-w-60 rounded-[14px] border bg-white px-5 py-3 transition-all",
    accentBorderStyles[accent],
    selected && accentSelectedShadowStyles[accent],
  );
}
