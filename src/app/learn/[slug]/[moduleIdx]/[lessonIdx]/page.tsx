import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import {
  getCourseStructure,
  getLesson,
  getPublishedCourseBySlug,
} from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";
import { LearnShell } from "@/components/public/learn-shell";
import { LessonBody } from "@/components/public/lesson-body";
import { LessonFooter } from "@/components/public/lesson-footer";
import { LessonRightRail } from "@/components/public/right-rail";
import type { SidebarModule } from "@/components/public/lesson-sidebar";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; moduleIdx: string; lessonIdx: string };
}) {
  const moduleIdx = Number(params.moduleIdx);
  const lessonIdx = Number(params.lessonIdx);
  if (!Number.isFinite(moduleIdx) || !Number.isFinite(lessonIdx)) notFound();

  const course = await getPublishedCourseBySlug(params.slug);
  if (!course) notFound();

  const structure = await getCourseStructure(course.projectId);
  const moduleStruct = structure[moduleIdx];
  if (!moduleStruct) notFound();
  const lessonStruct = moduleStruct.lessons[lessonIdx];
  if (!lessonStruct) notFound();

  const lesson = await getLesson({
    projectId: course.projectId,
    modulePosition: moduleIdx,
    lessonPosition: lessonIdx,
  });
  if (!lesson) notFound();

  const sidebarModules: SidebarModule[] = structure.map((m) => ({
    position: m.position,
    title: m.title,
    hasQuiz: !!m.quiz,
    lessons: m.lessons.map((l) => ({
      position: l.position,
      title: l.title,
      hasQuiz: l.hasQuiz,
    })),
  }));

  // Compute prev/next hrefs
  let prevHref: string | null = null;
  let nextHref: string | null = null;

  if (lessonIdx > 0) {
    prevHref = `/learn/${params.slug}/${moduleIdx}/${lessonIdx - 1}`;
  } else if (moduleIdx > 0) {
    const prevModule = structure[moduleIdx - 1];
    const prevLastLessonIdx = prevModule.lessons.length - 1;
    // If previous module has a quiz, route there instead.
    prevHref = prevModule.quiz
      ? `/learn/${params.slug}/${moduleIdx - 1}/quiz`
      : `/learn/${params.slug}/${moduleIdx - 1}/${prevLastLessonIdx}`;
  }

  // After this lesson: lesson quiz first (if any), else next lesson, else module quiz, else next module.
  if (lessonStruct.hasQuiz) {
    nextHref = `/learn/${params.slug}/${moduleIdx}/${lessonIdx}/quiz`;
  } else if (lessonIdx < moduleStruct.lessons.length - 1) {
    nextHref = `/learn/${params.slug}/${moduleIdx}/${lessonIdx + 1}`;
  } else if (moduleStruct.quiz) {
    nextHref = `/learn/${params.slug}/${moduleIdx}/quiz`;
  } else if (moduleIdx < structure.length - 1) {
    nextHref = `/learn/${params.slug}/${moduleIdx + 1}/0`;
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <LearnShell
        slug={params.slug}
        modules={sidebarModules}
        currentModule={moduleIdx}
        currentLesson={lessonIdx}
      >
        <div className="flex justify-center">
          <main className="flex-1 min-w-0 px-6 sm:px-12 py-12 max-w-3xl">
            <div className="mb-10 pb-6 border-b border-border/60">
              <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-2">
                Module {moduleIdx + 1} · Lesson {lessonIdx + 1}
              </p>
              {lesson.objective && (
                <p className="text-sm text-mutedForeground leading-relaxed mt-3">
                  <span className="text-foreground font-medium">
                    By the end you can:
                  </span>{" "}
                  {lesson.objective}
                </p>
              )}
            </div>

            <LessonBody markdown={lesson.bodyMarkdown} />

            {lesson.videos.length > 0 && (
              <section className="mt-16 border-t border-border/60 pt-10">
                <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-4">
                  Watch
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lesson.videos.map((v) => (
                    <a
                      key={v.url}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl border border-border bg-card hover:border-accent/40 transition-all overflow-hidden flex flex-col"
                    >
                      <div
                        className="relative h-32 overflow-hidden"
                        style={{
                          background: `
                            radial-gradient(circle at 50% 50%, hsl(263 80% 56% / 0.35) 0%, transparent 60%),
                            linear-gradient(135deg, hsl(0 0% 8%) 0%, hsl(263 30% 12%) 100%)
                          `,
                        }}
                      >
                        <div className="absolute inset-0 grid place-items-center">
                          <span className="size-12 rounded-full bg-background/70 backdrop-blur grid place-items-center group-hover:bg-accent transition-colors">
                            <PlayCircle className="size-6 text-accent group-hover:text-accent-foreground transition-colors" />
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <div className="font-medium text-sm leading-snug">
                          {v.title}
                        </div>
                        {v.source && (
                          <div className="text-xs text-mutedForeground">
                            {v.source}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <LessonFooter
              slug={params.slug}
              moduleIdx={moduleIdx}
              lessonIdx={lessonIdx}
              prevHref={prevHref}
              nextHref={nextHref}
            />
          </main>

          <aside className="hidden xl:block w-[420px] shrink-0 pr-6 py-10">
            <div className="sticky top-24">
              <LessonRightRail
                slug={params.slug}
                moduleIdx={moduleIdx}
                lessonIdx={lessonIdx}
                lessonTitle={lesson.title}
                moduleTitle={moduleStruct.title}
              />
            </div>
          </aside>
        </div>
      </LearnShell>
    </div>
  );
}
