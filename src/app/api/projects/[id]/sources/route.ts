// GET /api/projects/:id/sources — list sources for a project
import { NextResponse, type NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, sources } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select()
    .from(sources)
    .where(eq(sources.projectId, params.id))
    .orderBy(desc(sources.createdAt));

  return NextResponse.json({ sources: rows });
}
