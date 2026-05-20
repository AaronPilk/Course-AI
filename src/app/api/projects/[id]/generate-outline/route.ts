// POST /api/projects/:id/generate-outline
// Runs the AI outline generator against the project's source corpus.
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, courseProjects } from "@/lib/db";
import { generateOutline, persistOutline } from "@/lib/ai/outline";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  const project = await db
    .select({ id: courseProjects.id })
    .from(courseProjects)
    .where(eq(courseProjects.id, params.id))
    .get();
  if (!project)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  await db
    .update(courseProjects)
    .set({ status: "generating", updatedAt: Date.now() })
    .where(eq(courseProjects.id, params.id));

  try {
    const outline = await generateOutline(params.id);
    await persistOutline(params.id, outline);
    return NextResponse.json({ ok: true, outline });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Outline generation failed";
    await db
      .update(courseProjects)
      .set({ status: "draft", updatedAt: Date.now() })
      .where(eq(courseProjects.id, params.id));
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
