// DELETE /api/projects/:id/sources/:sourceId
import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, sources } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; sourceId: string } }
) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  await db
    .delete(sources)
    .where(
      and(eq(sources.id, params.sourceId), eq(sources.projectId, params.id))
    );

  return NextResponse.json({ ok: true });
}
