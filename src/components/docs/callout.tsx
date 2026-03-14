"use client";

import { AlertCircle, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "danger" | "tip";

const config: Record<
  CalloutType,
  { border: string; bg: string; icon: React.ElementType; iconColor: string }
> = {
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    icon: Info,
    iconColor: "text-blue-500",
  },
  warning: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
  danger: {
    border: "border-l-red-500",
    bg: "bg-red-50",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  tip: {
    border: "border-l-green-500",
    bg: "bg-green-50",
    icon: Lightbulb,
    iconColor: "text-green-500",
  },
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: React.ReactNode;
}) {
  const { border, bg, icon: Icon, iconColor } = config[type];

  return (
    <div
      className={cn(
        "my-4 flex gap-3 rounded-r-lg border-l-4 px-4 py-3",
        border,
        bg,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor)} />
      <div className="text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </div>
  );
}
