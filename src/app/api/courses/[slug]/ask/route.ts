// POST /api/courses/[slug]/ask
// Body: { question: string }
// Returns: { answer, references: Reference[] }
//
// RAG over BOTH lesson bodies and source documents. Lessons are the
// primary citation surface (clickable into the course); sources are
// supplementary depth (clickable to the original URL).
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getPublishedCourseBySlug } from "@/lib/db/queries";
import { embedText } from "@/lib/ai/embed";
import { matchLessonChunks } from "@/lib/db/lesson-vector";
import { matchChunks } from "@/lib/db/vector";
import { getDb, sources } from "@/lib/db";
import { getAnthropic, MODELS } from "@/lib/ai/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  question: z.string().min(3).max(2000),
});

type LessonRef = {
  kind: "lesson";
  moduleIdx: number;
  lessonIdx: number;
  moduleTitle: string;
  lessonTitle: string;
  snippet: string;
  similarity: number;
};

type SourceRef = {
  kind: "source";
  url: string | null;
  title: string | null;
  snippet: string;
  similarity: number;
};

type Reference = LessonRef | SourceRef;

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const course = await getPublishedCourseBySlug(params.slug);
  if (!course) {
    return NextResponse.json({ error: "course not found" }, { status: 404 });
  }

  const question = parsed.data.question.trim();

  let queryVec: number[];
  try {
    queryVec = await embedText(question);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "Embedding failed — check OPENAI_API_KEY: " +
          (e instanceof Error ? e.message : "unknown"),
      },
      { status: 500 }
    );
  }

  // Search both indexes in parallel.
  const [lessonMatches, sourceMatches] = await Promise.all([
    matchLessonChunks({
      projectId: course.projectId,
      query: queryVec,
      matchCount: 6,
    }),
    matchChunks({
      projectId: course.projectId,
      query: queryVec,
      matchCount: 8,
    }),
  ]);

  // Look up source titles + URLs (matchChunks returns sourceId only).
  const db = getDb();
  const sourceIds = Array.from(
    new Set(sourceMatches.map((m) => m.sourceId))
  );
  const sourceMetaList = sourceIds.length
    ? await Promise.all(
        sourceIds.map((id) =>
          db
            .select({
              id: sources.id,
              title: sources.title,
              url: sources.url,
            })
            .from(sources)
            .where(eq(sources.id, id))
            .get()
        )
      )
    : [];
  const sourceMeta = new Map<string, { title: string | null; url: string | null }>();
  for (const s of sourceMetaList) {
    if (s) sourceMeta.set(s.id, { title: s.title, url: s.url });
  }

  if (lessonMatches.length === 0 && sourceMatches.length === 0) {
    return NextResponse.json({
      answer:
        "I don't have material indexed for this course yet, so I can't answer questions from its content. Re-import the course without --skip-embeddings.",
      references: [],
    });
  }

  // Build the prompt context. Mix lessons first (course voice), then sources (Google docs).
  const lessonContext = lessonMatches
    .map(
      (m, i) =>
        `[Lesson ${i + 1}] Module ${m.modulePosition + 1} · Lesson ${m.lessonPosition + 1} — ${m.lessonTitle}\n\n${m.content}`
    )
    .join("\n\n---\n\n");

  const sourceContext = sourceMatches
    .map((m, i) => {
      const meta = sourceMeta.get(m.sourceId);
      const title = meta?.title ?? "Source";
      return `[Source ${i + 1}] ${title}\n${meta?.url ?? ""}\n\n${m.content}`;
    })
    .join("\n\n---\n\n");

  const combinedContext = [lessonContext, sourceContext]
    .filter(Boolean)
    .join("\n\n===\n\n");

  const system = `You are the Ask AI assistant for the course "${course.title}".

Rules:
- Answer ONLY using the material below. If the answer isn't there, say so honestly and suggest which lesson might cover it.
- Be concise — 2 to 5 short paragraphs unless the question requires more.
- Use plain, everyday language. Match the tone of the course itself.
- Synthesize. Don't dump source text verbatim. Paraphrase clearly.
- When citing, refer to lessons by their title ("see the lesson on Crawling"). For external source docs, say "according to Google's docs on X" — don't paste URLs into the answer. The UI surfaces references separately.
- Lesson material is the course's authoritative voice. Source documentation is supplementary depth. Lead with the lesson when both cover the same ground.
- Never speculate beyond the material.
- Off-topic questions: politely redirect to what the course covers.`;

  const userMessage = `Question from a student:
${question}

Material from the course (lessons + source docs, in rough order of relevance):

${combinedContext}

Now answer using the rules above.`;

  let answer: string;
  try {
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: MODELS.lesson,
      max_tokens: 1024,
      temperature: 0.3,
      system,
      messages: [{ role: "user", content: userMessage }],
    });
    const textBlock = message.content.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("model returned no text");
    }
    answer = textBlock.text.trim();
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "AI answer failed — check ANTHROPIC_API_KEY: " +
          (e instanceof Error ? e.message : "unknown"),
      },
      { status: 500 }
    );
  }

  // Build references. Lessons first (deduped by lesson), then unique sources.
  const lessonRefs: LessonRef[] = [];
  const seenLessons = new Set<string>();
  for (const m of lessonMatches) {
    const key = `${m.modulePosition}-${m.lessonPosition}`;
    if (seenLessons.has(key)) continue;
    seenLessons.add(key);
    lessonRefs.push({
      kind: "lesson",
      moduleIdx: m.modulePosition,
      lessonIdx: m.lessonPosition,
      moduleTitle: m.moduleTitle,
      lessonTitle: m.lessonTitle,
      snippet:
        m.content.length > 240 ? m.content.slice(0, 240).trimEnd() + "…" : m.content,
      similarity: Number(m.similarity.toFixed(3)),
    });
    if (lessonRefs.length >= 3) break;
  }

  const sourceRefs: SourceRef[] = [];
  const seenSources = new Set<string>();
  for (const m of sourceMatches) {
    const meta = sourceMeta.get(m.sourceId);
    const url = meta?.url ?? null;
    const key = url ?? m.sourceId;
    if (seenSources.has(key)) continue;
    seenSources.add(key);
    sourceRefs.push({
      kind: "source",
      url,
      title: meta?.title ?? null,
      snippet:
        m.content.length > 240 ? m.content.slice(0, 240).trimEnd() + "…" : m.content,
      similarity: Number(m.similarity.toFixed(3)),
    });
    if (sourceRefs.length >= 3) break;
  }

  const references: Reference[] = [...lessonRefs, ...sourceRefs];

  return NextResponse.json({ answer, references });
}
