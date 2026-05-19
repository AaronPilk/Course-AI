import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (client) return client;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large";

// We reduce the natural 3072-dim output to 1536 so the vectors fit cleanly
// in pgvector's HNSW index limits while preserving most quality.
export const EMBEDDING_DIMENSIONS = 1536;
