// Shared ingestion pipeline. Given a source row whose raw_text has been
// populated, runs: chunk → embed → persist chunks → update status.
//
// Uses the service-role client so writes succeed even when called from an
// API route on behalf of an admin. We've already verified ownership at the
// route layer.
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";
import { scoreCopyrightRisk } from "./risk";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ingestSource(opts: {
  sourceId: string;
  projectId: string;
  rawText: string;
  sourceUrl?: string | null;
  license?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const { sourceId, projectId, rawText } = opts;

  // 1. Chunk
  await admin
    .from("sources")
    .update({ status: "chunking" })
    .eq("id", sourceId);

  const chunks = chunkText(rawText);
  if (chunks.length === 0) {
    await admin
      .from("sources")
      .update({
        status: "error",
        error: "No usable text after cleaning. Try a different source.",
      })
      .eq("id", sourceId);
    return { ok: false as const, error: "empty text" };
  }

  // 2. Embed (batched)
  await admin
    .from("sources")
    .update({ status: "embedding" })
    .eq("id", sourceId);

  let vectors: number[][];
  try {
    vectors = await embedTexts(chunks.map((c) => c.content));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Embedding failed";
    await admin
      .from("sources")
      .update({ status: "error", error: msg })
      .eq("id", sourceId);
    return { ok: false as const, error: msg };
  }

  // 3. Persist chunks
  const rows = chunks.map((c, i) => ({
    project_id: projectId,
    source_id: sourceId,
    chunk_index: c.index,
    content: c.content,
    token_count: c.tokenCount,
    embedding: vectors[i] as unknown as string, // pgvector accepts JSON arrays
  }));

  // Drop any previous chunks for this source (idempotent re-ingest).
  await admin.from("source_chunks").delete().eq("source_id", sourceId);

  // Insert in pages to keep payloads small.
  const PAGE = 50;
  for (let i = 0; i < rows.length; i += PAGE) {
    const { error } = await admin
      .from("source_chunks")
      .insert(rows.slice(i, i + PAGE));
    if (error) {
      await admin
        .from("sources")
        .update({ status: "error", error: error.message })
        .eq("id", sourceId);
      return { ok: false as const, error: error.message };
    }
  }

  // 4. Score risk, finalize source row.
  const risk = scoreCopyrightRisk({
    source: { url: opts.sourceUrl, license: opts.license },
    text: rawText,
  });
  const totalTokens = chunks.reduce((a, c) => a + c.tokenCount, 0);

  await admin
    .from("sources")
    .update({
      status: "ready",
      token_count: totalTokens,
      copyright_risk: risk,
      error: null,
    })
    .eq("id", sourceId);

  return { ok: true as const, chunks: chunks.length, tokens: totalTokens };
}

export function hashContent(text: string): string {
  // Fast non-crypto hash to dedupe re-uploads of the same source within a
  // project. djb2-ish.
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
  return (h >>> 0).toString(16);
}
