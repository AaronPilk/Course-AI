# Course Factory

An AI-powered course manufacturing engine — two systems on one stack:

- **Course Factory (admin)** — ingest sources, extract knowledge, generate
  structured original course content.
- **Course Portal (public)** — browse, buy, and learn from finished
  courses with a premium player UX. *(Batch 3+)*

This batch (Batch 1) ships the foundation: scaffold, auth, admin
dashboard, project CRUD, PDF / URL / text ingestion with chunking and
vector embeddings, and an AI-driven course outline generator.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full design.

---

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind)
- Supabase (Postgres, Auth, Storage, pgvector)
- Anthropic Claude (generation) + OpenAI (embeddings)
- Cloudflare Pages (deployment target — Batch 1+)

---

## Quickstart

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a new project at https://supabase.com.
2. In **Project Settings → API**, copy the **Project URL**, **anon key**,
   and **service role key**.
3. Open the **SQL Editor** and run the contents of
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
4. Create a private storage bucket named `sources` (uncomment and run the
   storage SQL at the bottom of the migration, or create via the UI).

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

You'll need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(server-only, never expose to the client)*
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

### 4. Promote your account to admin

After your first sign-in (magic link), the `handle_new_user` trigger
creates a row in `public.profiles` with role `user`. Promote yourself:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 5. Run the app

```bash
npm run dev
```

Then open <http://localhost:3000> and click **Admin sign in**.

---

## What works in Batch 1

- [x] Magic-link admin sign-in via Supabase
- [x] Premium admin dashboard shell with dark/light mode
- [x] Course project CRUD (`/admin/projects`)
- [x] Source ingestion — PDF upload, URL scrape, pasted text
- [x] Token-aware chunking with overlap
- [x] OpenAI `text-embedding-3-large` at 1536 dims, batched
- [x] Heuristic copyright-risk scoring
- [x] Vector retrieval over the project corpus
  (`match_chunks` SQL function)
- [x] AI outline generation with Claude (tool-use enforced JSON schema)
- [x] Module + lesson stubs persisted from generated outlines

## Coming next

- Batch 2 — full lesson body generation, quizzes, glossary, editor
- Batch 3 — publish flow, public course pages, player, progress
- Batch 4 — Stripe, user dashboards, certificates
- Batch 5 — diagrams, AI tutor, safety scanner

See [`SETUP.md`](./SETUP.md) for deployment notes.
