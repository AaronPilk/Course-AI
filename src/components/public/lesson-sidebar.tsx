"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarLesson {
  position: number;
  title: string;
  hasQuiz?: boolean;
}

export interface SidebarModule {
  position: number;
  title: string;
  lessons: SidebarLesson[];
  hasQuiz: boolean;
}

export function LessonSidebar({
  slug,
  modules,
  currentModule,
  currentLesson,
  isQuiz,
  completedLessons,
}: {
  slug: string;
  modules: SidebarModule[];
  currentModule: number;
  currentLesson?: number;
  isQuiz?: boolean;
  completedLessons: string[];
}) {
  const [openModules, setOpenModules] = useState<Set<number>>(
    new Set([currentModule])
  );

  function toggle(idx: number) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <aside className="w-72 shrink-0 border-r border-border/60 bg-card/30 backdrop-blur-xl">
      <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5 space-y-1">
        {modules.map((m) => {
          const isOpen = openModules.has(m.position);
          const isCurrent = currentModule === m.position;
          return (
            <div key={m.position} className="mb-1">
              <button
                onClick={() => toggle(m.position)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isCurrent
                    ? "bg-muted/80 text-foreground"
                    : "hover:bg-muted/40 text-mutedForeground hover:text-foreground"
                )}
              >
                {isOpen ? (
                  <ChevronDown className="size-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="size-3.5 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-[10px] tabular-nums font-semibold tracking-wider uppercase shrink-0",
                    isCurrent ? "text-accent" : "text-mutedForeground"
                  )}
                >
                  {String(m.position + 1).padStart(2, "0")}
                </span>
                <span className="font-medium text-left flex-1 truncate">
                  {m.title}
                </span>
              </button>
              {isOpen && (
                <div className="pl-3 mt-1 pb-1 space-y-0.5 border-l border-border/60 ml-5">
                  {m.lessons.map((l) => {
                    const active =
                      currentModule === m.position &&
                      currentLesson === l.position &&
                      !isQuiz;
                    const done = completedLessons.includes(
                      `${m.position}-${l.position}`
                    );
                    return (
                      <div key={l.position}>
                        <Link
                          href={`/learn/${slug}/${m.position}/${l.position}`}
                          className={cn(
                            "flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-md text-xs transition-all relative",
                            active
                              ? "bg-accent/15 text-foreground font-medium"
                              : "text-mutedForeground hover:text-foreground hover:bg-muted/40"
                          )}
                        >
                          {active && (
                            <span className="absolute -left-3 top-1.5 bottom-1.5 w-px bg-accent" />
                          )}
                          {done ? (
                            <Check className="size-3 text-accent shrink-0" />
                          ) : (
                            <span className="size-3 rounded-full border border-border/80 shrink-0" />
                          )}
                          <span className="line-clamp-2 text-left flex-1 leading-snug">
                            {l.title}
                          </span>
                        </Link>
                        {l.hasQuiz && (
                          <Link
                            href={`/learn/${slug}/${m.position}/${l.position}/quiz`}
                            className="flex items-center gap-2 pl-9 pr-3 py-1 text-[10px] uppercase tracking-wider text-mutedForeground hover:text-accent transition-colors"
                          >
                            <span className="size-1 rounded-full bg-accent" />
                            Quick check
                          </Link>
                        )}
                      </div>
                    );
                  })}
                  {m.hasQuiz && (
                    <Link
                      href={`/learn/${slug}/${m.position}/quiz`}
                      className={cn(
                        "flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-md text-xs transition-all mt-1",
                        isQuiz && currentModule === m.position
                          ? "bg-accent/15 text-foreground font-medium"
                          : "text-mutedForeground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <span className="size-3 rounded-full bg-accent/20 border border-accent/50 shrink-0" />
                      <span className="uppercase tracking-wider text-[10px] font-semibold">
                        Module quiz
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
