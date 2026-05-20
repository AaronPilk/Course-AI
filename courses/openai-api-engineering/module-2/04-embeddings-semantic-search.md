---
module: 2
position: 4
title: "Embeddings and semantic search"
objective: "Build a working semantic search / RAG system with text-embedding-3 and a vector store."
estimated_minutes: 14
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Embeddings and semantic search

## The puzzle

Your customer support docs have 5,000 articles. A user asks: "How do I cancel my subscription on the iPad app?"

You want to find the right article. Keyword search fails: the article is titled "Managing your account on iOS." No keyword overlap.

You want the model to answer the question. But the docs are 5,000 articles long — you can't fit them all in the context window.

The solution to both problems is the same: **embeddings**. Convert each article into a numerical vector that captures its meaning. Convert the question into a vector too. Find the article whose vector is closest to the question's vector. That's the article you want.

Then send the question + that article (and maybe a few more) to the model. It answers.

This pattern — **retrieval-augmented generation (RAG)** — is how most production AI products handle "use my data." This lesson teaches it from scratch.

## The simple version

An **embedding** is a numerical vector (a list of numbers) that represents the meaning of a piece of text. Two texts with similar meaning get vectors that are *close* (by some distance metric, usually cosine similarity).

The workflow:

1. **Embed all your content** once. Store vectors in a database.
2. **At query time, embed the question** with the same model.
3. **Search the database** for vectors closest to the question vector.
4. **Retrieve the top matches** as text.
5. **Send retrieved text + question to the model** to generate an answer.

You don't need to understand the math. You need to understand:

- Which embedding model to use.
- How to store and search vectors.
- How to chunk content for good retrieval.
- How to combine retrieval with the model.

That's RAG. It's the most common "use my data" pattern in modern AI products.

## The technical version

### What an embedding actually is

A vector of numbers — typically 256 to 3,072 dimensions — produced by an embedding model from a piece of input text.

```js
const result = await openai.embeddings.create({
  model: "text-embedding-3-large",
  input: "How do I cancel my subscription?",
  dimensions: 1536,
});

const vector = result.data[0].embedding;
// vector is now a Float32Array of length 1536
// e.g., [0.012, -0.034, 0.087, ..., 0.045]
```

The vector doesn't *mean* anything to a human. The math means:

- Text with similar meaning → similar vectors.
- Text about different topics → very different vectors.

You compare two vectors with **cosine similarity** (a number between -1 and 1, where 1 = identical meaning, 0 = unrelated, -1 = opposite).

### Picking an embedding model

For new code in 2026:

- **`text-embedding-3-large`** with `dimensions: 1536` is the sensible default.
  - Strong quality.
  - 1,536 dimensions fits pgvector's HNSW index limits and most vector stores comfortably.
  - You can reduce further (`dimensions: 256` etc.) if storage matters; quality drops slightly.
- **`text-embedding-3-small`** is cheaper and lower quality. Fine for low-stakes applications, but the cost difference is usually negligible compared to the quality gain.
- Older embedding models (`text-embedding-ada-002` etc.) are legacy — use `3-*` for new code.

### Chunking — the most underrated step

Embedding *whole documents* doesn't work well. A 10,000-word manual covers many topics. Its single vector is a smeared average of all of them. A query about one specific topic won't match well.

The fix: **chunk** documents into smaller passages, embed each chunk separately.

Common chunk sizes:

- **~500–800 tokens per chunk** is a typical sweet spot.
- Smaller (200–400 tokens): better precision, more chunks, more storage.
- Larger (1,000–2,000 tokens): more context per chunk, but signals get diluted.

Chunking strategies:

- **Fixed-size** with overlap (e.g., 800 tokens, 100-token overlap). Simple, works for most prose.
- **Structure-aware** (chunk on headings, paragraphs, sentence boundaries). Better quality, more code.
- **Semantic chunking** (use embeddings to find natural breakpoints). Best quality, more complex.

For most projects: start with fixed-size token chunking with overlap. Move to structure-aware if quality is weak.

### Storing vectors

You need a database that supports vector similarity search. Options:

- **Postgres + pgvector** — open-source, simple, scales to millions of vectors with HNSW indexing.
- **SQLite + sqlite-vec or in-memory cosine** — fine for local dev or smaller datasets.
- **Pinecone, Weaviate, Qdrant, Chroma** — dedicated vector DBs. Faster at huge scale.
- **Search-engine-backed** options (Elasticsearch, OpenSearch, Algolia) — increasingly include vector support.

For most product use cases, **Postgres + pgvector** is the right call. Same database you already use. Same backup/restore tooling. Same query language.

### Storing the actual chunks

Alongside each vector, store the original chunk text. You need it for two reasons:

1. To return to the model as retrieved context.
2. To show the user (when citing sources, for instance).

A typical schema:

```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX chunks_embedding_hnsw_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);
```

That's enough to power a working RAG pipeline.

### Doing the search

At query time:

```js
async function semanticSearch(query, projectId, k = 5) {
  // 1. Embed the query
  const result = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
    dimensions: 1536,
  });
  const queryVector = result.data[0].embedding;

  // 2. Search the vector store
  const rows = await db.query(`
    SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity
    FROM chunks
    WHERE document_id IN (SELECT id FROM documents WHERE project_id = $2)
    ORDER BY embedding <=> $1::vector
    LIMIT $3
  `, [queryVector, projectId, k]);

  return rows;
}
```

The `<=>` operator is pgvector's cosine distance. Lower distance = higher similarity. We sort ascending and return the top `k` matches.

### Combining retrieval with the model

Once you have retrieved chunks, send them to the model along with the user's question:

```js
const matches = await semanticSearch(userQuestion, projectId, 5);

const context = matches
  .map((m, i) => `[Source ${i + 1}]\n${m.content}`)
  .join("\n\n---\n\n");

const response = await openai.responses.create({
  model: "gpt-5-mini",
  instructions:
    "You answer using only the sources provided. " +
    "If the answer isn't in the sources, say so honestly. " +
    "Cite sources by number.",
  input: `Question: ${userQuestion}\n\nSources:\n\n${context}`,
});

console.log(response.output_text);
```

That's a working RAG system in about 30 lines of code.

### Reranking — the underrated upgrade

Top-K retrieval by raw cosine similarity is often good, sometimes great, occasionally wrong. A common upgrade: **rerank** the top 20 matches with a more expensive method.

Reranking options:

- **Cross-encoder rerankers** (specialized models that score query/passage pairs jointly). Better than raw embedding similarity.
- **LLM-based reranking** — ask a fast model "given this query, rank these 20 passages by relevance." Often the highest-quality option for small lists.
- **Hybrid scoring** — combine vector similarity with keyword (BM25) scores. Helps with exact-match queries (like product SKUs) that embeddings handle weakly.

For most products: start with top-K cosine, evaluate quality, add reranking if you see retrieval failures.

### The "lost in the middle" trick

Studies (and Google's own AI Optimization Guide) note that very long contexts degrade quality — the model attends less to information in the middle of the input.

A pattern that helps:

1. Retrieve top 10 chunks.
2. Rerank or simply trust embedding similarity order.
3. Put the most relevant chunk **first**.
4. Put the next most relevant **last**.
5. Fill the middle with the rest.

The model attends more to start and end. Surfacing your top hits at both ends usually helps.

### Cost economics

Embedding cost:

- `text-embedding-3-large` is roughly $0.13 per 1M tokens (current pricing).
- A 5,000-article corpus at ~1,000 tokens per article = 5M tokens = ~$0.65 *one time*.
- After embedding, search queries cost almost nothing (just the single query embedding, ~$0.0001 per query).

Generation cost (per RAG response):

- Question + retrieved context (5 chunks × 800 tokens = 4,000 tokens) + system prompt
- Plus the model's output

A typical RAG response on `gpt-5-mini` is $0.01–$0.05 per answer.

Storage cost is mostly vector storage — pennies per million vectors.

The cost economics are *excellent* for production. RAG is one of the best ROI patterns in AI.

### Common pitfalls

**1. Re-embedding what you don't need to.** Embeddings are deterministic for the same input + model + dimensions. Hash content and skip re-embedding when nothing changed.

**2. Mixing embedding models.** Vectors from `text-embedding-3-large` aren't compatible with `3-small`. Don't switch mid-corpus without re-embedding everything.

**3. Forgetting to filter by ownership/scope.** Vector search returns the most similar chunks across whatever you query. Filter by `user_id`, `document_id`, or other access-control fields before similarity ranking.

**4. No metadata for filtering.** Real RAG queries often want "only docs from the last 30 days about topic X" — embed for relevance, filter for scope. Store metadata.

**5. Treating the embedding as an oracle.** Embeddings are statistical, not symbolic. "Order #12345" might not match well via embeddings (numbers are weak signals). Use keyword search for exact-match cases.

## An analogy: the world's smartest librarian

A library has 100,000 books. A regular librarian can find one if you know the title or the call number.

Now imagine a librarian who has read every book and remembers the *meaning* of each — what topics it covers, what voice it uses, what questions it answers.

When you ask "I'm looking for a book about how to negotiate raises with a difficult boss," the regular librarian shrugs (no keywords match). The semantic librarian walks you straight to the right shelf — even if no book has that exact phrase in its title.

That's embeddings. The model has "read" each chunk and represented its meaning as a vector. Search is now meaning-based, not keyword-based.

The librarian doesn't run the library, but they make the library *useful*. RAG is putting this librarian on your data.

## Three real-world scenarios

**Scenario 1: The support team that 3x'd ticket resolution speed.**
A SaaS company embedded their entire help center (3,000 articles). When a customer submitted a ticket, the system retrieved the top 5 relevant articles and either: (a) suggested them as self-serve solutions, or (b) appended them to the support agent's view as context. Resolution time dropped from average 24 hours to 8 hours.

**Scenario 2: The chunking change that doubled accuracy.**
A team chunked documents at fixed 1,500-token boundaries. Retrieval quality was inconsistent — sometimes the right answer was split across two chunks. They switched to structure-aware chunking (chunked on heading boundaries with a 800-token soft limit). Retrieval accuracy nearly doubled. Lesson: chunking strategy is a critical lever, not a detail.

**Scenario 3: The mixed-model embedding disaster.**
A team initially embedded with `ada-002`. Six months later they re-embedded *new* documents with `text-embedding-3-large`, but didn't re-embed the old corpus. Vectors from the two models aren't compatible. Search across the corpus was effectively broken. Recovery: re-embed everything with the new model. A week of compute time and a learning experience.

## Common mistakes to avoid

- **Embedding whole documents instead of chunks.** Smearing the meaning across topics.
- **Sticking with `ada-002`.** It's legacy. `text-embedding-3-large` at 1536 dims is the default for new code.
- **No reranking step.** Top-K cosine is good, not great. Reranking often unlocks the next quality tier.
- **Mixing embedding models within one corpus.** Vectors aren't compatible across models.
- **Forgetting access control on retrieval.** Search returns everything in the index — filter by ownership *before* similarity ranking, not after.
- **Treating embeddings as exact-match search.** Use keyword/BM25 for codes, SKUs, identifiers.
- **Not storing the original chunk text.** You need it to return to the model.

## Read more

- [Embeddings guide](https://platform.openai.com/docs/guides/embeddings) — primary OpenAI reference
- [pgvector documentation](https://github.com/pgvector/pgvector) — the standard Postgres vector extension
- [OpenAI Cookbook on RAG](https://cookbook.openai.com) — working RAG implementations

## Summary

- **Embeddings** convert text to vectors that capture meaning. Similar meaning → close vectors.
- Use `text-embedding-3-large` at `dimensions: 1536` for new code.
- **Chunk** documents into ~500–800-token passages before embedding. Whole-document embeddings smear meaning.
- Store vectors in a vector-capable database (pgvector for most products).
- At query time: embed the question, search the store for closest vectors, return the chunk text.
- Feed retrieved chunks + question to the model. The model answers, grounded in your data.
- Add reranking when raw cosine similarity isn't sharp enough. Filter by access scope before similarity search.

Next lesson: the multimodal stack. Images, audio, video — the parts of OpenAI's API that handle data that isn't text.
