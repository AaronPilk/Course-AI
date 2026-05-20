# Setup & Deployment

## Local development

See [README.md](./README.md). Short version:

```bash
npm install
npm run dev
```

That's it. SQLite + auto-migrations + local-data folder are wired
automatically.

### Type check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

---

## Backing up your work

All your data lives in `./.local-data/`:

- `course-factory.db` — SQLite database (projects, sources, chunks,
  embeddings, outlines, modules, lessons)
- `sources/{projectId}/{sourceId}.pdf` — original uploaded PDFs

To back up, copy the whole `.local-data/` folder. To start fresh, delete
it.

---

## API keys & budgets

You've got two paid API providers wired in:

- **OpenAI embeddings** — ~$0.13 per 1M tokens with
  `text-embedding-3-large`. Cheap, but set a monthly hard cap in your
  OpenAI dashboard. Content-hash dedupe in `lib/ai/ingest.ts` prevents
  re-embedding the same source.
- **Anthropic generation** — `claude-opus-4-6` for the outline, ~$0.05–
  $0.30 per outline depending on source size. Downgrade to
  `claude-sonnet-4-6` via the `ANTHROPIC_OUTLINE_MODEL` env var if cost
  matters more than quality.

---

## Launch checklist (for later — not now)

When you're ready to sell access:

1. **Database** — provision a Supabase project, run
   `supabase/migrations/0001_init.sql`, and update the Drizzle client to
   point at Postgres (`drizzle-orm/postgres-js`). The schemas are
   intentionally parallel so this is a ~1 hour migration.
2. **Auth** — replace `src/lib/auth.ts` with Supabase Auth (magic links).
   Re-introduce the `profiles` table from the Postgres migration.
3. **File storage** — replace `getSourcesDir()` writes with Supabase
   Storage uploads.
4. **Vectors** — switch `matchChunks` from in-memory cosine to the
   `match_chunks` Postgres function (pgvector + HNSW). Already in the
   migration.
5. **Deploy** — Cloudflare Pages with the `@cloudflare/next-on-pages`
   adapter. `nodejs_compat` flag on. Move the AI routes to the Node
   runtime (already configured with `export const runtime = "nodejs"`).
6. **Push to GitHub** — origin is already configured for
   `github.com/AaronPilk/Course-AI.git`. Just `git push`.

That whole list is "the launch batch." We do it once, all at once, when
you say go.

---

## Troubleshooting

**`Error: SESSION_SECRET must be set`**
Make sure `.env.local` exists in the project root and has a non-empty
`SESSION_SECRET`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**`ANTHROPIC_API_KEY is not set`**
Same — check `.env.local`.

**SQLite "database is locked" on a hot reload**
Stop the dev server (Ctrl-C), wait a beat, restart. WAL mode usually
prevents this, but Next's hot reload can occasionally hold open handles.
