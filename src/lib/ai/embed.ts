// Batched embedding helper. Embeds up to MAX_BATCH chunks per OpenAI call.
import { getOpenAI, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./openai";

const MAX_BATCH = 96; // text-embedding-3 supports up to 2048, but small batches keep latency predictable.

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const openai = getOpenAI();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const batch = texts.slice(i, i + MAX_BATCH);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    for (const item of res.data) {
      out.push(item.embedding as number[]);
    }
  }
  return out;
}

export async function embedText(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text]);
  return vec;
}
