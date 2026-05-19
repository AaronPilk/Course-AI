// POST /api/projects/:id/sources/upload  (multipart/form-data, field "file")
// Accepts a PDF, extracts text, stores the original in the "sources" bucket,
// then runs the ingestion pipeline.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/auth";
import { extractPdfText } from "@/lib/ai/extract-pdf";
import { ingestSource, hashContent } from "@/lib/ai/ingest";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 25MB)" }, { status: 413 });
  }
  if (file.type && !file.type.includes("pdf")) {
    return NextResponse.json({ error: "only PDF files supported" }, { status: 415 });
  }

  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  // Insert a placeholder source row.
  const { data: created, error: insertErr } = await supabase
    .from("sources")
    .insert({
      project_id: params.id,
      type: "pdf",
      title: file.name,
      status: "extracting",
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    return NextResponse.json(
      { error: insertErr?.message ?? "insert failed" },
      { status: 500 }
    );
  }
  const sourceId = created.id;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Store original PDF under {project_id}/{source_id}.pdf
    const storagePath = `${params.id}/${sourceId}.pdf`;
    const { error: uploadErr } = await admin.storage
      .from("sources")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadErr) {
      // Non-fatal — we can still extract from memory. Log and continue.
      console.warn("storage upload warning:", uploadErr.message);
    }

    const text = await extractPdfText(buffer);
    if (text.trim().length < 100) {
      throw new Error(
        "Couldn't extract text from this PDF. It may be scanned — OCR isn't enabled yet."
      );
    }
    const content_hash = hashContent(text);

    await supabase
      .from("sources")
      .update({
        raw_text: text,
        storage_path: storagePath,
        content_hash,
      })
      .eq("id", sourceId);

    const result = await ingestSource({
      sourceId,
      projectId: params.id,
      rawText: text,
      sourceUrl: null,
      license: null,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ id: sourceId, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF processing failed";
    await supabase
      .from("sources")
      .update({ status: "error", error: msg })
      .eq("id", sourceId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
