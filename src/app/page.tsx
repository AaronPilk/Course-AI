import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { listPublishedCourses } from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";
import { CourseTile } from "@/components/public/course-tile";
import { CourseFactoryMark } from "@/components/public/course-factory-mark";
import { CategoryMarquee } from "@/components/public/category-marquee";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* ─── Hero ─── */}
        <section className="hero-glow relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 pt-10 pb-14 sm:pt-14 sm:pb-18 text-center flex flex-col items-center gap-6">
            <CourseFactoryMark className="size-20 sm:size-24 text-accent dark:text-white" />
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] text-gradient-purple">
              Learn things you wish
              <br />
              you&apos;d known sooner.
            </h1>
            <p className="text-lg sm:text-xl text-mutedForeground max-w-2xl mx-auto leading-relaxed">
              Original courses built from primary sources, written for clarity,
              designed for the AI search era.
            </p>
            <div className="flex flex-col items-center gap-4 pt-2">
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-accent-foreground px-7 text-base font-semibold hover:bg-accent/90 transition-all gap-2 shadow-cinematic"
              >
                Browse courses
                <ArrowRight className="size-4" />
              </Link>
              <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-mutedForeground">
                <Sparkles className="size-3.5" />
                Premium courses, manufactured with AI
              </p>
            </div>
          </div>
        </section>

        {/* ─── Scope marquee ─── */}
        <CategoryMarquee />

        {/* ─── Featured courses ─── */}
        <section className="border-t border-border/60">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <p className="text-xs uppercase tracking-wider text-accent mb-2">
                  The library
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Featured courses
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-sm text-mutedForeground hover:text-foreground transition-colors hidden sm:inline-flex items-center gap-1"
              >
                All courses
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-mutedForeground space-y-3">
                <p>No courses published yet.</p>
                <p className="text-xs">
                  Run{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">
                    npm run import-course courses/google-search-ai-era
                  </code>{" "}
                  to load a course.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((c) => (
                  <CourseTile key={c.slug} course={c} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border/60">
          <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between text-xs text-mutedForeground">
            <span>© 2026 Course Factory</span>
            <span>Made for serious learners.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

