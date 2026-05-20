# Course Factory

An AI-powered course manufacturing engine — two systems on one stack:

- **Course Factory (admin)** — ingest sources, extract knowledge, generate
  structured original course content.
- **Course Portal (public)** — browse, buy, and learn from finished
  courses with a premium player UX. *(Batch 3+)*

This repo is **local-first**. Everything runs on your Mac with a SQLite
file and your API keys. No Supabase, no Cloudflare, no GitHub-required
auth — that all gets wired in when you're ready to launch.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full design.

---

## Stack (local mode)

- Next.js 14 (App Router, TypeScript, Tailwind)
- SQLite (via `better-sqlite3` + Drizzle ORM) → one file at `./.local-data/course-factory.db`
- Anthropic Claude (generation) + OpenAI (embeddings)
- Admin auth: single-password gate via `ADMIN_PASSWORD` env var
- In-memory cosine vector search (good for thousands of chunks)

When you launch, all of this swaps to **Supabase + Cloudflare Pages** in
one batch — the Drizzle schema and API routes barely change.

---

## Quickstart

```bash
# 1. install
cd "/Users/pilksclaes/Course AI"
npm install

# 2. env is already created at .env.local with your Anthropic/OpenAI keys
# (set during scaffolding). To rotate the password or AI keys, edit it.

# 3. run
npm run dev
```

Open <http://localhost:3000>. Click **Admin sign in**, enter the password
from `.env.local` (`ADMIN_PASSWORD`). You're in.

The SQLite database, schema, and `.local-data/` folder are all created
automatically on first request — no separate migration step.

---

## What works right now

- [x] Local single-admin auth (password + signed cookie)
- [x] Premium admin dashboard with dark/light mode
- [x] Course project CRUD (`/admin/projects`)
- [x] Source ingestion — PDF upload, URL scrape, pasted text
- [x] Token-aware chunking with overlap
- [x] OpenAI `text-embedding-3-large` at 1536 dims, batched
- [x] Heuristic copyright-risk scoring
- [x] In-memory cosine vector retrieval over the project corpus
- [x] AI outline generation with Claude (tool-use enforced JSON schema)
- [x] Module + lesson stubs persisted from generated outlines

## Coming next

- **Batch 2** — full lesson body generation, quizzes, glossary, in-place editor
- **Batch 3** — publish flow, public course pages, course player, progress
- **Batch 4** — Stripe, user dashboards, certificates
- **Batch 5** — diagrams, AI tutor, safety scanner
- **Launch batch** — swap SQLite → Supabase, deploy to Cloudflare Pages

---

## File layout

```
/Users/pilksclaes/Course AI/
├── .local-data/                    ← gitignored
│   ├── course-factory.db           ← SQLite database
│   └── sources/{projectId}/...pdf  ← uploaded PDFs
├── docs/ARCHITECTURE.md
├── src/
│   ├── app/                        ← Next.js routes
│   ├── components/                 ← UI components
│   └── lib/
│       ├── db/                     ← Drizzle schema + client + vector search
│       ├── ai/                     ← chunk, embed, scrape, outline
│       └── auth.ts                 ← local password auth
└── supabase/migrations/            ← saved for launch — not used locally
```

`./.local-data/` is the only place data lives. Back it up like any other
file. Delete it to start fresh.

See [`SETUP.md`](./SETUP.md) for deployment notes (when the time comes).
