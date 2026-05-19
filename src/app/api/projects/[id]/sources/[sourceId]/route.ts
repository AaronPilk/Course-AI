// DELETE /api/projects/:id/sources/:sourceId
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; sourceId: string } }
) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("sources")
    .delete()
    .eq("id", params.sourceId)
    .eq("project_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
