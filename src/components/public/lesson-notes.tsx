"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved";

function notesKey(slug: string, m: number, l: number) {
  return `cf:notes:${slug}:${m}:${l}`;
}

function readNotes(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeNotes(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    if (value.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // localStorage quota or disabled — fail silently
  }
}

export function LessonNotes({
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
  const key = notesKey(slug, moduleIdx, lessonIdx);
  const [value, setValue] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const fadeTimer = useRef<number | null>(null);

  // Load on mount + when lesson changes
  useEffect(() => {
    setValue(readNotes(key));
    setState("idle");
    setMounted(true);
  }, [key]);

  // Debounced save on change
  useEffect(() => {
    if (!mounted) return;
    setState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      writeNotes(key, value);
      setState("saved");
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setState("idle"), 1500);
    }, 600);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, key]);

  function clear() {
    if (!value) return;
    if (!confirm("Clear notes for this lesson?")) return;
    setValue("");
    writeNotes(key, "");
    setState("saved");
  }

  function download() {
    const header = `# Notes — ${moduleTitle} · ${lessonTitle}\n\n`;
    const blob = new Blob([header + value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${slug}-m${moduleIdx + 1}-l${lessonIdx + 1}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const wordCount = value.trim().length === 0 ? 0 : value.trim().split(/\s+/).length;

  return (
    <div className="rounded-2xl bg-card border border-border/70 shadow-card flex flex-col h-[calc(100vh-6rem)]">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-mutedForeground" />
          <h3 className="text-sm font-semibold">Your notes</h3>
        </div>
        <SaveBadge state={state} />
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Jot down anything you want to remember from this lesson. Saves automatically."
        className="flex-1 resize-none bg-transparent px-5 py-3 text-[15px] leading-relaxed placeholder:text-mutedForeground focus:outline-none focus:ring-0"
      />
      <div className="px-4 py-2 border-t border-border/60 flex items-center justify-between text-[11px] text-mutedForeground">
        <span>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={download}
            disabled={!value}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded hover:text-foreground disabled:opacity-40 disabled:hover:text-mutedForeground"
            title="Download as markdown"
          >
            <Download className="size-3.5" />
          </button>
          <button
            onClick={clear}
            disabled={!value}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded hover:text-red-500 disabled:opacity-40 disabled:hover:text-mutedForeground"
            title="Clear notes"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider transition-opacity",
        state === "saving" ? "text-mutedForeground" : "text-emerald-500"
      )}
    >
      {state === "saving" ? (
        <span className="size-1.5 rounded-full bg-mutedForeground animate-pulse" />
      ) : (
        <Check className="size-3" />
      )}
      {state === "saving" ? "Saving…" : "Saved"}
    </span>
  );
}
