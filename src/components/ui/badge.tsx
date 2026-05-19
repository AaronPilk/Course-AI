import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warn" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-mutedForeground",
  accent: "bg-accent/15 text-accent",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
