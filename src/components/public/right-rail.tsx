"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonNotes } from "./lesson-notes";
import { AskAIPanel } from "./ask-ai-panel";

export function LessonRightRail({
  slug,
  moduleIdx,
  lessonIdx,
  lessonTitle,
  moduleTitle,
}: {
  slug: string;
  moduleIdx: number;
  lessonIdx: number;
  lessonTitle: string;
  moduleTitle: string;
}) {
  const [tab, setTab] = useState<"notes" | "ask">("notes");

  return (
    <div className="space-y-2">
      <div className="inline-flex rounded-full bg-muted p-1 text-xs">
        <TabBtn active={tab === "notes"} onClick={() => setTab("notes")}>
          <FileText className="size-3.5" />
          Notes
        </TabBtn>
        <TabBtn active={tab === "ask"} onClick={() => setTab("ask")}>
          <Sparkles className="size-3.5" />
          Ask AI
        </TabBtn>
      </div>

      {tab === "notes" && (
        <LessonNotes
          slug={slug}
          moduleIdx={moduleIdx}
          lessonIdx={lessonIdx}
          lessonTitle={lessonTitle}
          moduleTitle={moduleTitle}
        />
      )}
      {tab === "ask" && <AskAIPanel slug={slug} />}
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-mutedForeground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
