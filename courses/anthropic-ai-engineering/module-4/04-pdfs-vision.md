---
module: 4
position: 4
title: "PDFs, documents, and vision with Claude"
objective: "Pass PDFs and images directly to Claude for parsing and analysis."
estimated_minutes: 9
---

# PDFs, documents, and vision with Claude

## The puzzle

A user uploads a 30-page contract. They ask "what are the termination clauses?"

A photo of a receipt. "What did I spend at restaurants?"

A scan of an invoice. "Extract line items as JSON."

A screenshot of a UI. "What does this button do?"

All of these are *visual* inputs Claude needs to read. The Claude vision and PDF features handle them directly — no separate OCR step, no preprocessing pipeline.

## The simple version

Claude accepts three rich inputs alongside text:

1. **Images** — JPEG, PNG, GIF, WEBP. Pass as base64 or URL.
2. **PDFs** — Claude reads them natively, page by page, including text and visuals.
3. **Documents** — any text/plain content with optional citation support.

You wrap them in content blocks and Claude reads them like text.

## The technical version

### Images

Pass an image as a content block:

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "What's the total amount on this receipt?" },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: imageBase64
        }
      }
    ]
  }]
});
```

Or via URL:

```js
{
  type: "image",
  source: {
    type: "url",
    url: "https://example.com/receipt.png"
  }
}
```

Supported formats: JPEG, PNG, GIF (non-animated), WEBP. Limits per request typically allow a handful of images.

### What vision is good at

- **Reading text in images** — OCR is implicit. Receipts, screenshots, scanned docs.
- **Describing layouts** — UI screenshots, document structure.
- **Identifying objects** — products, scenes, charts.
- **Reading charts and graphs** — extract data points or summaries.
- **Reading handwriting** — variable but often works.

What vision isn't for: pixel-perfect measurement (use specialized libraries), tracking video frames (use a streaming pipeline), or color-critical analysis.

### Combine vision with structured output

Pairing vision with the structured-output tool pattern (Lesson 3.3) is one of the highest-leverage flows in production:

```js
const tools = [
  {
    name: "save_receipt",
    description: "Save extracted receipt data.",
    input_schema: {
      type: "object",
      properties: {
        merchant: { type: "string" },
        date: { type: "string", format: "date" },
        total: { type: "number" },
        currency: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" }
            }
          }
        }
      },
      required: ["merchant", "date", "total"]
    }
  }
];

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools,
  tool_choice: { type: "tool", name: "save_receipt" },
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Extract structured data from this receipt." },
      { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } }
    ]
  }]
});

const receipt = response.content.find(b => b.type === "tool_use").input;
// Typed receipt object, schema-validated
```

This is replacing entire OCR + LLM + parsing pipelines with one Claude call.

### PDFs

PDFs are first-class:

```js
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64
        },
        title: "Q4_Earnings_Report.pdf"
      },
      {
        type: "text",
        text: "What was operating income last year?"
      }
    ]
  }]
});
```

Claude reads the PDF page by page — text *and* visuals. Charts in the PDF are read like images; tables are parsed; text is extracted. No OCR step required.

For PDFs, you can also enable citations (Lesson 4.3) so each claim links back to a specific page.

Limits to know:

- File size limits apply (~32MB typically).
- Page count limits apply (~100 pages typically — check current docs).
- Cost scales with total pages and visual complexity.

### Tokens for vision

Image and PDF inputs count as tokens. Larger / more complex inputs use more tokens.

Approximate guidance from Anthropic:

- A 1024×1024 image is roughly 1,000–1,500 tokens.
- A PDF page averages 1,500–3,000 tokens (depends on density).

Track usage in `response.usage.input_tokens` after the call — vision content is counted there.

### Cost-control patterns

- **Downscale images** before sending. A 4000×3000 phone photo isn't 16× more useful than a 1000×750 — but it does cost 16× more tokens.
- **Crop to the relevant region** when you know what part matters.
- **Use Haiku for screenshot reading** where the task is simple (extract a number, classify a UI).
- **Stuff multiple images** in one call when batchable, instead of N round-trips.
- **Cache document context** with `cache_control` when re-using the same PDF across many queries.

### Common patterns

**Receipt scanner**: image + tool-call structured output. Done.

**Contract analyzer**: PDF + question + citations enabled. Returns answer with page-level citations.

**UI documentation generator**: screenshot + "describe this screen for a help doc" → text.

**Chart data extractor**: chart image + tool defining a `data_points` schema → typed array.

**Visual QA agent**: screenshot + question → answer; pair with computer-use tools for action.

### Privacy considerations

Vision data is often sensitive — IDs, financial documents, photos of people, screenshots of internal systems.

- **Don't store more than needed.** Process and discard if you can.
- **Use Anthropic's data retention controls.** You can opt out of training on your data.
- **Apply your own moderation.** Especially for public-facing products taking user uploads.
- **Region considerations** if you serve EU users (GDPR, etc.).

### When NOT to use Claude vision

- **Pixel-perfect measurement** — use OpenCV / specialized tools.
- **Very large documents** (>100 pages typically) — split into chunks, process each.
- **Real-time video** — use a streaming pipeline, not single-call vision.
- **Pure OCR at extreme volume** — dedicated OCR providers may be cheaper per page.

For everything else, Claude vision is usually the right tool — and one of the simplest pipelines to build.

## Three real-world scenarios

**Scenario 1: The expense system that finished pipelines.**
A team had OCR + LLM + custom JSON parsing for receipts — 4 services, weeks of integration, occasional failures. They replaced the whole stack with one Claude call: image + tool-call structured output. Single API call, schema-validated JSON out, fewer failures.

**Scenario 2: The contract review tool.**
A legal-tech product processed 50-page contracts. They passed the PDF directly with citations enabled. Output: a summary with cited pages for every claim. Lawyers click each claim, jump to the page. Built in two sprints; old version had been in development for a year.

**Scenario 3: The image cost surprise.**
A team sent original 4000×3000 phone photos to Claude. Bill ran high. They downscaled to 1280×960 before sending. Token count dropped 90%; quality on the task (reading receipts) unchanged.

## Common mistakes to avoid

- **Sending huge images at full resolution.** Downscale to reasonable sizes.
- **Skipping `cache_control` on stable PDFs.** Re-sending the same doc many times = wasted money.
- **Ignoring file size and page limits.** Calls fail; user sees errors.
- **No moderation on user uploads.** Public products see adversarial content.
- **Using vision when text would do.** If you already have the text, pass the text.

## Read more

- [Vision (images and PDFs)](https://docs.anthropic.com/en/docs/build-with-claude/vision)
- [PDF support](https://docs.anthropic.com/en/docs/build-with-claude/pdf-support)
- [Image best practices](https://docs.anthropic.com/en/docs/build-with-claude/vision#image-best-practices)

## Summary

- Claude reads **images (JPEG/PNG/GIF/WEBP)** and **PDFs** natively — no separate OCR step.
- Pair vision with **tool-call structured output** to replace OCR + LLM + parser pipelines with one call.
- For PDFs, enable **citations** for page-level grounding.
- **Downscale images** before sending — saves tokens; rarely loses quality on the task.
- **Cache stable documents** with `cache_control` for repeat queries.
- Apply normal **privacy and moderation** practices to user-uploaded content.

That wraps Module 4. Final module: production with Claude — caching, batches, evals, safety.
