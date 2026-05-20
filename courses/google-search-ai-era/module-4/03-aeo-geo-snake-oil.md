---
module: 4
position: 3
title: "The AEO/GEO snake oil — Google's own debunking"
objective: "Identify the popular 'AI optimization' tactics Google says to ignore — llms.txt files, content chunking for AI, inauthentic mentions — and explain why they don't work."
estimated_minutes: 13
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# The AEO/GEO snake oil — Google's own debunking

## The puzzle

You attend a marketing conference in 2026. Three speakers in a row pitch you on:

- "GEO — the new layer of optimization for AI search"
- "Your site needs an llms.txt file or you'll be invisible to AI"
- "Chunk your content for AI consumption — paragraphs over 80 words won't make it into AI Overviews"

You go home and check Google's documentation. There's an entire section called *"Mythbusting generative AI search: what you don't need to do."* Every single one of those three claims is in there as a thing Google explicitly says is unnecessary.

This lesson is the receipt list. When you hear the marketing pitches, you'll know exactly what to point at.

## The simple version

Google's AI Optimization Guide has a section labeled exactly this:

> "Mythbusting generative AI search: what you don't need to do"

In it, Google explicitly debunks the most popular tactics being sold as "AI SEO." The five biggest ones:

1. **llms.txt files** — not needed, no special handling
2. **"Chunking" content** for AI — not needed
3. **Rewriting content "for AI"** — not needed; AI understands normal prose
4. **Manufactured mentions** across the web — doesn't help, may hurt
5. **Over-focusing on structured data** — useful for rich results but not required for AI

When someone sells you any of these as critical for AI visibility, you can confidently point them to Google's own docs.

## The technical version

### Myth 1: llms.txt files

A growing fad in 2025: create a file called `llms.txt` at the root of your domain that summarizes your site for AI systems. Sometimes also `llms-full.txt` with deeper content. Proponents claim this helps AI search engines find and parse your content faster.

Google's exact position, from the AI Optimization Guide:

> "LLMS.txt files and other 'special' markup: You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in generative AI search. Note that Google may discover, crawl, and index many kinds of files in addition to HTML on a website: this doesn't mean that the file is treated in a special way."

Direct quote. No nuance. *Don't bother.*

Google's AI features use the same Search index as everything else — and that index is built from your normal HTML pages. There is no "AI side door" that reads llms.txt and gets you better results.

What's *true*: some AI tools outside Google (like Anthropic's documentation, or various LLM training pipelines) do respect llms.txt as a convention. If you care about being a useful source to those specific tools, fine. But this is not a Google ranking move.

### Myth 2: "Chunking" content for AI

The pitch: rewrite your content into short, self-contained chunks (paragraphs of 60–80 words, each with a clear heading) because AI systems "consume content in chunks."

Google directly:

> "'Chunking' content: There's no requirement to break your content into tiny pieces for AI to better understand it. Google systems are able to understand the nuance of multiple topics on a page and show the relevant piece to users. However, sometimes shorter (or longer!) pages can work well depending on your audience and subject matter. There's no ideal page length, and in the end, make pages for your audience, not just for generative AI search."

So: write paragraphs the way the topic naturally needs them. AI Overviews can quote sentences from the middle of a 500-word paragraph just as well as from a 50-word chunk.

What's actually true here: clarity helps. Pages that are *internally well-structured* — with clear subheadings, scannable lists where appropriate, coherent paragraphs — are easier for both humans and AI to parse. But that's "write clearly," not "break everything into 80-word chunks."

### Myth 3: Rewriting content "for AI"

A whole industry has emerged around rewriting existing content into "AI-friendly" formats — pseudo-Q&A, heavy bulleted lists, repetitive keyword variations.

Google:

> "Rewriting content just for AI systems: You don't need to write in a specific way just for generative AI search. AI systems can understand synonyms and general meanings of what someone is seeking, in order to connect them with content that might not use the same precise words. This means you don't have to worry that you don't have enough 'long-tail' keywords or haven't captured every variation of how someone might seek content like yours."

The "every variation" point is important. A page that says "how to fix a flat tire on your bike" doesn't need to also say "how do you repair a punctured bicycle wheel," "bike tire fix," "patch a bike tire," etc. AI features understand they're all the same thing.

The old SEO tactic of generating dozens of pages targeting slight keyword variations was already weak in 2020. In the AI era, it's both ineffective and a scaled-content-abuse risk.

### Myth 4: Manufactured "mentions" and inauthentic citations

A newer tactic: pay services to get your brand "mentioned" across the web — in forum posts, fake reviews, AI training datasets, "expert citation networks." The pitch: AI Overviews favor brands with high mention frequency.

Google:

> "Seeking inauthentic 'mentions': Just like the rest of Google Search, our generative AI features can show what's being said about products and services across the web, including in blogs, videos, and forum discussions. However, seeking inauthentic 'mentions' across the web isn't as helpful as it might seem. Our core ranking systems focus on high-quality content while other systems block spam; our generative AI features depend on both."

Translation: AI features inherit the same spam-detection systems as classic Search. Manufactured citations get caught by the same spam algorithms that catch link networks. You don't gain from the manufactured mentions; you risk the spam policy violation.

Real, organic citations from credible sources still help — same as they always did. Manufactured ones are a poor trade.

### Myth 5: Over-focusing on structured data

This one's nuanced. Structured data (schema.org markup) does have value — for things like product rich results, recipe carousels, FAQ accordions (in some cases), and review snippets.

But there's been a wave of pitches claiming you need expanded or specialized schema specifically for AI Overviews.

Google:

> "Overfocusing on structured data: Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add. However, it's a good idea to continue using it as part of your overall SEO strategy, as it helps with being eligible for rich results on Google Search."

Practical guidance:

- **Add structured data** where it makes you eligible for actual rich results (Product, Recipe, Article, Organization, etc.).
- **Don't pay for "AI-specific schema audits"** that promise dedicated AI optimization through markup.
- **Don't add manufactured FAQ markup** to non-FAQ pages just to fish for rich results — Google has scaled FAQ rich results back significantly.

Structured data is fine. "Schema for AI" is mostly snake oil.

### Bonus myth: "AEO" and "GEO" as distinct disciplines

You'll see entire conferences, certifications, and consultancies built around "Answer Engine Optimization" (AEO) and "Generative Engine Optimization" (GEO). They're sold as the next big thing — separate skills from classic SEO.

Google addresses this head-on:

> "From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO."

There is no AEO discipline. There is no GEO discipline. There is just SEO, applied with attention to the new properties AI features add (covered in the previous lesson).

If a consultant's value proposition is built on AEO/GEO being a *separate field*, they're either confused or selling repackaged classic SEO at a markup.

### What about "knowledge graph" entries and brand mentions?

A subtler claim some vendors make: "AI features pull from Google's knowledge graph, so you need entity SEO."

This is partially true and almost entirely overhyped. Google does maintain a knowledge graph of entities. Brand presence in the knowledge graph can affect how AI features describe a brand. But:

- The knowledge graph is built from existing high-quality content — Wikipedia, authoritative profiles, structured data on the brand's own site.
- There's no "submission process" to get into the knowledge graph.
- The same things that earn classic search authority earn knowledge graph presence — there's no specialized tactic.

Treat entity / knowledge graph claims with the same skepticism as the rest of the AEO/GEO industry.

## An analogy: the alternative medicine industry

When a new medical treatment becomes popular (immunotherapy, GLP-1s, gene editing), an alternative medicine industry springs up around it. "Boost your immunotherapy results with this herbal supplement." "Natural GLP-1 alternatives." "DNA-aligned crystal healing."

Most of it ranges from useless to actively harmful. The medical establishment publishes papers debunking it. The supplements industry sells it anyway because the demand is real.

The pattern in SEO is identical. AI Overviews are a real new technology. The desire to "optimize for them" is real. A vacuum opens, and an alternative industry rushes in to fill it. They sell tactics that *sound* plausible, that promise simple solutions, that are easier to buy than to verify.

The cure is reading Google's own documentation. The documentation is short and free. Most of the alternative industry's claims directly contradict it. When you find a claim that *isn't* in Google's docs, treat it the way you'd treat a homeopathic remedy: maybe harmless, definitely no substitute for actual medicine.

## Three real-world scenarios

**Scenario 1: The mid-market brand sold "GEO certification."**
A mid-market brand paid $50,000 for a "GEO certification" engagement that promised dedicated AI search optimization. After 9 months, they had:
- A new llms.txt file
- 200 pages restructured into "AI-friendly chunks"
- A "Mention Network" of inauthentic citations
- Zero measurable change in AI Overview citations
- A noticeable decline in classic rankings (the restructured pages were now worse for human readers)

Recovery took two more years. The lesson cost six figures.

**Scenario 2: The site that did nothing for AI and won anyway.**
A small specialty site producing deep, non-commodity content in its niche didn't add llms.txt, didn't restructure for AI, didn't pursue any AEO/GEO tactic. Their content was thorough, well-cited, and clearly authored. Within 18 months of AI Overviews launching, they were among the most-cited sources for their niche's queries. The differentiator was content quality, not "AI tactics."

**Scenario 3: The agency that pivoted honestly.**
A small SEO agency saw the AEO/GEO boom and decided not to chase it. Their messaging stayed: classic SEO fundamentals + content quality + technical hygiene. They lost some prospects to flashier competitors. They retained better clients who valued substance. Two years later they're growing while several AEO-focused agencies have folded as their clients realized the tactics didn't work.

## Common mistakes to avoid

- **Paying for llms.txt creation services.** Free file, no Google effect. If you want one for non-Google AI tools, write it yourself in 20 minutes.
- **Restructuring content into AI-friendly chunks.** Hurts human readability without helping AI visibility.
- **Generating keyword-variation pages "for the fan-out."** Scaled content abuse risk; no real benefit.
- **Buying mention networks.** Spam risk, no upside.
- **Paying for "AI schema audits" that go beyond standard rich-result schema.** Free GitHub docs and schema.org tell you everything you need.
- **Hiring AEO/GEO consultants who can't explain the distinction from classic SEO.** They're selling rebranded fundamentals.

## Read more

- [Mythbusting generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting) — Google's myth-debunking section, the primary source for this lesson

## Summary

- Google has *publicly debunked* the most-sold "AI SEO" tactics: llms.txt files, content chunking, AI-specific rewriting, inauthentic mentions, and over-reliance on schema.
- AEO and GEO as distinct disciplines don't exist from Google's perspective. It's still SEO.
- The pattern: vendor claims aren't in Google's documentation; Google's docs explicitly say not to bother; the vendor's tactic is being sold anyway.
- The real "AI optimization" investment is classic SEO done well, applied with attention to non-commodity content, depth, freshness, and citations.
- When you see a new AI SEO claim, check Google's documentation. If it's not there, default to skepticism.

Next: the small, real things that *do* matter more in the AI era — and a look at where AI search is heading next (agents, the Universal Commerce Protocol, and what that might mean for your site).
