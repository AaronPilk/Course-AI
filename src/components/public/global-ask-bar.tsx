"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { useState, FormEvent } from "react";

/**
 * Header-center "Ask AI" input — searches across all courses.
 * Submits to /ask?q=<query>.
 */
export function GlobalAskBar({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/ask?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Ask AI across all courses"
      className={
        "group relative flex items-center w-full max-w-xl rounded-full bg-muted/60 border border-border hover:border-accent/50 focus-within:border-accent transition-colors " +
        (className ?? "")
      }
    >
      <Sparkles
        aria-hidden
        className="absolute left-3.5 size-4 text-accent pointer-events-none"
      />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask anything across all courses…"
        className="flex-1 bg-transparent pl-10 pr-12 py-2 text-sm text-foreground placeholder:text-mutedForeground/80 outline-none"
        aria-label="Ask AI"
      />
      <button
        type="submit"
        aria-label="Submit question"
        className={
          "absolute right-1.5 size-7 rounded-full grid place-items-center transition-all " +
          (q.trim()
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-transparent text-mutedForeground pointer-events-none")
        }
      >
        <ArrowRight className="size-3.5" />
      </button>
    </form>
  );
}
