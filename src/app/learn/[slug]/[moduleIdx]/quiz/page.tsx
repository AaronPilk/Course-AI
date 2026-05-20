import { notFound } from "next/navigation";
import {
  getCourseStructure,
  getModuleQuiz,
  getPublishedCourseBySlug,
} from "@/lib/db/queries";
import { PublicHeader } from "@/components/public/header";
import { LearnShell } from "@/components/public/learn-shell";
import { QuizRunner } from "@/components/public/quiz-runner";
import type { SidebarModule } from "@/components/public/lesson-sidebar";

export const dynamic = "force-dynamic";

export default async function ModuleQuizPage({
  params,
}: {
  params: { slug: string; moduleIdx: string };
}) {
  const moduleIdx = Number(params.moduleIdx);
  if (!Number.isFinite(moduleIdx)) notFound();

  const course = await getPublishedCourseBySlug(params.slug);
  if (!course) notFound();

  const structure = await getCourseStructure(course.projectId);
  const moduleStruct = structure[moduleIdx];
  if (!moduleStruct) notFound();

  const quiz = await getModuleQuiz({
    projectId: course.projectId,
    modulePosition: moduleIdx,
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

  const nextHref =
    moduleIdx < structure.length - 1
      ? `/learn/${params.slug}/${moduleIdx + 1}/0`
      : null;

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <LearnShell
        slug={params.slug}
        modules={sidebarModules}
        currentModule={moduleIdx}
        isQuiz
      >
        <main className="px-6 sm:px-12 py-10 max-w-2xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-mutedForeground">
              Module {moduleIdx + 1} · Quiz
            </p>
            <h1 className="text-3xl font-semibold tracking-tight mt-2">
              {quiz.title ?? "Module quiz"}
            </h1>
          </div>
          <QuizRunner
            questions={quiz.questions}
            nextHref={nextHref}
            backHref={`/learn/${params.slug}/${moduleIdx}/${moduleStruct.lessons.length - 1}`}
            pointKey={`module-quiz:${params.slug}:${moduleIdx}`}
            kind="module"
          />
        </main>
      </LearnShell>
    </div>
  );
}
