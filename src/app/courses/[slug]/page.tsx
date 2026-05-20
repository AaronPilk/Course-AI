import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, GraduationCap } from "lucide-react";
import {
  getPublishedCourseBySlug,
  getCourseStructure,
} from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";

export const dynamic = "force-dynamic";

export default async function CourseLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getPublishedCourseBySlug(params.slug);
  if (!course) notFound();

  const structure = await getCourseStructure(course.projectId);
  const totalLessons = structure.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* ─── Hero ─── */}
      <section className="course-hero-gradient border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {course.category && (
              <span className="inline-flex px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs uppercase tracking-wider font-medium">
                {course.category}
              </span>
            )}
            {course.difficulty && (
              <span className="inline-flex px-3 py-1 rounded-full bg-muted text-mutedForeground text-xs capitalize">
                {course.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="text-xl sm:text-2xl text-mutedForeground max-w-3xl leading-relaxed mb-8">
              {course.subtitle}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-mutedForeground flex-wrap mb-10">
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4" />
              {course.durationMinutes
                ? `${Math.round((course.durationMinutes / 60) * 10) / 10} hours`
                : "—"}
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="size-4" />
              {totalLessons} lessons across {structure.length} modules
            </span>
          </div>

          <Link
            href={`/learn/${course.slug}`}
            className="inline-flex h-14 items-center justify-center rounded-full bg-accent text-accent-foreground px-8 text-base font-semibold hover:bg-accent/90 transition-all gap-2 shadow-cinematic"
          >
            Start the course
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* ─── Description ─── */}
        {course.description && (
          <section>
            <p className="text-lg leading-relaxed text-mutedForeground max-w-3xl">
              {course.description}
            </p>
          </section>
        )}

        {/* ─── Outcomes ─── */}
        {course.outcomes.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-wider text-accent mb-3">
              What you&apos;ll be able to do
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
              By the end of this course, you can —
            </h2>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-cinematic">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {course.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-accent/10 border border-accent/30 grid place-items-center shrink-0 mt-0.5">
                      <Check className="size-3 text-accent" />
                    </span>
                    <span className="leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── Prerequisites ─── */}
        {course.prerequisites.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-wider text-accent mb-3">
              Prerequisites
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
              What you&apos;ll want to bring
            </h2>
            <ul className="space-y-3 text-sm max-w-3xl">
              {course.prerequisites.map((p, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed">
                  <span className="text-accent mt-1">·</span>
                  <span className="text-mutedForeground">{p}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ─── Curriculum ─── */}
        <section>
          <p className="text-xs uppercase tracking-wider text-accent mb-3">
            The curriculum
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
            What we&apos;ll cover
          </h2>
          <div className="space-y-3">
            {structure.map((m, i) => (
              <div
                key={m.id}
                className="rounded-2xl border border-border bg-card p-6 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-bold text-accent tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold text-lg">{m.title}</h3>
                  </div>
                  {m.estimatedMinutes && (
                    <span className="text-xs text-mutedForeground">
                      {m.estimatedMinutes} min
                    </span>
                  )}
                </div>
                {m.summary && (
                  <p className="text-sm text-mutedForeground leading-relaxed mb-4">
                    {m.summary}
                  </p>
                )}
                <ul className="text-sm space-y-2 pl-10 list-none">
                  {m.lessons.map((l, j) => (
                    <li
                      key={l.id}
                      className="flex items-start gap-3 leading-relaxed"
                    >
                      <span className="text-mutedForeground tabular-nums shrink-0 mt-0.5">
                        {i + 1}.{j + 1}
                      </span>
                      <span>{l.title}</span>
                    </li>
                  ))}
                  {m.quiz && (
                    <li className="text-xs uppercase tracking-wider text-accent pl-7 pt-1">
                      Module quiz · {m.quiz.questionCount} questions
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="text-center py-8">
          <Link
            href={`/learn/${course.slug}`}
            className="inline-flex h-14 items-center justify-center rounded-full bg-accent text-accent-foreground px-8 text-base font-semibold hover:bg-accent/90 transition-all gap-2 shadow-cinematic"
          >
            Start the course
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
