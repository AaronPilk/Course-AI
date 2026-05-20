// Shared ingestion pipeline. Given a source row whose raw_text has been
// populated, runs: chunk → embed → persist chunks → update status.
// Uses the local SQLite database via Drizzle.
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";
import { scoreCopyrightRisk } from "./risk";
import { getDb, sources, sourceChunks } from "@/lib/db";

export async function ingestSource(opts: {
  sourceId: string;
  projectId: string;
  rawText: string;
  sourceUrl?: string | null;
  license?: string | null;
}) {
  const db = getDb();
  const { sourceId, projectId, rawText } = opts;

  // 1. Chunk
  await db
    .update(sources)
    .set({ status: "chunking", updatedAt: Date.now() })
    .where(eq(sources.id, sourceId));

  const chunks = chunkText(rawText);
  if (chunks.length === 0) {
    await db
      .update(sources)
      .set({
        status: "error",
        error: "No usable text after cleaning. Try a different source.",
        updatedAt: Date.now(),
      })
      .where(eq(sources.id, sourceId));
    return { ok: false as const, error: "empty text" };
  }

  // 2. Embed (batched)
  await db
    .update(sources)
    .set({ status: "embedding", updatedAt: Date.now() })
    .where(eq(sources.id, sourceId));

  let vectors: number[][];
  try {
    vectors = await embedTexts(chunks.map((c) => c.content));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Embedding failed";
    await db
      .update(sources)
      .set({ status: "error", error: msg, updatedAt: Date.now() })
      .where(eq(sources.id, sourceId));
    return { ok: false as const, error: msg };
  }

  // 3. Persist chunks. Drop prior chunks for idempotent re-ingest.
  await db.delete(sourceChunks).where(eq(sourceChunks.sourceId, sourceId));

  const rows = chunks.map((c, i) => ({
    id: randomUUID(),
    projectId,
    sourceId,
    chunkIndex: c.index,
    content: c.content,
    tokenCount: c.tokenCount,
    embedding: JSON.stringify(vectors[i]),
  }));

  // Insert in pages to avoid SQLite's compound-statement limits.
  const PAGE = 100;
  for (let i = 0; i < rows.length; i += PAGE) {
    await db.insert(sourceChunks).values(rows.slice(i, i + PAGE));
  }

  // 4. Score risk, finalize source row.
  const risk = scoreCopyrightRisk({
    source: { url: opts.sourceUrl ?? null, license: opts.license ?? null },
    text: rawText,
  });
  const totalTokens = chunks.reduce((a, c) => a + c.tokenCount, 0);

  await db
    .update(sources)
    .set({
      status: "ready",
      tokenCount: totalTokens,
      copyrightRisk: risk,
      error: null,
      updatedAt: Date.now(),
    })
    .where(eq(sources.id, sourceId));

  return { ok: true as const, chunks: chunks.length, tokens: totalTokens };
}

export function hashContent(text: string): string {
  // Fast non-crypto hash to dedupe re-uploads of the same source within a project.
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
  return (h >>> 0).toString(16);
}
