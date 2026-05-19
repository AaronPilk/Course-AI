# Course Factory — Architecture

> An AI-powered course manufacturing engine. Two systems sharing one backend:
> a private **Course Factory** that turns sources into structured premium
> educational content, and a public **Course Portal** that delivers it.

---

## 1. System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                       Course Factory (Admin)                       │
│                                                                    │
│   Sources → Ingestion → Extraction → Outline → Lessons → Review    │
│     │           │            │           │         │         │     │
│     ▼           ▼            ▼           ▼         ▼         ▼     │
│   PDF/URL   chunk+embed   concepts    modules   bodies    publish  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼  (publish flow copies + freezes)
┌────────────────────────────────────────────────────────────────────┐
│                      Course Portal (Public)                        │
│                                                                    │
│   Browse → Buy (Stripe) → Enroll → Player → Progress → Cert        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Both systems are one Next.js App Router app. Admin routes live under
`/admin/*` and are gated by a `role = 'admin'` check in middleware. Public
routes (`/`, `/courses`, `/learn/*`, `/account`) are user-facing.

### Runtime topology

- **Web app** — Next.js 14 App Router, deployed to Cloudflare Pages
  (Workers runtime for edge routes; Node runtime for AI/PDF/scraping work).
- **Auth + DB + Storage** — Supabase (Postgres, GoTrue auth, S3-compatible
  storage, pgvector for embeddings, Row-Level Security for tenancy).
- **AI** — Anthropic Claude (Sonnet/Opus) for generation; OpenAI
  `text-embedding-3-large` at 1536 dims for vector retrieval.
- **Background work** — `processing_jobs` table + a worker route invoked by
  a Cloudflare Cron trigger. Batch 1 runs jobs inline; Batch 2 promotes
  long-running jobs to the queue.
- **Payments** — Stripe (Batch 4).

### Why this shape

The platform's hot path is **ingest → understand → write**. Every step is
read-heavy on sources and write-heavy on generated content. Putting both
sides of that loop in one Postgres makes it cheap to join, easy to back up,
and trivial to reason about with RLS.

---

## 2. Database Schema

Full SQL lives in `supabase/migrations/0001_init.sql`. This section is the
mental model.

### Identity

- `auth.users` — managed by Supabase.
- `profiles` — 1:1 with `auth.users`; carries `role` (`user` | `admin`),
  display name, etc. Every other table joins via `profiles.id`.

### Course Factory (private)

```
course_projects ──┬── sources ──── source_chunks (vector embeddings)
                  │                  │
                  ├── concepts (extracted; vector embeddings)
                  │
                  ├── modules ──── lessons ──── quizzes ──── quiz_questions
                  │                  │
                  │                  └── assignments
                  │
                  ├── glossary_terms
                  └── processing_jobs
```

- `course_projects` — the unit of work. Has `status`
  (`draft → ingesting → outline_ready → generating → review → published`).
- `sources` — one row per uploaded PDF / URL / pasted text. Carries
  `copyright_risk` and license metadata.
- `source_chunks` — cleaned, chunked, embedded text. The retrieval layer.
- `concepts` — distilled atomic ideas extracted from chunks. Also embedded
  so the outline generator can cluster them.
- `modules`, `lessons` — generated content. `lessons.body_markdown` is the
  authoritative rendered body the player consumes.
- `quizzes`, `quiz_questions` — generated assessments.
- `assignments`, `glossary_terms` — supporting artifacts.

### Course Portal (public)

```
published_courses ── enrollments ── lesson_progress / quiz_attempts
                  └── certificates
```

When a project is published, a `published_courses` row is created with a
**frozen snapshot** of the slug, title, outcomes, pricing, etc. Modules
and lessons stay normalized (the player joins them in), but the public
metadata is decoupled so editing the project in the factory cannot
accidentally break what students paid for.

### Safety

- `content_safety_flags` — surfaces similarity, copyright, citation and
  protected-diagram risks during generation. Blocks publish until resolved.

### Tenancy / RLS

Single-tenant for v1 (you are the admin). RLS rules:

- `profiles` — user can read/update own row; admins read all.
- All `course_projects.*` and descendants — only owners + admins.
- `published_courses` — public read when `is_active = true`.
- `enrollments`, `lesson_progress`, `quiz_attempts`, `certificates` — user
  reads own; admins read all.

---

## 3. Folder Structure

```
/
├── README.md                      ← run + deploy quickstart
├── SETUP.md                       ← env, Supabase, Cloudflare notes
├── docs/
│   └── ARCHITECTURE.md            ← (this file)
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── public/                        ← static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← root layout, theme
│   │   ├── globals.css            ← Tailwind base
│   │   ├── page.tsx               ← public landing
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx     ← sidebar shell, role gate
│   │   │       ├── page.tsx       ← dashboard
│   │   │       ├── login/page.tsx
│   │   │       └── projects/
│   │   │           ├── new/page.tsx
│   │   │           └── [id]/page.tsx
│   │   └── api/
│   │       ├── auth/callback/route.ts
│   │       └── projects/
│   │           ├── route.ts                          POST create / GET list
│   │           └── [id]/
│   │               ├── route.ts                      GET / PATCH
│   │               ├── sources/
│   │               │   ├── route.ts                  GET list / POST pasted text
│   │               │   ├── upload/route.ts           POST PDF
│   │               │   └── url/route.ts              POST URL scrape
│   │               └── generate-outline/route.ts     POST outline gen
│   ├── components/
│   │   ├── ui/                    ← buttons, cards, inputs (Apple-style primitives)
│   │   └── admin/                 ← sidebar, project cards, source list
│   └── lib/
│       ├── supabase/
│       │   ├── server.ts          ← server-side client (cookies)
│       │   ├── client.ts          ← browser client
│       │   └── admin.ts           ← service-role client (server only)
│       ├── ai/
│       │   ├── anthropic.ts       ← Claude client + model presets
│       │   ├── openai.ts          ← embeddings client
│       │   ├── extract-pdf.ts     ← pdf-parse wrapper
│       │   ├── scrape-url.ts      ← fetch + readability/cheerio
│       │   ├── chunk.ts           ← token-aware chunker
│       │   ├── embed.ts           ← batch embedding helper
│       │   └── outline.ts         ← outline generator (Claude prompt)
│       ├── auth.ts                ← getSessionUser, requireAdmin
│       └── utils.ts
└── middleware.ts                  ← Supabase session refresh + admin gate
```

---

## 4. Ingestion Pipeline

```
upload PDF / submit URL / paste text
            │
            ▼
   create `sources` row (status = pending)
            │
            ▼
   ┌────────────────────────────┐
   │ 1. EXTRACT                 │   pdf-parse for PDFs;
   │    raw_text                │   fetch + Readability for URLs;
   │                            │   verbatim for pasted text.
   ├────────────────────────────┤
   │ 2. CLEAN                   │   strip nav/footers, collapse
   │                            │   whitespace, keep headings.
   ├────────────────────────────┤
   │ 3. CHUNK                   │   ~800 tokens, 100-token overlap,
   │                            │   on heading + sentence boundaries.
   ├────────────────────────────┤
   │ 4. EMBED (batched)         │   OpenAI text-embedding-3-large
   │                            │   at 1536 dims, batches of 100.
   ├────────────────────────────┤
   │ 5. PERSIST                 │   source_chunks rows with embedding.
   ├────────────────────────────┤
   │ 6. RISK SCORE              │   heuristic copyright_risk
   │                            │   (long verbatim, no license, etc.)
   └────────────────────────────┘
            │
            ▼
   sources.status = 'ready'
```

For Batch 1, steps 1–6 run inline in the API route under the Node runtime
(scraping and pdf-parse aren't edge-safe). The route streams progress so
the UI can show a per-source bar. Batch 2 moves this to `processing_jobs`
+ a cron-driven worker so a slow PDF doesn't block the request.

---

## 5. AI Processing Pipeline

The factory transforms raw chunks into structured content in stages:

```
source_chunks
      │
      │   (a) CONCEPT EXTRACTION
      │       per-chunk Claude pass → concepts table
      ▼
   concepts (embedded, clustered)
      │
      │   (b) OUTLINE GENERATION
      │       retrieve top-K concepts + chunks for course goals →
      │       Claude generates title, modules, lessons-list
      ▼
   modules + lessons (stubs)
      │
      │   (c) LESSON GENERATION (Batch 2)
      │       per lesson: retrieve relevant chunks + concepts via
      │       hybrid (vector + keyword) search → Claude writes the
      │       full lesson body, examples, mistakes, summary
      ▼
   lessons (body_markdown filled)
      │
      │   (d) QUIZ GENERATION
      │       per lesson/module: Claude reads body + objectives →
      │       generates MCQ + scenario + short-answer with keys
      ▼
   quizzes + quiz_questions
      │
      │   (e) SAFETY REVIEW
      │       compare lesson chunks to top-K sources via embedding
      │       similarity + n-gram overlap → flag rows
      ▼
   content_safety_flags
```

### Model choices

- **Concept extraction** — `claude-sonnet-4-6`, low temperature, JSON
  output enforced via tool use.
- **Outline** — `claude-opus-4-6` (one-shot, high-leverage decision).
- **Lesson body** — `claude-sonnet-4-6` with streaming (Batch 2).
- **Quizzes** — `claude-sonnet-4-6` with structured output.
- **Embeddings** — `text-embedding-3-large` at `dimensions: 1536` so the
  vectors fit pgvector's HNSW index limit cleanly.

### Prompt scaffolding (lib/ai/outline.ts pattern)

Every generation call follows the same pattern:

1. Pull project metadata (goals, audience, difficulty).
2. Retrieve relevant context via `match_chunks(project_id, query, k)`.
3. Render a system prompt that names the role + output schema.
4. Call Claude with tools that enforce a JSON schema.
5. Validate against a Zod schema before persisting.

This makes prompts swappable and lets us A/B without touching the route.

---

## 6. Vector Storage

- pgvector extension, `embedding vector(1536)` columns on both
  `source_chunks` and `concepts`.
- **HNSW index** on each table:
  `using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64)`.
- Project-scoped retrieval via a SQL function:

  ```sql
  create or replace function match_chunks(
    p_project_id uuid,
    p_query vector(1536),
    p_match_count int default 8
  ) returns table (id uuid, content text, similarity float)
  language sql stable as $$
    select id, content, 1 - (embedding <=> p_query) as similarity
    from source_chunks
    where project_id = p_project_id
    order by embedding <=> p_query
    limit p_match_count;
  $$;
  ```

- Hybrid retrieval (Batch 2): combine vector hit with Postgres FTS
  (`to_tsvector` on `content`) for keyword recall, then rerank with a
  small Claude call when stakes are high (lesson body generation).

---

## 7. Publishing Workflow

```
admin clicks "Publish"
        │
        ▼
1. Validate: all modules approved, no unresolved high-severity flags,
   every lesson has body + objective, every module has a quiz.
        │
        ▼
2. Generate slug (kebab + unique suffix).
        │
        ▼
3. Insert `published_courses` row with frozen marketing copy + price.
        │
        ▼
4. Generate thumbnail + hero (placeholder gradients in Batch 1;
   AI-generated art in Batch 5).
        │
        ▼
5. Flip `course_projects.status = 'published'`.
        │
        ▼
6. Public route `/courses/[slug]` becomes live.
```

Unpublish flips `is_active = false` on the `published_courses` row.
Republishing a course updates the existing row rather than creating a new
one, so enrollments and progress persist.

---

## 8. Course Player Architecture (preview — Batch 3)

```
/learn/[slug]
   │
   ├── layout: sidebar (module/lesson tree) + content + utility rail
   │
   ├── content: streamed Markdown + diagrams + embedded quiz components
   │
   ├── on lesson view → POST /api/progress (debounced)
   │
   └── on quiz submit → POST /api/quiz/attempt → score + unlock next
```

Key choices:

- **Server components** render the lesson tree from `published_courses`,
  `modules`, `lessons`. The body is rendered with `react-markdown` +
  shiki for code blocks.
- **Progress** writes are debounced client-side (every 10s of view time +
  on unmount).
- **Continue Learning** = `enrollments.last_lesson_id`. The student's
  first action is always one click away.
- **Certificates** are deterministic: when `lesson_progress` rows for a
  course hit 100% AND all `quiz_attempts.passed = true`, an insert into
  `certificates` is fired by a Postgres trigger (Batch 4).

---

## 9. Scaling Considerations

**Read scaling.** Postgres handles 10k+ rps of player reads with a
properly sized Supabase instance; lesson bodies are cacheable on
Cloudflare's edge (`stale-while-revalidate`, 60s). The player's hot
queries are by `slug` (cached) and `user_id + course_id` (indexed).

**Generation scaling.** AI generation is the slow path, not the user
path. Move it off the request:

- Batch 1: inline (fine for one admin, single project at a time).
- Batch 2: `processing_jobs` queue + a Cloudflare Cron-triggered worker
  that claims jobs with `SELECT … FOR UPDATE SKIP LOCKED`.
- Batch 5: parallel lesson workers, capped concurrency per provider.

**Embedding cost.** text-embedding-3-large is ~$0.13 / 1M tokens. A
2,000-page source ≈ 1M tokens ≈ $0.13. Keep `source_chunks` deduplicated
by content hash so re-uploads don't re-embed.

**Vector index health.** HNSW is incremental but degrades on huge
deletes; nightly `REINDEX CONCURRENTLY` for the embedding indexes is in
the runbook.

**Multi-tenant later.** RLS is already keyed on `owner_id`. When we open
the factory to other authors, the only change is making the admin role
per-project rather than global.

**Copyright & safety at scale.** Every published lesson runs the safety
pass; flags ≥ medium block publish. We retain source text but never
expose `sources.raw_text` to the public — only generated, cited bodies.

---

## 10. Build Order (recap)

- **Batch 1 (this PR)** — scaffold, auth, admin shell, project CRUD,
  ingestion (PDF/URL/text), chunking, embedding, outline generator.
- **Batch 2** — lesson generation, quiz generation, glossary, editor.
- **Batch 3** — publish flow, public course pages, player, progress.
- **Batch 4** — Stripe, user dashboards, certificates.
- **Batch 5** — diagrams, AI tutor, auto-updating courses, safety
  scanner.
