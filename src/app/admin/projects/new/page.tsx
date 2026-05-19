"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const estimated = form.get("estimated_minutes");
    const body = {
      name: String(form.get("name") ?? ""),
      category: (form.get("category") as string) || null,
      difficulty: (form.get("difficulty") as string) || null,
      audience: (form.get("audience") as string) || null,
      learning_goals: (form.get("learning_goals") as string) || null,
      tags,
      estimated_minutes: estimated ? Number(estimated) : null,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }
    const { id } = await res.json();
    router.push(`/admin/projects/${id}`);
  }

  return (
    <div className="px-8 py-10 max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-mutedForeground">
          New project
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">
          Start a course project
        </h1>
        <p className="text-mutedForeground mt-1">
          Outline the course you want the factory to build. You can refine
          everything later.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            These shape the outline and lesson plan the AI generates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Course name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Modern Cryptography Foundations"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Security, ML, Web…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select id="difficulty" name="difficulty" defaultValue="">
                  <option value="">Select…</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
              <Textarea
                id="audience"
                name="audience"
                rows={2}
                placeholder="Who is this course for?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learning_goals">Learning goals</Label>
              <Textarea
                id="learning_goals"
                name="learning_goals"
                rows={4}
                placeholder="What should students be able to do by the end?"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="cryptography, security, math"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_minutes">
                  Estimated duration (minutes)
                </Label>
                <Input
                  id="estimated_minutes"
                  name="estimated_minutes"
                  type="number"
                  min={0}
                  placeholder="240"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
