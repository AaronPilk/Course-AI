import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic() {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const MODELS = {
  outline: process.env.ANTHROPIC_OUTLINE_MODEL ?? "claude-opus-4-6",
  lesson: process.env.ANTHROPIC_LESSON_MODEL ?? "claude-sonnet-4-6",
  extract: process.env.ANTHROPIC_EXTRACT_MODEL ?? "claude-sonnet-4-6",
};
