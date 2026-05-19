// Token-aware chunker. Tries to break on paragraph and sentence boundaries
// so each chunk reads as a coherent passage. Uses tiktoken for accurate
// token counts against OpenAI models.
import { encoding_for_model, type TiktokenModel } from "tiktoken";

const TARGET_TOKENS = 800;
const OVERLAP_TOKENS = 100;
const MAX_TOKENS = 1200;

let _enc: ReturnType<typeof encoding_for_model> | null = null;
function enc() {
  if (_enc) return _enc;
  // text-embedding-3-* shares cl100k_base; fall back to gpt-4 if the embedding
  // model name isn't in tiktoken's known list.
  try {
    _enc = encoding_for_model(
      (process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large") as TiktokenModel
    );
  } catch {
    _enc = encoding_for_model("gpt-4" as TiktokenModel);
  }
  return _enc;
}

export function countTokens(text: string): number {
  return enc().encode(text).length;
}

export interface Chunk {
  index: number;
  content: string;
  tokenCount: number;
}

/**
 * Break `text` into chunks of ~TARGET_TOKENS tokens with OVERLAP_TOKENS of
 * overlap. We split on paragraph boundaries first; if a single paragraph is
 * still too big, we split it on sentences; if a single sentence is too big
 * (e.g. a code block), we hard-split on whitespace.
 */
export function chunkText(text: string): Chunk[] {
  const cleaned = text.replace(/\r/g, "").trim();
  if (!cleaned) return [];

  // Tokenize once and operate on token windows for accuracy.
  const tokenizer = enc();
  const tokens = tokenizer.encode(cleaned);
  if (tokens.length <= MAX_TOKENS) {
    return [{ index: 0, content: cleaned, tokenCount: tokens.length }];
  }

  // Build coarse paragraph segments with their token counts.
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const segments: { text: string; tokens: number }[] = [];
  for (const p of paragraphs) {
    const ptokens = tokenizer.encode(p).length;
    if (ptokens <= MAX_TOKENS) {
      segments.push({ text: p, tokens: ptokens });
    } else {
      // Split oversized paragraph on sentences.
      const sentences = p.match(/[^.!?]+[.!?]+\s*|\S+/g) ?? [p];
      let buffer = "";
      let buffered = 0;
      for (const s of sentences) {
        const st = tokenizer.encode(s).length;
        if (st > MAX_TOKENS) {
          // Hard split — chunk by words.
          if (buffer) {
            segments.push({ text: buffer.trim(), tokens: buffered });
            buffer = "";
            buffered = 0;
          }
          const words = s.split(/\s+/);
          let wb = "";
          let wbt = 0;
          for (const w of words) {
            const wt = tokenizer.encode(w + " ").length;
            if (wbt + wt > TARGET_TOKENS) {
              segments.push({ text: wb.trim(), tokens: wbt });
              wb = "";
              wbt = 0;
            }
            wb += w + " ";
            wbt += wt;
          }
          if (wb.trim()) segments.push({ text: wb.trim(), tokens: wbt });
          continue;
        }
        if (buffered + st > TARGET_TOKENS) {
          segments.push({ text: buffer.trim(), tokens: buffered });
          buffer = s;
          buffered = st;
        } else {
          buffer += s;
          buffered += st;
        }
      }
      if (buffer.trim()) segments.push({ text: buffer.trim(), tokens: buffered });
    }
  }

  // Pack segments into chunks of TARGET_TOKENS with OVERLAP_TOKENS carry-over.
  const chunks: Chunk[] = [];
  let buf: string[] = [];
  let bufTokens = 0;
  let idx = 0;
  let carry = "";

  for (const seg of segments) {
    if (bufTokens + seg.tokens > TARGET_TOKENS && buf.length > 0) {
      const content = (carry ? carry + "\n\n" : "") + buf.join("\n\n");
      chunks.push({
        index: idx++,
        content,
        tokenCount: tokenizer.encode(content).length,
      });
      // Carry the tail of this chunk for overlap.
      const tail = buf.slice(-1)[0] ?? "";
      const tailTokens = tokenizer.encode(tail).length;
      carry = tailTokens > OVERLAP_TOKENS ? tail.slice(-OVERLAP_TOKENS * 4) : tail;
      buf = [];
      bufTokens = 0;
    }
    buf.push(seg.text);
    bufTokens += seg.tokens;
  }
  if (buf.length > 0) {
    const content = (carry ? carry + "\n\n" : "") + buf.join("\n\n");
    chunks.push({
      index: idx++,
      content,
      tokenCount: tokenizer.encode(content).length,
    });
  }

  return chunks;
}
