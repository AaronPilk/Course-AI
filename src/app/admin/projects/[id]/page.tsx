import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const supabase = createSupabaseServerClient();

  const { data: project } = await supabase
    .from("course_projects")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!project) notFound();

  const { data: sources } = await supabase
    .from("sources")
    .select(
      "id,type,title,url,status,copyright_risk,token_count,error,created_at"
    )
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .returns<SourceRow[]>();

  const readySources = (sources ?? []).filter((s) => s.status === "ready").length;

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
            <span>Updated {formatDate(project.updated_at)}</span>
          </div>
        </div>
      </header>

      {(project.audience || project.learning_goals) && (
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
            {project.learning_goals && (
              <div>
                <div className="text-xs uppercase tracking-wider text-mutedForeground mb-2">
                  Learning goals
                </div>
                <p>{project.learning_goals}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Source library</h2>
          <p className="text-xs text-mutedForeground">
            {readySources}/{sources?.length ?? 0} ready
          </p>
        </div>
        <SourceManager
          projectId={project.id}
          initialSources={sources ?? []}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Course outline</h2>
        <OutlinePanel
          projectId={project.id}
          outline={(project.outline as Outline | null) ?? null}
          canGenerate={readySources > 0}
        />
      </section>
    </div>
  );
}
