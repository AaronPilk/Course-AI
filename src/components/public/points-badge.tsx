"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { usePointsState, levelFromPoints } from "@/lib/points";
import { cn } from "@/lib/utils";

export function PointsBadge() {
  const state = usePointsState();
  const [flash, setFlash] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);
  const [prevTotal, setPrevTotal] = useState<number | null>(null);

  // Animate when total changes upward.
  useEffect(() => {
    if (prevTotal === null) {
      setPrevTotal(state.total);
      return;
    }
    if (state.total > prevTotal) {
      const d = state.total - prevTotal;
      setDelta(d);
      setFlash(true);
      const t1 = window.setTimeout(() => setFlash(false), 1200);
      const t2 = window.setTimeout(() => setDelta(null), 2000);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    setPrevTotal(state.total);
  }, [state.total, prevTotal]);

  const { level, current, needed } = levelFromPoints(state.total);
  const pct = Math.min(100, Math.round((current / Math.max(1, needed)) * 100));

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-muted px-3 h-9 text-sm transition-all",
          flash && "ring-2 ring-accent ring-offset-2 ring-offset-background"
        )}
      >
        <Sparkles
          className={cn(
            "size-3.5 text-accent transition-transform",
            flash && "scale-125"
          )}
        />
        <span className="tabular-nums font-semibold">
          {state.total.toLocaleString()}
        </span>
        <span className="text-mutedForeground text-xs">pts</span>
        <span className="text-border">·</span>
        <span className="text-xs text-mutedForeground">
          Lv. <span className="text-foreground font-medium">{level}</span>
        </span>
      </div>

      {/* Tiny progress underline */}
      <div className="absolute -bottom-1 left-2 right-2 h-px bg-border/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Flying +N */}
      {delta !== null && (
        <div className="pointer-events-none absolute top-0 right-0 translate-y-[-50%] translate-x-1/2 text-accent text-xs font-semibold animate-bounce">
          +{delta}
        </div>
      )}
    </div>
  );
}
