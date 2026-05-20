---
module: 4
position: 3
title: "Citations — grounding Claude's answers in sources"
objective: "Use Claude's citation features to return verifiable answers."
estimated_minutes: 9
---

# Citations — grounding Claude's answers in sources

## The puzzle

You built RAG. You pass relevant chunks. Claude usually answers correctly. But "usually" isn't enough for legal advice, medical info, support that quotes policy, or anything where users need to verify the source.

Users want to know **where the answer came from**. Did Claude paraphrase from doc A? Quote from doc B? Mix doc C and D? Or hallucinate?

Citations let Claude surface exactly which parts of which sources support each part of the answer. This lesson covers both Claude's built-in Citations API and the simpler tag-based citation pattern.

## The simple version

Two ways to do citations on Claude:

1. **Built-in Citations** — pass documents in a structured format; Claude returns answers with per-sentence citations linking back to specific portions of the source. Most reliable.
2. **Tagged citations** — pass chunks with IDs; ask Claude to reference IDs in the answer. Simpler; works on any Claude call.

Both are better than no citations. Built-in is the gold standard for accuracy-critical use cases.

## The technical version

### Built-in Citations API

Anthropic's Citations feature lets you pass documents and get back per-claim citations automatically. Each citation references the exact characters in the source that support the claim.

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
          type: "text",
          media_type: "text/plain",
          data: refundPolicyText
        },
        title: "Refund Policy",
        citations: { enabled: true }
      },
      {
        type: "document",
        source: {
          type: "text",
          media_type: "text/plain",
          data: shippingPolicyText
        },
        title: "Shipping Policy",
        citations: { enabled: true }
      },
      {
        type: "text",
        text: "Can I return an item I received last week if I've already opened it?"
      }
    ]
  }]
});

// Response content has interleaved text and citation blocks
for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  } else if (block.type === "citation") {
    console.log("Cite:", block.cited_text, "from", block.document_title);
  }
}
```

Claude returns the answer interleaved with citations. Each citation block tells you:

- The exact text from the source.
- Which document it came from.
- Character offsets (start/end) into the source.

You can render this in the UI as inline citations (numbered footnotes, hover-cards, link-out to the source).

### Citation document formats

Citations work with multiple source types:

- **`text/plain`** — raw text.
- **`application/pdf`** — pass a PDF; Claude reads and cites it.
- **Custom documents** — provide `content` as structured blocks if you want fine-grained control.

For PDFs:

```js
content: [{
  type: "document",
  source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
  title: "Annual Report 2024",
  citations: { enabled: true }
}, { type: "text", text: "What was operating income last year?" }]
```

Claude reads the PDF and returns citations pointing at specific pages.

### Tagged citation pattern (no API feature)

For ad-hoc RAG without the Citations API, use a simpler tag-based pattern:

```
You answer questions using only the documents in <sources>. After each claim, cite the relevant source by ID in brackets like [src:2].

<sources>
<source id="1">[content of source 1]</source>
<source id="2">[content of source 2]</source>
<source id="3">[content of source 3]</source>
</sources>

<question>${userQuestion}</question>
```

Claude responds with inline citations like:

```
You can return opened items within 30 days, but there's a 25% restocking fee [src:2]. The fee is waived if the item was defective [src:1, src:3].
```

Parse the brackets in your code, render as footnote-style links, and you have ground citations.

This is less precise than the built-in Citations API (it cites whole sources, not specific text spans), but it's simpler and works anywhere.

### When to use which

**Built-in Citations API**:

- High-stakes accuracy (legal, medical, support quoting policy).
- You want span-level citation precision.
- You're passing documents (not arbitrary chunks).
- You're OK with the slightly higher cost (citations add some output tokens).

**Tagged citations**:

- Standard RAG flows with many small chunks.
- You want minimum implementation complexity.
- Per-chunk attribution is enough; you don't need span-level offsets.

### Citation UX

Surface citations in a way users can verify:

- **Inline numbers** [1] [2] that hover-expand to show the source.
- **Sidebar with sources** listed and highlighted on click.
- **Direct link to the source** (URL, PDF page anchor).
- **The exact quoted text** so users see what Claude based the answer on.

Don't bury citations. The whole point is users can audit the answer. Make audit easy.

### Citations + chain-of-thought

Pair citations with structured chain-of-thought (Lesson 2.4):

```
<thinking>
Source 2 says items can be returned within 30 days unless opened, in which case there's a 25% restocking fee.
Source 3 confirms this and notes the fee is waived for defective items.
The user said they opened it but didn't say if it was defective. I'll answer with both cases.
</thinking>

<answer>
You can return your opened item within 30 days, with a 25% restocking fee [src:2]. If the item was defective when it arrived, the fee is waived [src:3]. Was your item defective or in working order?
</answer>
```

Citations *plus* visible reasoning *plus* a clarifying question. This is the gold standard for support-style answers.

### Cost of citations

Built-in citations add some output tokens (the citation blocks). Typical overhead is 5–15% on the output. Worth it for accuracy-critical use cases.

Tagged citations add a few tokens per cited claim. Negligible.

### When citations look wrong

Claude is good at citing, but you'll occasionally see issues:

- **Over-citing** — citing every sentence including obvious ones.
- **Wrong source attributed** — claim is right but cite is to a different source than the actual support.
- **Hallucinated citations** — extremely rare with the built-in API; more common with tagged style if Claude over-extends.

Fixes:

- Validate citations in your code — confirm the cited text actually exists in the cited document.
- Build evals (Module 5) that grade citation accuracy specifically.
- For tagged citations, use prompt patterns like "only cite sources that directly support the claim; don't pad."

## Three real-world scenarios

**Scenario 1: The support bot that became auditable.**
A team's support bot answered policy questions but support reps couldn't verify the answers without searching for the policy themselves. They turned on the Citations API. Every answer now shows the exact policy text. Reps stopped second-guessing the bot; user trust improved.

**Scenario 2: The legal research tool with span-level citations.**
A legal research product paired Contextual Retrieval (Lesson 4.2) with the Citations API. Each chunk in the answer linked back to the exact line of the cited case. Lawyers could click any claim and jump to the source. Differentiated them from competitors who only gave paragraph-level attribution.

**Scenario 3: The over-citing problem.**
A team's first deployment over-cited — every claim had three citations. UI got noisy. They tuned the prompt: "Cite only the most directly supporting source per claim. Don't pad." Citation density dropped to comfortable levels without sacrificing verifiability.

## Common mistakes to avoid

- **No citation pattern at all in accuracy-critical products.** Hard to debug, hard for users to trust.
- **Built-in citations enabled but not surfaced in UI.** You did the work; show users.
- **Free-form citations without validation.** Verify the cited text actually appears in the cited doc.
- **Burying sources behind a click.** Users won't audit if it's hard.
- **Citing every sentence.** Noisy. Cite the supporting claims, not the obvious ones.

## Read more

- [Citations](https://docs.anthropic.com/en/docs/build-with-claude/citations)
- [Vision (PDFs)](https://docs.anthropic.com/en/docs/build-with-claude/vision)
- [Anthropic cookbook citations examples](https://github.com/anthropics/anthropic-cookbook)

## Summary

- **Citations** let Claude ground answers in sources users can verify.
- **Built-in Citations API** — pass documents with `citations: { enabled: true }`, get span-level citations back. Best for high-stakes accuracy.
- **Tagged citations** — simple `[src:N]` pattern works on any Claude call. Per-chunk attribution.
- **Surface citations in UI** prominently — they only have value if users can audit.
- **Pair with chain-of-thought** for thinking-with-citations — auditable reasoning.
- **Validate** that cited text actually appears in cited docs; build citation-accuracy into evals.

Next: PDFs, documents, and vision — passing rich content to Claude.
