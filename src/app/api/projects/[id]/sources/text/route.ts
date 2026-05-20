// POST /api/projects/:id/sources/text
// Body: { title, text, author?, url?, license? }
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getProfile } from "@/lib/auth";
import { getDb, sources } from "@/lib/db";
import { addTextSourceSchema } from "@/lib/validators";
import { ingestSource, hashContent } from "@/lib/ai/ingest";
import { cleanText } from "@/lib/ai/extract-pdf";

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
  const parsed = addTextSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const { title, text, author, url, license } = parsed.data;
  const cleaned = cleanText(text);

  const db = getDb();
  const id = randomUUID();
  await db.insert(sources).values({
    id,
    projectId: params.id,
    type: "text",
    title,
    author: author ?? null,
    url: url ?? null,
    license: license ?? null,
    rawText: cleaned,
    contentHash: hashContent(cleaned),
    status: "chunking",
  });

  const result = await ingestSource({
    sourceId: id,
    projectId: params.id,
    rawText: cleaned,
    sourceUrl: url ?? null,
    license: license ?? null,
  });

  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ id, ...result });
}
