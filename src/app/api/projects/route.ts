// GET  /api/projects        — list current user's projects
// POST /api/projects        — create a new project
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("course_projects")
    .select("id,name,category,difficulty,status,tags,updated_at,created_at")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("course_projects")
    .insert({
      ...parsed.data,
      tags: parsed.data.tags ?? [],
      owner_id: profile.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
