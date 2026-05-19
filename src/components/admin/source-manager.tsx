"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Link2,
  ClipboardPaste,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SourceRow = {
  id: string;
  type: "pdf" | "url" | "text" | "transcript";
  title: string | null;
  url: string | null;
  status: string;
  copyright_risk: string;
  token_count: number | null;
  error: string | null;
  created_at: string;
};

type Tab = "pdf" | "url" | "text";

export function SourceManager({
  projectId,
  initialSources,
}: {
  projectId: string;
  initialSources: SourceRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function refresh() {
    startTransition(() => router.refresh());
  }

  async function addUrl(form: FormData) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/sources/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.get("url"),
          title: form.get("title") || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addText(form: FormData) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/sources/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          text: form.get("text"),
          author: form.get("author") || undefined,
          url: form.get("url") || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addPdf(file: File) {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/sources/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSource(id: string) {
    if (!confirm("Delete this source and its chunks?")) return;
    await fetch(`/api/projects/${projectId}/sources/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <TabBtn active={tab === "url"} onClick={() => setTab("url")}>
              <Link2 className="size-4" /> URL
            </TabBtn>
            <TabBtn active={tab === "pdf"} onClick={() => setTab("pdf")}>
              <FileText className="size-4" /> PDF
            </TabBtn>
            <TabBtn active={tab === "text"} onClick={() => setTab("text")}>
              <ClipboardPaste className="size-4" /> Text
            </TabBtn>
          </div>

          {tab === "url" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addUrl(new FormData(e.currentTarget));
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <div className="space-y-1">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://docs.example.com/article"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title-url">Title (optional)</Label>
                  <Input id="title-url" name="title" />
                </div>
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Scrape & ingest
              </Button>
            </form>
          )}

          {tab === "pdf" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const file = (
                  new FormData(e.currentTarget).get("file") as File | null
                );
                if (file && file.size > 0) addPdf(file);
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="file">PDF file</Label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  required
                  className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-background file:text-sm file:font-medium hover:file:opacity-90"
                />
                <p className="text-xs text-mutedForeground">
                  Up to ~25 MB. PDFs are stored privately and never published.
                </p>
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Upload & ingest
              </Button>
            </form>
          )}

          {tab === "text" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addText(new FormData(e.currentTarget));
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title-t">Title</Label>
                  <Input id="title-t" name="title" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="author-t">Author (optional)</Label>
                  <Input id="author-t" name="author" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="url-t">Source URL (optional)</Label>
                <Input id="url-t" name="url" type="url" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="text-t">Text</Label>
                <Textarea id="text-t" name="text" rows={8} required />
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Save & ingest
              </Button>
            </form>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {initialSources.length === 0 ? (
            <div className="py-12 text-center text-sm text-mutedForeground">
              No sources yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {initialSources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {s.title ?? s.url ?? "Untitled source"}
                      </span>
                      <Badge tone="neutral" className="uppercase">
                        {s.type}
                      </Badge>
                      {s.copyright_risk === "high" && (
                        <Badge tone="danger" className="gap-1">
                          <ShieldAlert className="size-3" /> High risk
                        </Badge>
                      )}
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-mutedForeground hover:text-foreground truncate block"
                      >
                        {s.url}
                      </a>
                    )}
                    {s.error && (
                      <p className="text-xs text-red-500 mt-1">{s.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={
                        s.status === "ready"
                          ? "success"
                          : s.status === "error"
                            ? "danger"
                            : "warn"
                      }
                      className="capitalize"
                    >
                      {s.status}
                    </Badge>
                    <button
                      onClick={() => deleteSource(s.id)}
                      className="text-mutedForeground hover:text-red-500 transition"
                      aria-label="Delete source"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition",
        active
          ? "bg-foreground text-background"
          : "bg-muted text-mutedForeground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
