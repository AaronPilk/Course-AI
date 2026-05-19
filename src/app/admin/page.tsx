import Link from "next/link";
import { Plus, FileStack, Zap, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  name: string;
  category: string | null;
  difficulty: string | null;
  status: string;
  tags: string[];
  updated_at: string;
};

type JobRow = {
  id: string;
  type: string;
  status: string;
  progress: number;
  created_at: string;
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createSupabaseServerClient();

  const [{ data: projects }, { data: jobs }, { count: sourceCount }] =
    await Promise.all([
      supabase
        .from("course_projects")
        .select("id,name,category,difficulty,status,tags,updated_at")
        .order("updated_at", { ascending: false })
        .limit(8)
        .returns<ProjectRow[]>(),
      supabase
        .from("processing_jobs")
        .select("id,type,status,progress,created_at")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<JobRow[]>(),
      supabase.from("sources").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      label: "Course projects",
      value: projects?.length ?? 0,
      icon: FileStack,
    },
    {
      label: "Sources ingested",
      value: sourceCount ?? 0,
      icon: ShieldCheck,
    },
    {
      label: "Active jobs",
      value: jobs?.filter((j) => j.status === "running").length ?? 0,
      icon: Zap,
    },
  ];

  return (
    <div className="px-8 py-10 space-y-10 max-w-6xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-mutedForeground">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            Course Factory
          </h1>
          <p className="text-mutedForeground mt-1 max-w-xl">
            Turn deep technical sources into structured premium courses.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="size-4" />
            New course project
          </Button>
        </Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-mutedForeground">
                    {s.label}
                  </div>
                  <div className="text-3xl font-semibold mt-1">{s.value}</div>
                </div>
                <div className="size-10 rounded-xl bg-muted grid place-items-center text-mutedForeground">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent projects</h2>
          <Link
            href="/admin/projects"
            className="text-sm text-mutedForeground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        {(projects?.length ?? 0) === 0 ? (
          <EmptyProjects />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects!.map((p) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <Card className="hover:shadow-float transition cursor-pointer">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="text-xs text-mutedForeground flex items-center gap-2">
                      {p.category && <span>{p.category}</span>}
                      {p.difficulty && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{p.difficulty}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Updated {formatDate(p.updated_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Processing queue</h2>
        {(jobs?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-mutedForeground">
              No background jobs yet. They&apos;ll appear here as you ingest
              sources and generate content.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {jobs!.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div>
                      <div className="text-sm font-medium">{j.type}</div>
                      <div className="text-xs text-mutedForeground">
                        {formatDate(j.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={j.status} />
                      <span className="text-xs text-mutedForeground tabular-nums">
                        {Math.round(j.progress)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function EmptyProjects() {
  return (
    <Card>
      <CardContent className="py-14 text-center space-y-3">
        <div className="mx-auto size-12 rounded-2xl bg-muted grid place-items-center">
          <FileStack className="size-5 text-mutedForeground" />
        </div>
        <div>
          <h3 className="font-medium">Start your first course project</h3>
          <p className="text-sm text-mutedForeground max-w-md mx-auto mt-1">
            Define the topic, add some sources, and let the factory generate an
            outline. You stay in control through every step.
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="mt-2">
            <Plus className="size-4" />
            New course project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "success"
      : status === "review" || status === "outline_ready"
        ? "accent"
        : status === "failed" || status === "error"
          ? "danger"
          : status === "running" || status === "generating" || status === "ingesting"
            ? "warn"
            : "neutral";
  return (
    <Badge tone={tone as never} className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
