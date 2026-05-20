// POST /api/projects/:id/sources/url
// Body: { url: string, title?: string }
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, sources } from "@/lib/db";
import { addUrlSourceSchema } from "@/lib/validators";
import { scrapeUrl } from "@/lib/ai/scrape-url";
import { ingestSource, hashContent } from "@/lib/ai/ingest";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = addUrlSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const { url, title: titleOverride } = parsed.data;

  const db = getDb();
  const sourceId = randomUUID();

  await db.insert(sources).values({
    id: sourceId,
    projectId: params.id,
    type: "url",
    url,
    title: titleOverride ?? url,
    status: "extracting",
  });

  try {
    const { title, text, author } = await scrapeUrl(url);

    await db
      .update(sources)
      .set({
        title: titleOverride ?? title,
        author: author ?? null,
        rawText: text,
        contentHash: hashContent(text),
        updatedAt: Date.now(),
      })
      .where(eq(sources.id, sourceId));

    const result = await ingestSource({
      sourceId,
      projectId: params.id,
      rawText: text,
      sourceUrl: url,
      license: null,
    });
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({
      id: sourceId,
      chunks: result.chunks,
      tokens: result.tokens,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Scrape failed";
    await db
      .update(sources)
      .set({ status: "error", error: msg, updatedAt: Date.now() })
      .where(eq(sources.id, sourceId));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
