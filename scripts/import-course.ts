#!/usr/bin/env tsx
/**
 * Imports a course directory into the Course Factory database.
 *
 * Usage:
 *   npx tsx scripts/import-course.ts courses/google-search-ai-era
 *
 * The directory must contain:
 *   - outline.json      (course metadata, modules + lessons titles)
 *   - sources.json      (array of source references)
 *   - module-N/         (one folder per module)
 *       NN-<slug>.md    (lesson body, with YAML frontmatter)
 *       quiz.json       (module quiz)
 *
 * Idempotent: re-running replaces previous import for the same slug.
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { eq, sql } from "drizzle-orm";
import {
  getDb,
  courseProjects,
  sources,
  modules,
  lessons,
  lessonChunks,
  quizzes,
  quizQuestions,
  publishedCourses,
} from "../src/lib/db";
import { chunkText } from "../src/lib/ai/chunk";
import { embedTexts } from "../src/lib/ai/embed";
import { scrapeUrl } from "../src/lib/ai/scrape-url";
import { ingestSource, hashContent } from "../src/lib/ai/ingest";

interface OutlineLesson {
  title: string;
  objective?: string;
}
interface OutlineModule {
  title: string;
  summary?: string;
  estimated_minutes?: number;
  key_concepts?: string[];
  lessons: OutlineLesson[];
}
interface OutlineBrand {
  name?: string;
  logo?: string;
  logoColor?: string;
  gradient?: string[];
  tint?: string;
}
interface Outline {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  target_audience?: string;
  audience?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  estimated_minutes?: number;
  prerequisites?: string[];
  outcomes?: string[];
  brand?: OutlineBrand;
  modules: OutlineModule[];
}
interface SourceRecord {
  title?: string;
  url?: string;
  type?: string;
  author?: string;
  license?: string;
}
interface SourcesFile {
  slug: string;
  sources: SourceRecord[];
}
interface LessonFrontmatter {
  module?: number;
  position?: number;
  title?: string;
  objective?: string;
  estimated_minutes?: number;
  videos?: { title: string; url: string; source?: string }[];
}
interface QuizQuestion {
  position: number;
  type: string;
  prompt: string;
  choices?: { id: string; text: string }[];
  correct_answer?: unknown;
  explanation?: string;
  points?: number;
}
interface QuizFile {
  module: number;
  title?: string;
  scoring?: Record<string, unknown>;
  questions: QuizQuestion[];
}

function readJSON<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function* moduleDirs(courseDir: string): Generator<string> {
  const entries = fs
    .readdirSync(courseDir)
    .filter((n) => /^module-\d+$/.test(n))
    .sort((a, b) => {
      const an = Number(a.split("-")[1]);
      const bn = Number(b.split("-")[1]);
      return an - bn;
    });
  for (const e of entries) yield path.join(courseDir, e);
}

function readLessonFiles(moduleDir: string) {
  const files = fs
    .readdirSync(moduleDir)
    .filter((n) => n.endsWith(".md"))
    .sort(); // 01-..., 02-..., 03-...
  return files.map((f) => {
    const full = path.join(moduleDir, f);
    const raw = fs.readFileSync(full, "utf8");
    const parsed = matter(raw);
    // A lesson quiz is colocated as <basename>.quiz.json
    const quizPath = path.join(
      moduleDir,
      f.replace(/\.md$/, ".quiz.json")
    );
    return {
      filename: f,
      basename: f.replace(/\.md$/, ""),
      lessonQuizPath: fs.existsSync(quizPath) ? quizPath : null,
      frontmatter: parsed.data as LessonFrontmatter,
      body: parsed.content.trim(),
    };
  });
}

async function insertQuiz(opts: {
  db: ReturnType<typeof getDb>;
  projectId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  quiz: QuizFile;
  defaultTitle: string;
}) {
  const quizId = randomUUID();
  await opts.db.insert(quizzes).values({
    id: quizId,
    projectId: opts.projectId,
    moduleId: opts.moduleId ?? null,
    lessonId: opts.lessonId ?? null,
    title: opts.quiz.title ?? opts.defaultTitle,
    scoring: JSON.stringify(opts.quiz.scoring ?? {}),
    status: "approved",
  });
  for (const q of opts.quiz.questions) {
    await opts.db.insert(quizQuestions).values({
      id: randomUUID(),
      quizId,
      position: q.position,
      type: q.type,
      prompt: q.prompt,
      choices: JSON.stringify(q.choices ?? []),
      correctAnswer:
        typeof q.correct_answer === "string"
          ? q.correct_answer
          : JSON.stringify(q.correct_answer ?? null),
      explanation: q.explanation ?? null,
      points: q.points ?? 1,
    });
  }
}

async function importCourse(courseDir: string, opts: { skipEmbeddings?: boolean } = {}) {
  const skipEmbeddings = opts.skipEmbeddings ?? false;
  const absDir = path.resolve(courseDir);
  if (!fs.existsSync(absDir)) {
    throw new Error(`Course directory not found: ${absDir}`);
  }
  const outline = readJSON<Outline>(path.join(absDir, "outline.json"));
  if (!outline.slug) {
    throw new Error("outline.json must include a slug");
  }
  const sourcesFile = fs.existsSync(path.join(absDir, "sources.json"))
    ? readJSON<SourcesFile>(path.join(absDir, "sources.json"))
    : { slug: outline.slug, sources: [] };

  const db = getDb();
  const now = Date.now();

  // Find or create the course_projects row for this slug.
  // We use metadata->>slug to key by slug.
  const existing = await db
    .select({ id: courseProjects.id, metadata: courseProjects.metadata })
    .from(courseProjects)
    .where(sql`json_extract(${courseProjects.metadata}, '$.slug') = ${outline.slug}`)
    .get();

  let projectId: string;
  const metadata = JSON.stringify({
    slug: outline.slug,
    source: "course-importer",
    imported_at: new Date(now).toISOString(),
  });

  if (existing) {
    projectId = existing.id;
    await db
      .update(courseProjects)
      .set({
        name: outline.title,
        category: outline.category ?? null,
        difficulty: outline.difficulty ?? null,
        audience: outline.audience ?? outline.target_audience ?? null,
        learningGoals: outline.outcomes?.join("\n") ?? null,
        tags: JSON.stringify(outline.tags ?? []),
        estimatedMinutes: outline.estimated_minutes ?? null,
        status: "published",
        outline: JSON.stringify(outline),
        metadata,
        updatedAt: now,
      })
      .where(eq(courseProjects.id, projectId));

    // Wipe descendants — we'll re-create them. (CASCADE handles modules→lessons→quiz_questions.)
    await db.delete(modules).where(eq(modules.projectId, projectId));
    await db.delete(sources).where(eq(sources.projectId, projectId));
  } else {
    projectId = randomUUID();
    await db.insert(courseProjects).values({
      id: projectId,
      name: outline.title,
      category: outline.category ?? null,
      difficulty: outline.difficulty ?? null,
      audience: outline.audience ?? outline.target_audience ?? null,
      learningGoals: outline.outcomes?.join("\n") ?? null,
      tags: JSON.stringify(outline.tags ?? []),
      estimatedMinutes: outline.estimated_minutes ?? null,
      status: "published",
      outline: JSON.stringify(outline),
      metadata,
    });
  }

  // Ingest sources — scrape, chunk, embed each URL into source_chunks.
  // Pasted-text sources (with no URL) are inserted as metadata only.
  if (sourcesFile.sources.length > 0) {
    console.log(
      `Ingesting ${sourcesFile.sources.length} source(s)${skipEmbeddings ? " (metadata only — embeddings skipped)" : ""}…`
    );
  }
  for (let i = 0; i < sourcesFile.sources.length; i++) {
    const s = sourcesFile.sources[i];
    const sourceId = randomUUID();

    if (skipEmbeddings || !s.url) {
      await db.insert(sources).values({
        id: sourceId,
        projectId,
        type: (s.type as never) ?? "url",
        title: s.title ?? null,
        url: s.url ?? null,
        author: s.author ?? null,
        license: s.license ?? null,
        status: "ready",
        copyrightRisk: "low",
      });
      continue;
    }

    process.stdout.write(
      `  [${i + 1}/${sourcesFile.sources.length}] ${s.url} … `
    );
    try {
      const { title, text, author } = await scrapeUrl(s.url);
      await db.insert(sources).values({
        id: sourceId,
        projectId,
        type: "url",
        title: s.title ?? title,
        url: s.url,
        author: s.author ?? author ?? null,
        license: s.license ?? null,
        rawText: text,
        contentHash: hashContent(text),
        status: "extracting",
        copyrightRisk: "low",
      });
      const result = await ingestSource({
        sourceId,
        projectId,
        rawText: text,
        sourceUrl: s.url,
        license: s.license ?? null,
      });
      if (result.ok) {
        process.stdout.write(`${result.chunks} chunks\n`);
      } else {
        process.stdout.write(`error: ${result.error}\n`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "scrape failed";
      process.stdout.write(`skip (${msg})\n`);
      // Insert a metadata-only row so the source is at least visible.
      await db.insert(sources).values({
        id: sourceId,
        projectId,
        type: "url",
        title: s.title ?? null,
        url: s.url,
        author: s.author ?? null,
        license: s.license ?? null,
        status: "error",
        error: msg,
        copyrightRisk: "unknown",
      });
    }
    // Be polite — give the source server a tiny breather.
    await new Promise((r) => setTimeout(r, 250));
  }

  // Walk module folders, insert modules + lessons + quizzes.
  let modulePosition = 0;
  for (const moduleDir of moduleDirs(absDir)) {
    const moduleNumber = Number(path.basename(moduleDir).split("-")[1]);
    const outlineModule = outline.modules[moduleNumber - 1];
    const moduleId = randomUUID();
    await db.insert(modules).values({
      id: moduleId,
      projectId,
      position: modulePosition,
      title: outlineModule?.title ?? `Module ${moduleNumber}`,
      summary: outlineModule?.summary ?? null,
      estimatedMinutes: outlineModule?.estimated_minutes ?? null,
      keyConcepts: JSON.stringify(outlineModule?.key_concepts ?? []),
      status: "approved",
    });
    modulePosition++;

    const lessonFiles = readLessonFiles(moduleDir);
    for (let i = 0; i < lessonFiles.length; i++) {
      const { frontmatter, body, lessonQuizPath } = lessonFiles[i];
      const lessonId = randomUUID();
      const lessonMeta = JSON.stringify({
        videos: frontmatter.videos ?? [],
        estimated_minutes: frontmatter.estimated_minutes ?? null,
      });
      await db.insert(lessons).values({
        id: lessonId,
        projectId,
        moduleId,
        position: frontmatter.position ?? i,
        title: frontmatter.title ?? `Lesson ${i + 1}`,
        objective: frontmatter.objective ?? null,
        bodyMarkdown: body,
        status: "approved",
        metadata: lessonMeta,
      });

      // Chunk + embed the lesson body so Ask AI can semantically search it.
      if (!skipEmbeddings && body.length > 0) {
        const chunks = chunkText(body);
        if (chunks.length > 0) {
          try {
            const vectors = await embedTexts(chunks.map((c) => c.content));
            const rows = chunks.map((c, idx) => ({
              id: randomUUID(),
              lessonId,
              projectId,
              chunkIndex: c.index,
              content: c.content,
              tokenCount: c.tokenCount,
              embedding: JSON.stringify(vectors[idx]),
            }));
            // Insert in pages.
            const PAGE = 50;
            for (let p = 0; p < rows.length; p += PAGE) {
              await db.insert(lessonChunks).values(rows.slice(p, p + PAGE));
            }
            console.log(
              `  · embedded "${frontmatter.title ?? lessonId}" (${chunks.length} chunks)`
            );
          } catch (e) {
            console.warn(
              `  · embedding failed for "${frontmatter.title ?? lessonId}":`,
              e instanceof Error ? e.message : e
            );
          }
        }
      }

      // Optional per-lesson quiz.
      if (lessonQuizPath) {
        const quiz = readJSON<QuizFile>(lessonQuizPath);
        await insertQuiz({
          db,
          projectId,
          lessonId,
          quiz,
          defaultTitle: `Lesson check: ${frontmatter.title ?? `Lesson ${i + 1}`}`,
        });
      }
    }

    // Optional module quiz.
    const moduleQuizPath = path.join(moduleDir, "quiz.json");
    if (fs.existsSync(moduleQuizPath)) {
      const quiz = readJSON<QuizFile>(moduleQuizPath);
      await insertQuiz({
        db,
        projectId,
        moduleId,
        quiz,
        defaultTitle: `Module ${moduleNumber} quiz`,
      });
    }
  }

  // Create or update the published_courses row.
  const slug = outline.slug;
  const existingPublished = await db
    .select({ id: publishedCourses.id })
    .from(publishedCourses)
    .where(eq(publishedCourses.slug, slug))
    .get();

  const pubFields = {
    projectId,
    slug,
    title: outline.title,
    subtitle: outline.subtitle ?? null,
    description: outline.description,
    category: outline.category ?? null,
    difficulty: outline.difficulty ?? null,
    durationMinutes: outline.estimated_minutes ?? null,
    outcomes: JSON.stringify(outline.outcomes ?? []),
    prerequisites: JSON.stringify(outline.prerequisites ?? []),
    isActive: true,
    metadata: JSON.stringify({
      target_audience: outline.target_audience ?? outline.audience ?? null,
      tags: outline.tags ?? [],
      brand: outline.brand ?? null,
    }),
  };

  if (existingPublished) {
    await db
      .update(publishedCourses)
      .set(pubFields)
      .where(eq(publishedCourses.id, existingPublished.id));
  } else {
    await db
      .insert(publishedCourses)
      .values({ id: randomUUID(), ...pubFields });
  }

  return { projectId, slug, moduleCount: modulePosition };
}

async function main() {
  const args = process.argv.slice(2);
  const courseDir = args.find((a) => !a.startsWith("--"));
  const skipEmbeddings = args.includes("--skip-embeddings");

  if (!courseDir) {
    console.error(
      "Usage: npx tsx scripts/import-course.ts <course-dir> [--skip-embeddings]\n" +
        "Example: npx tsx scripts/import-course.ts courses/google-search-ai-era"
    );
    process.exit(1);
  }
  try {
    const result = await importCourse(courseDir, { skipEmbeddings });
    console.log(
      `✔ Imported "${result.slug}" — ${result.moduleCount} module(s). Project id: ${result.projectId}`
    );
    if (skipEmbeddings) {
      console.log(
        "  (skipped embeddings — Ask AI won't work for this course until you re-import without --skip-embeddings)"
      );
    }
    process.exit(0);
  } catch (e) {
    console.error("✖ Import failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
