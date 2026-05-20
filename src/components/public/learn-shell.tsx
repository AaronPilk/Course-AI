"use client";

import { LessonSidebar, type SidebarModule } from "./lesson-sidebar";
import { useCompletedLessons } from "./lesson-footer";

export function LearnShell({
  slug,
  modules,
  currentModule,
  currentLesson,
  isQuiz,
  children,
}: {
  slug: string;
  modules: SidebarModule[];
  currentModule: number;
  currentLesson?: number;
  isQuiz?: boolean;
  children: React.ReactNode;
}) {
  const completed = useCompletedLessons();
  return (
    <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-4rem)]">
      <LessonSidebar
        slug={slug}
        modules={modules}
        currentModule={currentModule}
        currentLesson={currentLesson}
        isQuiz={isQuiz}
        completedLessons={completed}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
