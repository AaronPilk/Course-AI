// Wraps pdf-parse with a streaming-friendly buffer interface and tidies the
// extracted text so chunking works well.
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import — pdf-parse pulls in fs at top level which breaks the
  // Next.js bundler when imported statically. We've also marked it as a
  // serverExternalPackage in next.config.mjs.
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return cleanText(result.text);
}

export function cleanText(input: string): string {
  return input
    .replace(/ /g, " ")
    .replace(/[\t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
