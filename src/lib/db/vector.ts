// In-memory vector search. Stand-in for pgvector while we're on SQLite.
// Fine for thousands of chunks; we'd swap to sqlite-vec or pgvector at
// larger scale.
import { getDb, sourceChunks } from "./index";
import { eq } from "drizzle-orm";

export interface ChunkMatch {
  id: string;
  sourceId: string;
  content: string;
  similarity: number;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export async function matchChunks(opts: {
  projectId: string;
  query: number[];
  matchCount?: number;
}): Promise<ChunkMatch[]> {
  const { projectId, query, matchCount = 8 } = opts;
  const db = getDb();
  const rows = await db
    .select({
      id: sourceChunks.id,
      sourceId: sourceChunks.sourceId,
      content: sourceChunks.content,
      embedding: sourceChunks.embedding,
    })
    .from(sourceChunks)
    .where(eq(sourceChunks.projectId, projectId));

  const scored: ChunkMatch[] = [];
  for (const r of rows) {
    if (!r.embedding) continue;
    let vec: number[];
    try {
      vec = JSON.parse(r.embedding) as number[];
    } catch {
      continue;
    }
    const sim = cosineSimilarity(query, vec);
    scored.push({
      id: r.id,
      sourceId: r.sourceId,
      content: r.content,
      similarity: sim,
    });
  }
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, matchCount);
}
