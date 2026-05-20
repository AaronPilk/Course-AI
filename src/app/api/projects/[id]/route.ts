// GET   /api/projects/:id  — fetch a project
// PATCH /api/projects/:id  — update fields (incl. status)
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, courseProjects } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  const project = await db
    .select()
    .from(courseProjects)
    .where(eq(courseProjects.id, params.id))
    .get();

  if (!project)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const db = getDb();
  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  const d = parsed.data;
  if (d.name !== undefined) updates.name = d.name;
  if (d.category !== undefined) updates.category = d.category;
  if (d.difficulty !== undefined) updates.difficulty = d.difficulty;
  if (d.audience !== undefined) updates.audience = d.audience;
  if (d.learning_goals !== undefined) updates.learningGoals = d.learning_goals;
  if (d.tags !== undefined) updates.tags = JSON.stringify(d.tags);
  if (d.estimated_minutes !== undefined)
    updates.estimatedMinutes = d.estimated_minutes;
  if (d.status !== undefined) updates.status = d.status;

  await db
    .update(courseProjects)
    .set(updates)
    .where(eq(courseProjects.id, params.id));

  return NextResponse.json({ ok: true });
}
