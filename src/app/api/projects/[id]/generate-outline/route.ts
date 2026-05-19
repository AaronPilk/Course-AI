// POST /api/projects/:id/generate-outline
// Runs the AI outline generator against the project's source corpus.
import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateOutline, persistOutline } from "@/lib/ai/outline";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Authorization: confirm the user owns this project (RLS will also enforce).
  const supabase = createSupabaseServerClient();
  const { data: project } = await supabase
    .from("course_projects")
    .select("id, owner_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Mark project status while generating so the dashboard reflects it.
  await supabase
    .from("course_projects")
    .update({ status: "generating" })
    .eq("id", params.id);

  try {
    const outline = await generateOutline(params.id);
    await persistOutline(params.id, outline);
    return NextResponse.json({ ok: true, outline });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Outline generation failed";
    await supabase
      .from("course_projects")
      .update({ status: "draft" })
      .eq("id", params.id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
