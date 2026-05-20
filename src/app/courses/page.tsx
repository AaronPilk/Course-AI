import { listPublishedCourses } from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";
import { CourseTile } from "@/components/public/course-tile";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-wider text-accent mb-3">
            The library
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            All courses
          </h1>
          <p className="text-mutedForeground mt-3 max-w-2xl text-lg leading-relaxed">
            Every course is built from primary sources, written so anyone can
            follow, and structured to give you a real mental model — not a
            list of hacks.
          </p>
        </header>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-mutedForeground">
            No courses published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseTile key={c.slug} course={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
