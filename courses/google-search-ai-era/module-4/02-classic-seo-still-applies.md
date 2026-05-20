---
module: 4
position: 2
title: "Why classic SEO still applies — fully"
objective: "Explain why a page must be eligible for a normal Search snippet to appear in AI features, and why that means classic SEO is the price of admission."
estimated_minutes: 11
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# Why classic SEO still applies — fully

## The puzzle

A lot of the SEO content marketed in 2025 and 2026 says some variant of "everything you knew is dead, optimize for AI now." Books with titles like "GEO: The New Frontier." Conference talks titled "Forget SEO."

Then you go to Google's actual documentation. There's a section called *"Is SEO still relevant for generative AI search?"* and the answer is:

> "In short, yes!"

The doc explains why in detail. By the end of it, you realize: not only is classic SEO still relevant, it's the *required* foundation for AI search visibility. Without it, you can't even appear in AI Overviews. With it, you've already done most of the AI optimization work.

This lesson is the proof, with the receipts.

## The simple version

To appear in AI Overviews or AI Mode, your page has to be:

1. **Crawlable** — Googlebot can reach it
2. **Indexable** — Google has decided to store it
3. **Eligible to be shown with a snippet** — basic technical requirements met (no `noindex`, no `nosnippet`, etc.)
4. **Considered relevant for the query** — your normal ranking is high enough that Google's AI retrieval picks you

That list isn't different from the requirements for normal Search ranking. It's *the same list*. AI features are built on top of normal Search, not next to it.

So when someone tells you to "optimize for AI" while ignoring classic SEO fundamentals, they're skipping the foundation that makes everything else possible.

## The technical version

### The eligibility requirement

From Google's AI Optimization Guide, the most important paragraph in the entire document:

> "To be eligible to be shown in generative AI features on Google Search, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements."

Let's unpack each piece:

- **"Indexed"** — Stage 2 from Module 1 has to have succeeded. If your page isn't in Google's index, no AI feature can ever cite it.
- **"Eligible to be shown in Google Search with a snippet"** — your page can't have `noindex`, `nosnippet`, or be otherwise blocked from appearing as a normal organic result.
- **"Fulfilling the Search technical requirements"** — Google's Search Essentials: server returns 200, page is crawlable, content is parseable, etc.

If your page fails any of these for normal Search, it can't appear in AI Search either. The fix is not "AI optimization." The fix is classic SEO.

### Why optimizing for one is optimizing for the other

The AI Optimization Guide is explicit:

> "The best practices for SEO continue to be relevant because our generative AI features on Google Search are rooted in our core Search ranking and quality systems."

Read that twice. Generative AI features are *rooted in core Search ranking and quality systems*. Same systems. Same ranking signals. Same quality bar.

So the playbook for AI search visibility is, almost exactly:

1. Master Module 1 (the 3-stage pipeline) — make sure your pages clear all three.
2. Master Module 2 (content quality) — write helpful, reliable, people-first, non-commodity content.
3. Master Module 3 (technical SEO) — clean titles, structure, canonicals, images.

That's 99% of "AI optimization." The remaining 1% is a few small additions covered in the next lesson.

### The new properties AI search adds

A few things AI features add to the picture — but each one is an *amplification* of classic SEO, not a replacement:

**1. Non-commodity content is rewarded more.** Commodity articles get summarized into oblivion. Non-commodity articles get cited. (Already covered in Module 2, lesson 3.)

**2. Topical depth matters more.** Query fan-out means you don't need exact-keyword matches — but you do need genuine coverage of related concepts. A site with one shallow article on a topic struggles more than a site with five interconnected articles on the same topic.

**3. Quotability matters more.** AI features quote specific sentences and short passages. Pages with clear, well-structured prose are easier to quote than pages of dense walls of text.

**4. Freshness matters more.** RAG always queries the current index. Stale content quietly stops appearing in AI features even before it loses normal rankings.

**5. Citations matter more for trust.** AI features pull from sources they trust. Your page's authoritativeness — backed by real authorship, primary citations, and external references — feeds the trust the AI features apply when selecting sources.

Notice all five of these are *also* classic SEO best practices. They've just gotten more important.

### What hasn't changed at all

Some things are exactly the same:

- **`<title>` and meta description** still matter. AI features use them for labeling and sometimes for snippets.
- **Site speed and Core Web Vitals** still matter. Slow sites get crawled less and trusted less.
- **Canonical handling** still matters. Duplicate URLs still create confusion.
- **Backlinks from authoritative sites** still help. They feed PageRank, and PageRank still feeds ranking.
- **Schema / structured data** is still useful, but the same as before — for eligibility for rich results, not specifically for AI features. (Google explicitly says structured data isn't required for AI search.)

### Where the marketing industry is misleading people

You'll see a lot of content in 2026 implying things like:

- "FAQ schema is critical for AI Overviews" — false, Google has scaled back FAQ rich results dramatically
- "Structured data is the new ranking factor for AI" — false, Google says it's not required for AI search
- "You need to write in Q&A format for AI" — false, AI features summarize normal prose just fine
- "Chunk your content for AI" — false, we'll cover this in the next lesson
- "Add llms.txt to your site" — false, also next lesson

The pattern: someone observes that something *correlates* with AI Overview visibility and sells it as a *cause*. Most of these correlations come from the fact that high-quality sites already do them as part of regular SEO. The causal arrow runs from quality to AI visibility, not from these specific tactics to AI visibility.

The honest signal: when a "new AI SEO tactic" doesn't appear anywhere in Google's official documentation, it's almost certainly not a real best practice.

### What the right "AI SEO" investment actually looks like

If you have $10,000 to spend on improving AI search visibility, here's roughly the optimal allocation:

- **$5,000** — Audit and improve your top 50 pages for content quality, originality, and clarity. (Module 2.)
- **$3,000** — Technical SEO audit: titles, structure, canonicals, page speed, image SEO. (Module 3.)
- **$1,500** — Strengthen authorship signals: real bylines, author pages, primary citations. (Module 2.)
- **$500** — Add appropriate structured data to product, recipe, article, and organization pages. (Module 3.)
- **$0** — On llms.txt files, FAQ-chunking, AEO/GEO services, or any "AI optimization" service that isn't grounded in classic SEO.

That's a controversial allocation in 2026 only because the marketing industry is selling the opposite. It's the allocation Google's own documentation supports.

## An analogy: the new restaurant guide

Imagine a famous restaurant critic releases a new annual guide. Before publishing each year's edition, the critic personally dines at hundreds of restaurants. They pick the best ones for the guide.

For decades, the critic only ate at restaurants that earned high ratings from her trusted local reviewers (the existing Search index).

This year, she's added a new system: she also asks her AI assistant to summarize what *the local reviewers said* about the restaurants. The AI assistant pulls quotes from the local reviews. The guide now includes those summaries.

Question: did the restaurant industry change?

Not really. The local reviewers are still the gatekeepers. Restaurants still get noticed by being genuinely good. The AI summary is a new layer of presentation on top of the same underlying judgment.

A restaurant that bribes the AI directly without earning local reviewer praise doesn't make the guide. A restaurant that earns the local reviewers but somehow can't be summarized? Rare — the AI can usually summarize anything coherent.

That's the AI search landscape. The "local reviewers" are Google's classic ranking algorithm. The AI is a presentation layer. Restaurants — and websites — still get in by being genuinely good.

## Three real-world scenarios

**Scenario 1: The brand that ignored fundamentals to chase AI.**
A mid-size brand cut their classic SEO budget and reallocated to "AI SEO" services — agencies that promised dedicated optimization for AI features. They added FAQ schema everywhere, restructured pages into pseudo-chunked formats, and bought an llms.txt file. After 8 months: no improvement in AI Overview citations and a *decline* in classic rankings (because the restructured pages were now worse for human readers). The fix was to revert everything and re-invest in non-commodity content. Took 6 months to recover.

**Scenario 2: The doc site that didn't even try.**
A technical documentation site never explicitly optimized for AI. They did classic SEO well: clear titles, hierarchical structure, accurate canonicals, fast pages, real author attribution, deep coverage of their niche. Within a year of AI Overviews launching, their pages were among the most-cited sources in their domain. They never added a single "AI optimization" tactic.

**Scenario 3: The publisher that fixed their canonicals.**
A publisher had hundreds of articles with canonical confusion (HTTP/HTTPS, www/non-www, parameter variants). They didn't appear in AI Overviews because Google was sometimes serving from variant URLs that lacked authority signals. After cleaning up canonicals — pure classic SEO — they started getting cited in AI Overviews within weeks. Lesson: fundamentals affect AI visibility, often more than "AI tactics."

## Common mistakes to avoid

- **Cutting classic SEO budget to chase AI optimization services.** You're cutting the foundation to invest in cargo cult tactics.
- **Believing AI search is a separate optimization track.** It isn't. It sits on top of classic ranking.
- **Adding structured data primarily because "AI needs it."** Add structured data because it makes you eligible for rich results. AI features will use it if available, but they don't require it.
- **Reformatting content into pseudo-chunks for AI.** Google says explicitly this isn't necessary.
- **Trusting any "AI SEO" claim that doesn't appear in Google's documentation.** If Google hasn't said it works, treat it as folklore.

## Read more

- [Optimizing for generative AI features — Is SEO still relevant?](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#is-seo-still-relevant) — the specific section that answers this question
- [Search Essentials](https://developers.google.com/search/docs/essentials) — the technical requirements every page needs

## Summary

- AI Overviews and AI Mode are built on top of Google's normal Search ranking. They use the same index, the same signals, the same ranking decisions.
- To appear in AI features, your page must clear the same eligibility bar as normal Search snippets.
- Classic SEO fundamentals (Modules 1–3) are the foundation. Almost everything Google says to do for AI visibility is *already* classic SEO best practice.
- A few things matter more in the AI era: non-commodity content, topical depth, quotability, freshness, citations. All of these are amplifications of classic SEO, not replacements.
- Tactics sold as "AI SEO" that don't appear in Google's documentation are almost always folklore. Be skeptical.

Next: the long, satisfying list of "AI optimization" tactics Google itself says don't work — the snake oil section.
