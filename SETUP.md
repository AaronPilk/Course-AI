# Setup & Deployment

## Local development

See [README.md](./README.md) for the basic quickstart.

### Recommended Node version

Node 20.x (Cloudflare Pages targets 20). Anything 18.17+ should work
locally, but `pdf-parse` and `tiktoken` have native bits that work best
on 20.

```bash
nvm install 20
nvm use 20
npm install
npm run dev
```

### Type check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
npm run start
```

---

## Supabase notes

- **pgvector** is enabled by the migration (`create extension vector`).
- **HNSW indexes** are created on `source_chunks.embedding` and
  `concepts.embedding`. They're incremental — no maintenance required
  for normal use.
- **RLS** is on for every table. Admin role is granted manually via
  `update public.profiles set role = 'admin' where ...`. Future versions
  will surface this in the UI.
- **Storage** — the `sources` bucket should be **private**. URLs are
  served via signed upload/download from the service-role client.

If you change the schema, add a new migration file under
`supabase/migrations/` rather than editing `0001_init.sql`.

---

## Cloudflare Pages deployment *(Batch 1+)*

Course Factory is built to run on Cloudflare Pages with the Next.js
adapter. We'll wire deploy after Batch 1 verifies end-to-end locally.

Outline of the steps:

1. Push the repo to GitHub.
2. Connect the repo to Cloudflare Pages.
3. Build command: `npx @cloudflare/next-on-pages@latest`.
4. Output directory: `.vercel/output/static`.
5. Add environment variables (same set as `.env.local`).
6. Make sure the Node compatibility flag is set:
   `nodejs_compat` enabled on the Pages project.

**Heads up:** the PDF upload and URL scraping routes import `pdf-parse`,
`jsdom`, and `tiktoken` — Node-native modules. We use
`export const runtime = "nodejs"` on those routes so they run on the
Node runtime in Pages. Cloudflare Workers (edge) won't execute them.

---

## API keys & budgets

- **OpenAI embeddings** — set a monthly hard cap in your OpenAI dashboard.
  Embeddings are cheap (~$0.13 / 1M tokens for `text-embedding-3-large`)
  but you can burn money fast on huge re-ingests. The content-hash
  dedupe in `lib/ai/ingest.ts` helps.
- **Anthropic** — the outline generator uses `claude-opus-4-6` by
  default. You can downgrade via `ANTHROPIC_OUTLINE_MODEL=claude-sonnet-4-6`
  in `.env.local` to cut cost ~5×.

---

## Adding admin users

```sql
update public.profiles set role = 'admin' where email = 'someone@example.com';
```

Only admins can:

- Create / edit course projects
- Ingest sources
- Trigger AI generation
- Publish courses

Regular users can browse and (Batch 4+) purchase and learn from
published courses.
