---
module: 4
position: 4
title: "Vector embeddings with pgvector"
objective: "AI features inside Postgres."
estimated_minutes: 7
---

# Vector embeddings with pgvector

## Why vectors in the database

Embedding-based AI features (semantic search, RAG, recommendation systems, similarity matching) need a vector store. The 2022-2023 wave brought purpose-built vector databases (Pinecone, Weaviate, Qdrant) to handle this.

Then `pgvector` showed up — a Postgres extension that gives you vector storage, indexing, and similarity search inside Postgres. For most apps it's a strictly better choice than a separate vector DB. You get vectors next to your relational data, with one auth system, one backup story, one set of operational habits.

Supabase has pgvector pre-available; enable it with one command.

## Enabling pgvector

```sql
create extension if not exists vector;
```

Now `vector` is a column type. You can store and query embeddings.

## Storing embeddings

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536) not null,  -- dimension matches your embedding model
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

`vector(1536)` is sized for OpenAI's text-embedding-3-small. text-embedding-3-large uses 3072. Cohere's models vary; check the embedding model docs.

You can also use `vector(384)` for smaller open-source models (sentence-transformers).

## Inserting embeddings

You compute embeddings in your app code (or Edge Function), then insert as a normal column:

```ts
const { data: embeddingResp } = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: content,
});

const embedding = embeddingResp.data[0].embedding;

await supabase.from('documents').insert({
  content,
  embedding,  // array of 1536 numbers
});
```

The vector type accepts an array-of-numbers; supabase-js handles serialization.

## Similarity search

The core operation: find rows whose embeddings are most similar to a query embedding.

Three distance operators:

- `<->` — Euclidean (L2) distance.
- `<#>` — negative inner product (for cosine when vectors are normalized).
- `<=>` — cosine distance (recommended for most NLP embeddings).

Cosine distance ranges 0 (identical) to 2 (opposite); lower is more similar.

```sql
-- Find top 5 most similar documents.
select id, content, 1 - (embedding <=> $1) as similarity
from documents
order by embedding <=> $1
limit 5;
```

`$1` is a parameter binding to your query embedding (a vector).

In supabase-js, expose this via RPC:

```sql
create function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
```

Call from client:

```ts
const { data: matches } = await supabase.rpc('match_documents', {
  query_embedding: queryEmbedding,
  match_threshold: 0.78,
  match_count: 5,
});
```

## Indexing for performance

Naive vector search is O(N) — fine for thousands of rows, slow for millions. pgvector supports approximate-nearest-neighbor (ANN) indexes:

**IVFFlat**:

```sql
create index documents_embedding_idx on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

`lists` is the number of clusters; rule of thumb is `sqrt(rows)`. Tune for your dataset.

**HNSW** (newer, generally better):

```sql
create index documents_embedding_idx on documents
  using hnsw (embedding vector_cosine_ops);
```

HNSW has better recall and faster queries; build is slower and uses more memory. For most production use cases, HNSW.

With an index, queries become sub-linear — typically O(log N) — at the cost of slight recall reduction (the answer is approximate, not exact). For semantic search this is usually fine.

## Hybrid search — full-text + vector

Pure vector search misses exact keyword matches sometimes. Hybrid combines vector similarity with traditional full-text search.

```sql
-- Full-text search column.
alter table documents add column content_tsv tsvector
  generated always as (to_tsvector('english', content)) stored;

create index documents_content_tsv_idx on documents using gin(content_tsv);

-- Hybrid query: rank by both signals.
create function hybrid_search(
  query_text text,
  query_embedding vector(1536),
  match_count int
)
returns table (id uuid, content text, score float)
language sql stable
as $$
  select id, content,
    (
      0.5 * ts_rank(content_tsv, websearch_to_tsquery('english', query_text))
      + 0.5 * (1 - (embedding <=> query_embedding))
    ) as score
  from documents
  where content_tsv @@ websearch_to_tsquery('english', query_text)
    or 1 - (embedding <=> query_embedding) > 0.7
  order by score desc
  limit match_count;
$$;
```

The 0.5/0.5 weighting is a starting point; tune based on results. Hybrid usually beats pure vector for production search.

## RAG (Retrieval-Augmented Generation)

Common pattern: store document chunks with embeddings; on user query, retrieve relevant chunks; send to LLM as context.

```ts
// 1. Embed the user's query.
const queryEmbedding = await embed(userQuery);

// 2. Retrieve top chunks.
const { data: chunks } = await supabase.rpc('match_documents', {
  query_embedding: queryEmbedding,
  match_threshold: 0.75,
  match_count: 5,
});

// 3. Build prompt with retrieved context.
const context = chunks.map(c => c.content).join('\n\n');
const prompt = `Use this context to answer:\n${context}\n\nQuestion: ${userQuery}`;

// 4. Send to LLM.
const answer = await llm.complete(prompt);
```

The same `documents` table serves both your search UI and your RAG pipeline.

## Filtering with metadata

You often want vector search restricted to specific metadata — only documents from a certain project, language, or user:

```sql
create function match_documents_filtered(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project uuid
)
returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from documents
  where project_id = filter_project
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

The combination of metadata filtering + vector search is where pgvector shines vs dedicated vector DBs — relational filters are first-class.

## Costs and sizing

Vectors take space:

- 1536 dimensions × 4 bytes/float = 6 KB per row, plus index overhead.
- 1M rows ≈ 6 GB raw, plus index (2-4 GB extra).

For most apps that fits comfortably in a Supabase project. For 100M+ vectors, consider dedicated infra or aggressive dimension reduction (e.g., truncate to 768 or 512 dims).

## When pgvector vs Pinecone

pgvector wins for:
- Apps already on Postgres/Supabase.
- Datasets under 10M vectors.
- Workloads where you need to filter by relational data.
- One-system simplicity.

Pinecone / Weaviate / Qdrant might win for:
- Datasets in the hundreds of millions+.
- Multi-tenant vector workloads at massive scale.
- Need for specialized indexes (multi-vector, learned indexes).

For 95% of teams in 2026, pgvector is the right tool.

## Updating embeddings when content changes

When document content changes, re-embed and update:

```ts
const newEmbedding = await embed(newContent);

await supabase
  .from('documents')
  .update({ content: newContent, embedding: newEmbedding })
  .eq('id', documentId);
```

For bulk re-embedding (e.g., changing embedding models), process in batches via Edge Function or pg_cron-triggered job.

## Mistakes to avoid

- **Wrong dimension.** Mismatched dims with your embedding model cause errors.
- **No index on large tables.** O(N) search at scale.
- **Cosine on unnormalized vectors.** OpenAI vectors are normalized; many open-source aren't. Verify.
- **No metadata column.** Forces post-query filtering instead of DB-side.
- **Storing original text only in vector DB.** Lose ability to display the source.

## Summary

- pgvector adds vector storage and similarity search to Postgres.
- Dimension matches your embedding model (1536 for OpenAI small, 3072 for large).
- Cosine distance (`<=>`) is the standard.
- HNSW index for fast ANN search; IVFFlat as alternative.
- Hybrid search (full-text + vector) outperforms pure vector for production.
- pgvector beats dedicated vector DBs for most apps under 10M vectors.
- RAG fits cleanly: embed chunks → store → retrieve → prompt LLM.

Next module: production operations.
