---
module: 5
position: 1
title: "RAG systems with sentence-transformers"
objective: "Build retrieval-augmented generation pipelines."
estimated_minutes: 5
---

# RAG systems with sentence-transformers

## What RAG is

RAG = Retrieval-Augmented Generation:
1. **Embed** documents into vectors.
2. **Store** in vector database.
3. **At query time:** embed query; find similar docs; pass top-k to LLM as context.
4. **LLM generates** answer using retrieved context.

Solves: LLM knowledge cutoff; specific company data; hallucination.

## Why RAG vs. fine-tuning

- **RAG.** Easy to update (just re-embed); current data; lower compute.
- **Fine-tuning.** Bake knowledge into model; lower latency at query; harder to update.

For most knowledge-intensive use cases: RAG.
For style / behavior tuning: fine-tuning.
Often combined.

## Pipeline components

1. **Embedding model.** sentence-transformers (BGE, MPNet).
2. **Vector database.** Chroma, Pinecone, Weaviate, Qdrant, FAISS.
3. **LLM.** For generation (Llama, GPT, Claude).
4. **Orchestration.** LangChain, LlamaIndex, custom.

## Simple RAG example

```python
from sentence_transformers import SentenceTransformer
import chromadb

# Setup
embedder = SentenceTransformer("BAAI/bge-large-en-v1.5")
client = chromadb.Client()
collection = client.create_collection("docs")

# Ingest
documents = ["doc 1 content", "doc 2 content", ...]
embeddings = embedder.encode(documents)
collection.add(
    ids=[f"doc_{i}" for i in range(len(documents))],
    embeddings=embeddings.tolist(),
    documents=documents
)

# Query
query = "User's question"
query_emb = embedder.encode([query])
results = collection.query(query_embeddings=query_emb.tolist(), n_results=3)
context = "\n\n".join(results["documents"][0])

# Generate
prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
response = llm.generate(prompt)
```

For: basic RAG in ~30 lines.

## Chunking strategy

Long documents need chunking:
- **Fixed-size chunks.** 500-1000 tokens each.
- **Sentence-based.** Break at sentence boundaries.
- **Recursive.** Split by headers, then paragraphs, then sentences.
- **Semantic.** Detect topic boundaries.

Overlap (50-100 tokens) between chunks for context continuity.

For: long documents; better retrieval.

## Embedding models

Top 2026 options:
- **BAAI/bge-large-en-v1.5.** SOTA general English.
- **BAAI/bge-m3.** Multilingual.
- **all-mpnet-base-v2.** Smaller; faster.
- **all-MiniLM-L6-v2.** Tiny; very fast.
- **e5-large-v2.** Strong general.
- **Cohere Embed v3 / OpenAI embeddings.** Closed but quality.

Match to language + accuracy + speed needs.

## Vector databases

Options:
- **Chroma.** Local; easy; SQLite-backed.
- **FAISS.** Facebook's; in-process; fastest local.
- **Pinecone.** Hosted; production-grade.
- **Weaviate.** Open + hosted.
- **Qdrant.** Open + hosted.
- **pgvector.** Postgres extension.

For prototyping: Chroma. For production: depends on scale + ops preference.

## Retrieval methods

- **Cosine similarity (default).** Vector closeness.
- **MMR (Maximal Marginal Relevance).** Diversity in results.
- **Hybrid.** Combine vector + keyword (BM25).
- **Re-ranking.** Smaller cross-encoder for top results.

For better retrieval: hybrid + re-ranking.

## Re-ranking

After initial retrieval:
- Top-k retrieved by vector similarity.
- Re-rank with cross-encoder (more accurate but slower).
- Take top-N from re-ranked.

Cross-encoders: `cross-encoder/ms-marco-MiniLM-L-12-v2`, `BAAI/bge-reranker-large`.

For: better top-k quality at cost of latency.

## Context window management

LLM context limits:
- **Llama 3.1 8B.** 128K tokens.
- **Claude 3.5.** 200K.
- **Gemini 1.5.** 1M+.
- **Most older models.** 4K-32K.

Don't exceed; use most relevant context.

For: balance comprehensiveness + context limit.

## Prompt template

Standard RAG prompt:
```
You are a helpful assistant. Use only the provided context to answer.

Context:
{context}

Question: {query}

Answer:
```

For: grounding generation in retrieved context.

## Citation

For trust + verification:
- Include doc IDs in context.
- Ask LLM to cite sources.
- Display sources in UI.

For: user can verify answer; reduce hallucination perception.

## Common issues

- **Bad chunks.** Critical info split across chunks.
- **Poor embeddings.** Mismatched semantic.
- **Retrieval miss.** Right answer not in top-k.
- **LLM ignores context.** Generates from training instead.
- **Hallucination.** LLM invents despite context.

Fix iteratively; each issue has techniques.

## Mistakes to avoid

- **Massive chunks.** Lose retrieval precision.
- **Tiny chunks.** Lose context.
- **No re-ranking.** Top-k less accurate.
- **Vector DB without index.** Slow.
- **LLM without context-only instruction.** Generates from training.

## Summary

- RAG = embed docs + retrieve relevant + LLM generates with context.
- sentence-transformers for embeddings.
- Chroma / Pinecone / Weaviate / Qdrant for vector storage.
- Chunking + overlap for long documents.
- Re-ranking + hybrid search for better retrieval.
- Prompt template grounds LLM in context.

Next: multi-model pipelines.
