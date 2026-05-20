import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb, courseProjects, sources } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SourceManager, type SourceRow } from "@/components/admin/source-manager";
import { OutlinePanel, type Outline } from "@/components/admin/outline-panel";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const db = getDb();

  const project = await db
    .select()
    .from(courseProjects)
    .where(eq(courseProjects.id, params.id))
    .get();

  if (!project) notFound();

  const sourceRows = await db
    .select({
      id: sources.id,
      type: sources.type,
      title: sources.title,
      url: sources.url,
      status: sources.status,
      copyright_risk: sources.copyrightRisk,
      token_count: sources.tokenCount,
      error: sources.error,
      created_at: sources.createdAt,
    })
    .from(sources)
    .where(eq(sources.projectId, params.id))
    .orderBy(desc(sources.createdAt));

  // The SourceManager component expects ISO date strings + the existing shape.
  const initialSources: SourceRow[] = sourceRows.map((s) => ({
    id: s.id,
    type: s.type as SourceRow["type"],
    title: s.title,
    url: s.url,
    status: s.status,
    copyright_risk: s.copyright_risk,
    token_count: s.token_count,
    error: s.error,
    created_at: new Date(s.created_at).toISOString(),
  }));

  const readySources = initialSources.filter((s) => s.status === "ready").length;

  const outline: Outline | null = (() => {
    if (!project.outline) return null;
    try {
      return JSON.parse(project.outline) as Outline;
    } catch {
      return null;
    }
  })();

  return (
    <div className="px-8 py-10 max-w-6xl space-y-8">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-mutedForeground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> All projects
        </Link>
      </div>

      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Badge tone="neutral" className="capitalize">
            {project.status.replace(/_/g, " ")}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <div className="text-sm text-mutedForeground flex items-center gap-2 flex-wrap">
            {project.category && <span>{project.category}</span>}
            {project.difficulty && (
              <>
                <span>·</span>
                <span className="capitalize">{project.difficulty}</span>
              </>
            )}
            <span>·</span>
            <span>Updated {formatDate(new Date(project.updatedAt))}</span>
          </div>
        </div>
      </header>

      {(project.audience || project.learningGoals) && (
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {project.audience && (
              <div>
                <div className="text-xs uppercase tracking-wider text-mutedForeground mb-2">
                  Target audience
                </div>
                <p>{project.audience}</p>
              </div>
            )}
            {project.learningGoals && (
              <div>
                <div className="text-xs uppercase tracking-wider text-mutedForeground mb-2">
                  Learning goals
                </div>
                <p>{project.learningGoals}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Source library</h2>
          <p className="text-xs text-mutedForeground">
            {readySources}/{initialSources.length} ready
          </p>
        </div>
        <SourceManager
          projectId={project.id}
          initialSources={initialSources}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Course outline</h2>
        <OutlinePanel
          projectId={project.id}
          outline={outline}
          canGenerate={readySources > 0}
        />
      </section>
    </div>
  );
}
