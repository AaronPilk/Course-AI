import Link from "next/link";
import { Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb, courseProjects } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  await requireAdmin();
  const db = getDb();
  const projects = await db
    .select({
      id: courseProjects.id,
      name: courseProjects.name,
      category: courseProjects.category,
      difficulty: courseProjects.difficulty,
      status: courseProjects.status,
      tags: courseProjects.tags,
      updatedAt: courseProjects.updatedAt,
    })
    .from(courseProjects)
    .orderBy(desc(courseProjects.updatedAt));

  return (
    <div className="px-8 py-10 max-w-6xl space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-mutedForeground">
            Course projects
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            All projects
          </h1>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="size-4" />
            New project
          </Button>
        </Link>
      </header>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-mutedForeground">
            No projects yet — create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const tags: string[] = (() => {
              try {
                return JSON.parse(p.tags) as string[];
              } catch {
                return [];
              }
            })();
            return (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <Card className="hover:shadow-float transition cursor-pointer">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      <Badge tone="neutral" className="capitalize">
                        {p.status.replace(/_/g, " ")}
                      </Badge>
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
                      <span>Updated {formatDate(new Date(p.updatedAt))}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] uppercase tracking-wider text-mutedForeground bg-muted px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
