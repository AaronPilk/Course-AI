// AI outline generator. Retrieves relevant source chunks via vector search,
// asks Claude to produce a structured course outline, validates against a
// Zod schema, and returns it.

import { z } from "zod";
import { getAnthropic, MODELS } from "./anthropic";
import { embedText } from "./embed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

/** Builds a query string that captures everything we know about a project's
 * intent, so we can semantically retrieve the right chunks to ground the
 * outline in.
 */
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
  const admin = createSupabaseAdminClient();

  const { data: project, error: pErr } = await admin
    .from("course_projects")
    .select(
      "id,name,category,difficulty,audience,learning_goals,estimated_minutes,tags"
    )
    .eq("id", projectId)
    .maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!project) throw new Error("project not found");

  // Verify there are ready sources to ground on.
  const { count } = await admin
    .from("source_chunks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (!count || count === 0) {
    throw new Error("Add and ingest at least one source before generating an outline.");
  }

  // Retrieve top-K chunks relevant to the project intent.
  const query = buildRetrievalQuery({
    name: project.name as string,
    category: project.category as string | null,
    audience: project.audience as string | null,
    goals: project.learning_goals as string | null,
    difficulty: project.difficulty as string | null,
  });
  const queryVec = await embedText(query);

  const { data: matches, error: mErr } = await admin.rpc("match_chunks", {
    p_project_id: projectId,
    p_query: queryVec as unknown as string,
    p_match_count: 24,
  });
  if (mErr) throw new Error(mErr.message);

  const context = (matches ?? [])
    .map(
      (m: { content: string; similarity: number }, i: number) =>
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
- learning goals: ${project.learning_goals ?? "—"}
- target duration (minutes): ${project.estimated_minutes ?? "—"}

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
      "Outline failed schema validation: " + JSON.stringify(parsed.error.format())
    );
  }
  return parsed.data;
}

/** Persists an outline to course_projects.outline and creates module + lesson
 * stub rows (so the Batch 2 lesson generator has rows to fill in).
 */
export async function persistOutline(projectId: string, outline: Outline) {
  const admin = createSupabaseAdminClient();

  // Replace any prior generated modules/lessons (stubs only — keep approved
  // content protected once we add a status check in Batch 2).
  await admin.from("modules").delete().eq("project_id", projectId);

  for (let i = 0; i < outline.modules.length; i++) {
    const m = outline.modules[i];
    const { data: mod, error: mErr } = await admin
      .from("modules")
      .insert({
        project_id: projectId,
        position: i,
        title: m.title,
        summary: m.summary ?? null,
        estimated_minutes: m.estimated_minutes ?? null,
        key_concepts: m.key_concepts ?? [],
        status: "draft",
      })
      .select("id")
      .single();
    if (mErr || !mod) throw new Error(mErr?.message ?? "module insert failed");

    if (m.lessons.length > 0) {
      const rows = m.lessons.map((l, j) => ({
        project_id: projectId,
        module_id: mod.id,
        position: j,
        title: l.title,
        objective: l.objective ?? null,
        status: "draft",
      }));
      const { error: lErr } = await admin.from("lessons").insert(rows);
      if (lErr) throw new Error(lErr.message);
    }
  }

  await admin
    .from("course_projects")
    .update({
      outline,
      status: "outline_ready",
    })
    .eq("id", projectId);
}
