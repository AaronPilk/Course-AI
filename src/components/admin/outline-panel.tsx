"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Lesson = { title: string; objective?: string };
type Module = { title: string; summary?: string; lessons?: Lesson[]; key_concepts?: string[] };
export type Outline = {
  title?: string;
  subtitle?: string;
  description?: string;
  target_audience?: string;
  prerequisites?: string[];
  outcomes?: string[];
  estimated_minutes?: number;
  modules?: Module[];
};

export function OutlinePanel({
  projectId,
  outline,
  canGenerate,
}: {
  projectId: string;
  outline: Outline | null;
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function generate() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/generate-outline`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (!outline) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-muted grid place-items-center">
            <Wand2 className="size-5 text-mutedForeground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Generate the course outline</h3>
            <p className="text-sm text-mutedForeground max-w-md mx-auto">
              Once your sources are ingested, the factory will analyze them and
              propose a course title, modules, and lesson list.
            </p>
          </div>
          <Button onClick={generate} disabled={!canGenerate || busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate outline
              </>
            )}
          </Button>
          {!canGenerate && (
            <p className="text-xs text-mutedForeground">
              Add at least one source first.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {outline.title}
            </h2>
            {outline.subtitle && (
              <p className="text-mutedForeground">{outline.subtitle}</p>
            )}
          </div>
          <Button variant="outline" onClick={generate} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            Regenerate
          </Button>
        </div>

        {outline.description && (
          <p className="text-sm leading-relaxed">{outline.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {outline.outcomes && outline.outcomes.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-mutedForeground mb-2">
                Learning outcomes
              </div>
              <ul className="space-y-1 list-disc pl-5">
                {outline.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
          {outline.prerequisites && outline.prerequisites.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-mutedForeground mb-2">
                Prerequisites
              </div>
              <ul className="space-y-1 list-disc pl-5">
                {outline.prerequisites.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-mutedForeground mb-3">
            Modules
          </div>
          <div className="space-y-3">
            {(outline.modules ?? []).map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-mutedForeground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-medium">{m.title}</h3>
                </div>
                {m.summary && (
                  <p className="text-sm text-mutedForeground mt-1">
                    {m.summary}
                  </p>
                )}
                {m.lessons && m.lessons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm pl-5 list-disc">
                    {m.lessons.map((l, j) => (
                      <li key={j}>{l.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
