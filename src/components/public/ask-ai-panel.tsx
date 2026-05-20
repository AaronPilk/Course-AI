"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, ChevronRight, Loader2, Trash2 } from "lucide-react";

type LessonReference = {
  kind: "lesson";
  moduleIdx: number;
  lessonIdx: number;
  moduleTitle: string;
  lessonTitle: string;
  snippet: string;
  similarity: number;
};

type SourceReference = {
  kind: "source";
  url: string | null;
  title: string | null;
  snippet: string;
  similarity: number;
};

type Reference = LessonReference | SourceReference;

interface Turn {
  id: string;
  question: string;
  answer?: string;
  references?: Reference[];
  error?: string;
  loading?: boolean;
}

export function AskAIPanel({ slug }: { slug: string }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  async function submit() {
    const q = question.trim();
    if (!q) return;
    const id = crypto.randomUUID();
    setTurns((t) => [...t, { id, question: q, loading: true }]);
    setQuestion("");

    try {
      const res = await fetch(`/api/courses/${slug}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTurns((t) =>
          t.map((turn) =>
            turn.id === id
              ? { ...turn, loading: false, error: data.error ?? "Failed" }
              : turn
          )
        );
        return;
      }
      setTurns((t) =>
        t.map((turn) =>
          turn.id === id
            ? {
                ...turn,
                loading: false,
                answer: data.answer,
                references: data.references ?? [],
              }
            : turn
        )
      );
    } catch (e) {
      setTurns((t) =>
        t.map((turn) =>
          turn.id === id
            ? {
                ...turn,
                loading: false,
                error: e instanceof Error ? e.message : "Failed",
              }
            : turn
        )
      );
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="rounded-2xl bg-card border border-border/70 shadow-card flex flex-col h-[calc(100vh-6rem)]">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h3 className="text-sm font-semibold">Ask AI</h3>
        </div>
        {turns.length > 0 && (
          <button
            onClick={() => setTurns([])}
            className="text-[11px] text-mutedForeground hover:text-foreground inline-flex items-center gap-1"
          >
            <Trash2 className="size-3" />
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-4 text-sm"
      >
        {turns.length === 0 ? (
          <Suggestions onPick={(q) => setQuestion(q)} />
        ) : (
          turns.map((t) => (
            <div key={t.id} className="space-y-3">
              <div className="text-right">
                <div className="inline-block bg-foreground text-background rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%] text-left">
                  {t.question}
                </div>
              </div>

              {t.loading && (
                <div className="flex items-center gap-2 text-mutedForeground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-xs">Searching the course…</span>
                </div>
              )}

              {t.error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 p-3 text-xs leading-relaxed">
                  {t.error}
                </div>
              )}

              {t.answer && (
                <div className="space-y-3">
                  <div className="prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="my-2">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 my-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 my-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline-offset-4 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="px-1 rounded bg-muted text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {t.answer}
                    </ReactMarkdown>
                  </div>

                  {t.references && t.references.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] uppercase tracking-wider text-mutedForeground">
                        Where this comes from
                      </div>
                      {t.references.map((r, i) =>
                        r.kind === "lesson" ? (
                          <Link
                            key={i}
                            href={`/learn/${slug}/${r.moduleIdx}/${r.lessonIdx}`}
                            className="group block rounded-xl border border-border/70 px-3 py-2 hover:bg-muted/60 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[10px] uppercase tracking-wider text-accent">
                                Lesson · Module {r.moduleIdx + 1} · {r.lessonIdx + 1}
                              </div>
                              <ChevronRight className="size-3 text-mutedForeground group-hover:text-foreground" />
                            </div>
                            <div className="font-medium text-xs mt-0.5 leading-snug">
                              {r.lessonTitle}
                            </div>
                            <div className="text-[11px] text-mutedForeground line-clamp-2 mt-1">
                              {r.snippet}
                            </div>
                          </Link>
                        ) : (
                          <a
                            key={i}
                            href={r.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-xl border border-border/70 px-3 py-2 hover:bg-muted/60 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[10px] uppercase tracking-wider text-mutedForeground">
                                Source · external
                              </div>
                              <ChevronRight className="size-3 text-mutedForeground group-hover:text-foreground" />
                            </div>
                            <div className="font-medium text-xs mt-0.5 leading-snug">
                              {r.title ?? r.url ?? "Untitled source"}
                            </div>
                            <div className="text-[11px] text-mutedForeground line-clamp-2 mt-1">
                              {r.snippet}
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about this course…"
            rows={2}
            className="flex-1 resize-none rounded-xl bg-muted/60 border border-border px-3 py-2 text-sm placeholder:text-mutedForeground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <button
            onClick={submit}
            disabled={!question.trim()}
            className="size-9 shrink-0 rounded-xl bg-foreground text-background grid place-items-center hover:opacity-90 disabled:opacity-40 transition"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
        <div className="text-[10px] text-mutedForeground mt-1.5 px-1">
          ⌘+Enter to send · Answers cite the lessons they came from.
        </div>
      </div>
    </div>
  );
}

function Suggestions({ onPick }: { onPick: (q: string) => void }) {
  const suggestions = [
    "What's the difference between indexing and ranking?",
    "How do AI Overviews actually generate answers?",
    "Is the duplicate content penalty real?",
  ];
  return (
    <div className="space-y-3 pt-6">
      <div className="text-mutedForeground text-xs leading-relaxed">
        Ask any question and the AI will answer using only this course&apos;s
        content, with links to the specific lessons it pulled from.
      </div>
      <div className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-wider text-mutedForeground">
          Try
        </div>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-border/70 hover:bg-muted/60 transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
