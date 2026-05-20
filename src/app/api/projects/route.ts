// GET  /api/projects   — list projects
// POST /api/projects   — create a new project
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { getProfile } from "@/lib/auth";
import { getDb, courseProjects } from "@/lib/db";
import { createProjectSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select({
      id: courseProjects.id,
      name: courseProjects.name,
      category: courseProjects.category,
      difficulty: courseProjects.difficulty,
      status: courseProjects.status,
      tags: courseProjects.tags,
      updatedAt: courseProjects.updatedAt,
      createdAt: courseProjects.createdAt,
    })
    .from(courseProjects)
    .orderBy(desc(courseProjects.updatedAt));

  return NextResponse.json({ projects: rows });
}

export async function POST(request: NextRequest) {
  const profile = await getProfile();
  if (!profile)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const db = getDb();
  await db.insert(courseProjects).values({
    id,
    name: parsed.data.name,
    category: parsed.data.category ?? null,
    difficulty: parsed.data.difficulty ?? null,
    audience: parsed.data.audience ?? null,
    learningGoals: parsed.data.learning_goals ?? null,
    tags: JSON.stringify(parsed.data.tags ?? []),
    estimatedMinutes: parsed.data.estimated_minutes ?? null,
  });

  return NextResponse.json({ id }, { status: 201 });
}
