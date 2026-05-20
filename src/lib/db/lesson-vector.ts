// In-memory cosine similarity search over lesson_chunks for a specific course.
// Mirrors lib/db/vector.ts but searches lesson bodies instead of source chunks.
import { eq } from "drizzle-orm";
import { getDb, lessonChunks, lessons, modules } from "./index";
import { cosineSimilarity } from "./vector";

export interface LessonMatch {
  chunkId: string;
  lessonId: string;
  moduleId: string;
  modulePosition: number;
  lessonPosition: number;
  lessonTitle: string;
  moduleTitle: string;
  content: string;
  similarity: number;
}

export async function matchLessonChunks(opts: {
  projectId: string;
  query: number[];
  matchCount?: number;
}): Promise<LessonMatch[]> {
  const { projectId, query, matchCount = 6 } = opts;
  const db = getDb();

  // Pull chunks + lesson/module positions in one walk.
  const rows = await db
    .select({
      chunkId: lessonChunks.id,
      lessonId: lessonChunks.lessonId,
      content: lessonChunks.content,
      embedding: lessonChunks.embedding,
      moduleId: lessons.moduleId,
      lessonPosition: lessons.position,
      lessonTitle: lessons.title,
    })
    .from(lessonChunks)
    .innerJoin(lessons, eq(lessons.id, lessonChunks.lessonId))
    .where(eq(lessonChunks.projectId, projectId));

  // We need module positions + titles too. One query per project (small).
  const mods = await db
    .select({
      id: modules.id,
      position: modules.position,
      title: modules.title,
    })
    .from(modules)
    .where(eq(modules.projectId, projectId));
  const modMap = new Map(mods.map((m) => [m.id, m]));

  const scored: LessonMatch[] = [];
  for (const r of rows) {
    if (!r.embedding) continue;
    let vec: number[];
    try {
      vec = JSON.parse(r.embedding) as number[];
    } catch {
      continue;
    }
    const sim = cosineSimilarity(query, vec);
    const mod = modMap.get(r.moduleId);
    if (!mod) continue;
    scored.push({
      chunkId: r.chunkId,
      lessonId: r.lessonId,
      moduleId: r.moduleId,
      modulePosition: mod.position,
      lessonPosition: r.lessonPosition,
      lessonTitle: r.lessonTitle,
      moduleTitle: mod.title,
      content: r.content,
      similarity: sim,
    });
  }
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, matchCount);
}
