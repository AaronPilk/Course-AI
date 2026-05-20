// POST /api/projects/:id/sources/upload  (multipart/form-data, field "file")
// Accepts a PDF, extracts text, stores the original under .local-data/sources/,
// then runs the ingestion pipeline.
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, sources, getSourcesDir } from "@/lib/db";
import { extractPdfText } from "@/lib/ai/extract-pdf";
import { ingestSource, hashContent } from "@/lib/ai/ingest";

export const runtime = "nodejs";
export const maxDuration = 180;

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "no file" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json(
      { error: "file too large (max 25MB)" },
      { status: 413 }
    );
  if (file.type && !file.type.includes("pdf"))
    return NextResponse.json(
      { error: "only PDF files supported" },
      { status: 415 }
    );

  const db = getDb();
  const sourceId = randomUUID();

  await db.insert(sources).values({
    id: sourceId,
    projectId: params.id,
    type: "pdf",
    title: file.name,
    status: "extracting",
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Persist the original to .local-data/sources/{projectId}/{sourceId}.pdf
    const projectDir = path.join(getSourcesDir(), params.id);
    await fs.mkdir(projectDir, { recursive: true });
    const storagePath = path.join(projectDir, `${sourceId}.pdf`);
    await fs.writeFile(storagePath, buffer);

    const text = await extractPdfText(buffer);
    if (text.trim().length < 100) {
      throw new Error(
        "Couldn't extract text from this PDF. It may be scanned — OCR isn't enabled yet."
      );
    }

    await db
      .update(sources)
      .set({
        rawText: text,
        storagePath,
        contentHash: hashContent(text),
        updatedAt: Date.now(),
      })
      .where(eq(sources.id, sourceId));

    const result = await ingestSource({
      sourceId,
      projectId: params.id,
      rawText: text,
      sourceUrl: null,
      license: null,
    });
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ id: sourceId, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF processing failed";
    await db
      .update(sources)
      .set({ status: "error", error: msg, updatedAt: Date.now() })
      .where(eq(sources.id, sourceId));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
