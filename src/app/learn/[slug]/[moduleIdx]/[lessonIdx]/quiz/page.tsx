import { notFound } from "next/navigation";
import {
  getCourseStructure,
  getLessonQuiz,
  getPublishedCourseBySlug,
} from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";
import { LearnShell } from "@/components/public/learn-shell";
import { QuizRunner } from "@/components/public/quiz-runner";
import type { SidebarModule } from "@/components/public/lesson-sidebar";

export const dynamic = "force-dynamic";

export default async function LessonQuizPage({
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

  const quiz = await getLessonQuiz({
    projectId: course.projectId,
    modulePosition: moduleIdx,
    lessonPosition: lessonIdx,
  });
  if (!quiz) notFound();

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

  // After the lesson quiz, "Next" goes to the next lesson, or the module quiz, or the next module.
  let nextHref: string | null = null;
  if (lessonIdx < moduleStruct.lessons.length - 1) {
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
        <main className="px-6 sm:px-12 py-10 max-w-2xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-mutedForeground">
              Module {moduleIdx + 1} · Lesson {lessonIdx + 1} · Quick check
            </p>
            <h1 className="text-3xl font-semibold tracking-tight mt-2">
              {quiz.title ?? "Quick check"}
            </h1>
            <p className="text-sm text-mutedForeground mt-2">
              A short check to confirm the key ideas landed. You can retake it
              as often as you want.
            </p>
          </div>
          <QuizRunner
            questions={quiz.questions}
            nextHref={nextHref}
            backHref={`/learn/${params.slug}/${moduleIdx}/${lessonIdx}`}
            pointKey={`lesson-quiz:${params.slug}:${moduleIdx}:${lessonIdx}`}
            kind="lesson"
          />
        </main>
      </LearnShell>
    </div>
  );
}
