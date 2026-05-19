// POST /api/projects/:id/sources/text
// Body: { title, text, author?, url?, license? }
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { addTextSourceSchema } from "@/lib/validators";
import { ingestSource, hashContent } from "@/lib/ai/ingest";
import { cleanText } from "@/lib/ai/extract-pdf";

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
  const parsed = addTextSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const { title, text, author, url, license } = parsed.data;
  const cleaned = cleanText(text);

  const supabase = createSupabaseServerClient();
  const { data: created, error: insertErr } = await supabase
    .from("sources")
    .insert({
      project_id: params.id,
      type: "text",
      title,
      author: author ?? null,
      url: url ?? null,
      license: license ?? null,
      raw_text: cleaned,
      content_hash: hashContent(cleaned),
      status: "chunking",
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    return NextResponse.json(
      { error: insertErr?.message ?? "insert failed" },
      { status: 500 }
    );
  }

  const result = await ingestSource({
    sourceId: created.id,
    projectId: params.id,
    rawText: cleaned,
    sourceUrl: url ?? null,
    license: license ?? null,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ id: created.id, ...result });
}
