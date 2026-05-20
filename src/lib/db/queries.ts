// Higher-level read queries for the public portal and course player.
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  getDb,
  publishedCourses,
  modules,
  lessons,
  quizzes,
  quizQuestions,
} from "./index";

export type CourseBrand = {
  name?: string;
  logo?: string;
  logoColor?: string;
  gradient?: string[];
  tint?: string;
};

export type PublicCourseCard = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  priceCents: number;
  brand: CourseBrand | null;
};

export async function listPublishedCourses(): Promise<PublicCourseCard[]> {
  const db = getDb();
  const rows = await db
    .select({
      slug: publishedCourses.slug,
      title: publishedCourses.title,
      subtitle: publishedCourses.subtitle,
      description: publishedCourses.description,
      category: publishedCourses.category,
      difficulty: publishedCourses.difficulty,
      durationMinutes: publishedCourses.durationMinutes,
      priceCents: publishedCourses.priceCents,
      metadata: publishedCourses.metadata,
    })
    .from(publishedCourses)
    .where(eq(publishedCourses.isActive, true))
    .orderBy(desc(publishedCourses.publishedAt));

  return rows.map((r) => {
    const meta = safeParseObject(r.metadata);
    const brand =
      meta && typeof meta === "object" && "brand" in meta
        ? ((meta as { brand?: CourseBrand }).brand ?? null)
        : null;
    return {
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      category: r.category,
      difficulty: r.difficulty,
      durationMinutes: r.durationMinutes,
      priceCents: r.priceCents,
      brand,
    };
  });
}

export type PublicCourseDetail = {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  durationMinutes: number | null;
  outcomes: string[];
  prerequisites: string[];
  metadata: Record<string, unknown>;
};

export async function getPublishedCourseBySlug(
  slug: string
): Promise<PublicCourseDetail | null> {
  const db = getDb();
  const row = await db
    .select()
    .from(publishedCourses)
    .where(eq(publishedCourses.slug, slug))
    .get();
  if (!row || !row.isActive) return null;
  return {
    id: row.id,
    projectId: row.projectId,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    durationMinutes: row.durationMinutes,
    outcomes: safeParseArray(row.outcomes),
    prerequisites: safeParseArray(row.prerequisites),
    metadata: safeParseObject(row.metadata),
  };
}

export type ModuleWithLessons = {
  id: string;
  position: number;
  title: string;
  summary: string | null;
  estimatedMinutes: number | null;
  keyConcepts: string[];
  lessons: {
    id: string;
    position: number;
    title: string;
    objective: string | null;
    estimatedMinutes: number | null;
    hasQuiz: boolean;
  }[];
  quiz: { id: string; title: string | null; questionCount: number } | null;
};

export async function getCourseStructure(
  projectId: string
): Promise<ModuleWithLessons[]> {
  const db = getDb();
  const mods = await db
    .select()
    .from(modules)
    .where(eq(modules.projectId, projectId))
    .orderBy(asc(modules.position));

  // Map of lesson_id → bool (does this lesson have a quiz)
  const lessonQuizRows = await db
    .select({ lessonId: quizzes.lessonId })
    .from(quizzes)
    .where(sql`${quizzes.lessonId} IS NOT NULL`);
  const lessonQuizSet = new Set(
    lessonQuizRows.map((r) => r.lessonId).filter((v): v is string => !!v)
  );

  const out: ModuleWithLessons[] = [];
  for (let mi = 0; mi < mods.length; mi++) {
    const m = mods[mi];
    const lessonRows = await db
      .select({
        id: lessons.id,
        position: lessons.position,
        title: lessons.title,
        objective: lessons.objective,
        metadata: lessons.metadata,
      })
      .from(lessons)
      .where(eq(lessons.moduleId, m.id))
      .orderBy(asc(lessons.position));

    // Module-level quiz: moduleId set AND lessonId IS NULL.
    const quizRow = await db
      .select({ id: quizzes.id, title: quizzes.title })
      .from(quizzes)
      .where(
        sql`${quizzes.moduleId} = ${m.id} AND ${quizzes.lessonId} IS NULL`
      )
      .get();

    let quizSummary: ModuleWithLessons["quiz"] = null;
    if (quizRow) {
      const questions = await db
        .select({ id: quizQuestions.id })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizRow.id));
      quizSummary = {
        id: quizRow.id,
        title: quizRow.title,
        questionCount: questions.length,
      };
    }

    // Renumber to 0-indexed array ordinals so the UI never has to think
    // about the raw DB `position` field (which can be 1-indexed when
    // sourced from markdown frontmatter). The DB position stays as the
    // sort key only.
    out.push({
      id: m.id,
      position: mi,
      title: m.title,
      summary: m.summary,
      estimatedMinutes: m.estimatedMinutes,
      keyConcepts: safeParseArray(m.keyConcepts),
      lessons: lessonRows.map((l, li) => ({
        id: l.id,
        position: li,
        title: l.title,
        objective: l.objective,
        estimatedMinutes: parseEstimatedFromMeta(l.metadata),
        hasQuiz: lessonQuizSet.has(l.id),
      })),
      quiz: quizSummary,
    });
  }
  return out;
}

export type LessonDetail = {
  id: string;
  moduleId: string;
  position: number;
  title: string;
  objective: string | null;
  bodyMarkdown: string;
  videos: { title: string; url: string; source?: string }[];
};

export async function getLesson(opts: {
  projectId: string;
  modulePosition: number;
  lessonPosition: number;
}): Promise<LessonDetail | null> {
  const db = getDb();
  const mod = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.projectId, opts.projectId))
    .orderBy(asc(modules.position))
    .all();

  const targetModule = mod[opts.modulePosition];
  if (!targetModule) return null;

  const lessonsInModule = await db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, targetModule.id))
    .orderBy(asc(lessons.position))
    .all();

  const lesson = lessonsInModule[opts.lessonPosition];
  if (!lesson) return null;

  const meta = safeParseObject(lesson.metadata);
  const videos = Array.isArray(meta.videos)
    ? (meta.videos as { title: string; url: string; source?: string }[])
    : [];

  return {
    id: lesson.id,
    moduleId: lesson.moduleId,
    position: lesson.position,
    title: lesson.title,
    objective: lesson.objective,
    bodyMarkdown: lesson.bodyMarkdown ?? "",
    videos,
  };
}

export type QuizQuestionPublic = {
  id: string;
  position: number;
  type: string;
  prompt: string;
  choices: { id: string; text: string }[];
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
};

export async function getModuleQuiz(opts: {
  projectId: string;
  modulePosition: number;
}): Promise<{ title: string | null; questions: QuizQuestionPublic[] } | null> {
  const db = getDb();
  const mod = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.projectId, opts.projectId))
    .orderBy(asc(modules.position))
    .all();
  const target = mod[opts.modulePosition];
  if (!target) return null;

  // Module-level quiz has moduleId set AND lessonId IS NULL.
  const quiz = await db
    .select()
    .from(quizzes)
    .where(
      sql`${quizzes.moduleId} = ${target.id} AND ${quizzes.lessonId} IS NULL`
    )
    .get();
  if (!quiz) return null;

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.position));

  return {
    title: quiz.title,
    questions: questions.map((q) => ({
      id: q.id,
      position: q.position,
      type: q.type,
      prompt: q.prompt,
      choices: safeParseArray<{ id: string; text: string }>(q.choices),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
    })),
  };
}

export async function getLessonQuiz(opts: {
  projectId: string;
  modulePosition: number;
  lessonPosition: number;
}): Promise<{ title: string | null; questions: QuizQuestionPublic[] } | null> {
  const db = getDb();
  const mod = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.projectId, opts.projectId))
    .orderBy(asc(modules.position))
    .all();
  const targetModule = mod[opts.modulePosition];
  if (!targetModule) return null;

  const lessonsInModule = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.moduleId, targetModule.id))
    .orderBy(asc(lessons.position))
    .all();
  const targetLesson = lessonsInModule[opts.lessonPosition];
  if (!targetLesson) return null;

  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.lessonId, targetLesson.id))
    .get();
  if (!quiz) return null;

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.position));

  return {
    title: quiz.title,
    questions: questions.map((q) => ({
      id: q.id,
      position: q.position,
      type: q.type,
      prompt: q.prompt,
      choices: safeParseArray<{ id: string; text: string }>(q.choices),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
    })),
  };
}

export async function lessonHasQuiz(opts: {
  projectId: string;
  modulePosition: number;
  lessonPosition: number;
}): Promise<boolean> {
  const q = await getLessonQuiz(opts);
  return q !== null && q.questions.length > 0;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function safeParseArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function safeParseObject(
  value: string | null | undefined
): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function parseEstimatedFromMeta(meta: string | null): number | null {
  const parsed = safeParseObject(meta);
  return typeof parsed.estimated_minutes === "number"
    ? parsed.estimated_minutes
    : null;
}
