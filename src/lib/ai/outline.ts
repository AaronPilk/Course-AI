// AI outline generator. Retrieves relevant source chunks via in-memory
// cosine similarity, asks Claude to produce a structured course outline,
// validates against a Zod schema, and returns it.
import { randomUUID } from "node:crypto";
import { eq, count, sql } from "drizzle-orm";
import { z } from "zod";
import { getAnthropic, MODELS } from "./anthropic";
import { embedText } from "./embed";
import { matchChunks } from "@/lib/db/vector";
import {
  getDb,
  courseProjects,
  sourceChunks,
  modules,
  lessons,
} from "@/lib/db";

const lessonSchema = z.object({
  title: z.string(),
  objective: z.string().optional(),
});

const moduleSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  estimated_minutes: z.number().int().nonnegative().optional(),
  key_concepts: z.array(z.string()).default([]),
  lessons: z.array(lessonSchema).min(1),
});

export const outlineSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  target_audience: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  estimated_minutes: z.number().int().nonnegative().optional(),
  modules: z.array(moduleSchema).min(2),
});

export type Outline = z.infer<typeof outlineSchema>;

const TOOL_NAME = "save_course_outline";

function buildRetrievalQuery(opts: {
  name: string;
  category?: string | null;
  audience?: string | null;
  goals?: string | null;
  difficulty?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(`Course: ${opts.name}.`);
  if (opts.category) parts.push(`Category: ${opts.category}.`);
  if (opts.difficulty) parts.push(`Difficulty: ${opts.difficulty}.`);
  if (opts.audience) parts.push(`Audience: ${opts.audience}.`);
  if (opts.goals) parts.push(`Goals: ${opts.goals}.`);
  return parts.join(" ");
}

export async function generateOutline(projectId: string): Promise<Outline> {
  const db = getDb();

  const project = await db
    .select()
    .from(courseProjects)
    .where(eq(courseProjects.id, projectId))
    .get();
  if (!project) throw new Error("project not found");

  // Need at least one chunk to ground on.
  const chunkCountRow = await db
    .select({ c: count() })
    .from(sourceChunks)
    .where(eq(sourceChunks.projectId, projectId))
    .get();
  const chunkCount = chunkCountRow?.c ?? 0;
  if (chunkCount === 0) {
    throw new Error(
      "Add and ingest at least one source before generating an outline."
    );
  }

  const query = buildRetrievalQuery({
    name: project.name,
    category: project.category,
    audience: project.audience,
    goals: project.learningGoals,
    difficulty: project.difficulty,
  });
  const queryVec = await embedText(query);

  const matches = await matchChunks({
    projectId,
    query: queryVec,
    matchCount: 24,
  });

  const context = matches
    .map(
      (m, i) =>
        `[chunk ${i + 1} · similarity ${m.similarity.toFixed(2)}]\n${m.content}`
    )
    .join("\n\n---\n\n");

  const system = `You are a senior instructional designer who turns dense
technical sources into clear, original courses. You teach by sequencing
ideas the way a great instructor would: hook, foundation, concept,
example, mistake, application.

You MUST:
- Produce a transformative course outline. Do not copy passages from the
  source material verbatim — synthesize and re-explain in your own words.
- Sequence modules so each one unlocks the next. Earlier modules teach
  prerequisites for later ones.
- Each module must have 2–6 lessons, each with a specific learning
  objective expressed as a verb phrase ("Distinguish symmetric from
  asymmetric encryption", not "Encryption").
- Stay within the project's stated audience and difficulty.
- Produce 4–8 modules total. Don't pad.
- Never include filler modules like "Course wrap-up" unless they add real
  pedagogical value.

You will respond by calling the ${TOOL_NAME} tool exactly once with the
outline payload.`;

  const userMessage = `Project metadata:
- name: ${project.name}
- category: ${project.category ?? "—"}
- difficulty: ${project.difficulty ?? "—"}
- audience: ${project.audience ?? "—"}
- learning goals: ${project.learningGoals ?? "—"}
- target duration (minutes): ${project.estimatedMinutes ?? "—"}

Retrieved source context (use to ground the outline, do NOT copy):

${context || "(no chunks retrieved)"}

Now design the course outline.`;

  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: MODELS.outline,
    max_tokens: 4096,
    system,
    temperature: 0.4,
    tools: [
      {
        name: TOOL_NAME,
        description: "Persist the course outline you designed.",
        input_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            description: { type: "string" },
            target_audience: { type: "string" },
            prerequisites: { type: "array", items: { type: "string" } },
            outcomes: { type: "array", items: { type: "string" } },
            estimated_minutes: { type: "integer", minimum: 0 },
            modules: {
              type: "array",
              minItems: 2,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  estimated_minutes: { type: "integer", minimum: 0 },
                  key_concepts: { type: "array", items: { type: "string" } },
                  lessons: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        objective: { type: "string" },
                      },
                      required: ["title"],
                    },
                  },
                },
                required: ["title", "lessons"],
              },
            },
          },
          required: ["title", "description", "modules"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [{ role: "user", content: userMessage }],
  });

  const block = message.content.find((c) => c.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Model did not call the outline tool.");
  }
  const parsed = outlineSchema.safeParse(block.input);
  if (!parsed.success) {
    throw new Error(
      "Outline failed schema validation: " +
        JSON.stringify(parsed.error.format())
    );
  }
  return parsed.data;
}

/** Persists an outline and creates module + lesson stub rows. */
export async function persistOutline(projectId: string, outline: Outline) {
  const db = getDb();

  // Replace any prior generated modules (and cascade lessons).
  await db.delete(modules).where(eq(modules.projectId, projectId));

  for (let i = 0; i < outline.modules.length; i++) {
    const m = outline.modules[i];
    const moduleId = randomUUID();
    await db.insert(modules).values({
      id: moduleId,
      projectId,
      position: i,
      title: m.title,
      summary: m.summary ?? null,
      estimatedMinutes: m.estimated_minutes ?? null,
      keyConcepts: JSON.stringify(m.key_concepts ?? []),
      status: "draft",
    });
    if (m.lessons.length > 0) {
      const lessonRows = m.lessons.map((l, j) => ({
        id: randomUUID(),
        moduleId,
        projectId,
        position: j,
        title: l.title,
        objective: l.objective ?? null,
        status: "draft" as const,
      }));
      await db.insert(lessons).values(lessonRows);
    }
  }

  await db
    .update(courseProjects)
    .set({
      outline: JSON.stringify(outline),
      status: "outline_ready",
      updatedAt: Date.now(),
    })
    .where(eq(courseProjects.id, projectId));

  // Silence unused-import warning when tree-shaking; sql import used elsewhere.
  void sql;
}
