// POST /api/projects/:id/sources/url
// Body: { url: string, title?: string }
// Scrapes the URL, creates a source row, then ingests inline.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { addUrlSourceSchema } from "@/lib/validators";
import { scrapeUrl } from "@/lib/ai/scrape-url";
import { ingestSource, hashContent } from "@/lib/ai/ingest";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addUrlSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const { url, title: titleOverride } = parsed.data;

  const supabase = createSupabaseServerClient();

  // Insert pending row first so the UI reflects progress.
  const { data: created, error: insertErr } = await supabase
    .from("sources")
    .insert({
      project_id: params.id,
      type: "url",
      url,
      title: titleOverride ?? url,
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
    const { title, text, author } = await scrapeUrl(url);

    const content_hash = hashContent(text);
    await supabase
      .from("sources")
      .update({
        title: titleOverride ?? title,
        author: author ?? null,
        raw_text: text,
        content_hash,
      })
      .eq("id", sourceId);

    const result = await ingestSource({
      sourceId,
      projectId: params.id,
      rawText: text,
      sourceUrl: url,
      license: null,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      id: sourceId,
      chunks: result.chunks,
      tokens: result.tokens,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Scrape failed";
    await supabase
      .from("sources")
      .update({ status: "error", error: msg })
      .eq("id", sourceId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
