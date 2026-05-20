---
module: 1
position: 4
title: "Serving — relevance, context, and the SERP that's different for every user"
objective: "Articulate the factors that decide which results show for which user, and why two people get different SERPs for the same query."
estimated_minutes: 13
videos:
  - title: "How Google Search serves pages"
    url: "https://www.youtube.com/watch?v=lgQazesEjO4"
    source: "Google Search Central"
  - title: "How does Search work?"
    url: "https://www.youtube.com/watch?v=PHyyZxPiWjw"
    source: "Google Search Central"
---

# Serving — relevance, context, and the SERP that's different for every user

## The puzzle

You and a colleague both type the exact same query into Google: "best CRM for small business."

You're on a laptop in New York. They're on a phone in Berlin. You get a Featured Snippet, a "People also ask" box, then ten organic results. They get an AI Overview, a different "People also ask" box, then a Map of CRM providers near them with phone numbers.

Same query. Same Google. Wildly different results pages.

If you've ever assumed your "rank" is a single, stable number — that you're either "#3 for keyword X" or you're not — this lesson is going to recalibrate your entire mental model.

## The simple version

Stage 3 (serving) is where Google takes a query and decides:

1. **Which pages from the index are relevant** to the query.
2. **Which of those pages to rank highest**, using hundreds of factors.
3. **What format the results page should take** — plain blue links, images, a map, a Featured Snippet, an AI Overview, or some mix.
4. **How to personalize it** for this specific user, on this specific device, in this specific location, in this specific moment.

The first two are what most people think of as "ranking." The third and fourth are what most people miss — and they're where your assumptions about your own visibility break.

## The technical version

### Query understanding

Before ranking happens, Google has to understand the query. Modern Google doesn't just match words — it tries to understand *intent*.

It uses systems like BERT and MUM (neural language models) to:

- Recognize synonyms (a query for "auto" should also match results about "cars").
- Understand context ("apple" is fruit in one context, a company in another).
- Identify entities (places, products, people, concepts).
- Classify intent (informational? Transactional? Navigational? Local?).

Google's own writeup, from the AI Optimization Guide: *"Google's AI systems have advanced even further and improved upon our ability to understand the relevance of pages, even when there is no exact match between the query and the page's primary content."*

In practice, this means: the keyword you "rank for" isn't really one keyword. It's a cluster of meanings Google has decided your page is relevant to. You can outrank a competitor on the exact query and still be invisible on the semantic neighbors that drive most of the traffic.

### Ranking — "hundreds of factors"

Once Google has identified pages relevant to the query, it ranks them. The ranking algorithm is a mix of many signals — Google publicly says *hundreds*. We don't know the full list. Google never published one. But Google has confirmed the kinds of things that go into it:

- **Relevance** — how well does this page's content match the query's intent?
- **Quality** — does this page demonstrate signs of being trustworthy, well-made, expert? (We'll cover E-E-A-T in Module 2.)
- **Usability** — does the page work well on the user's device? Does it load reasonably fast?
- **Context** — where is the user? What language do they speak? What time of day is it?
- **Freshness** — for time-sensitive queries (news, sports scores, current events), how recent is the content?
- **Links** — the original PageRank signal, still in play. Pages that other reputable pages link to are weighted higher.

Of the signals we *know* about, none is dominant. Google has explicitly said E-E-A-T is *not* a ranking factor. They've explicitly said keyword density is *not* a ranking factor. They've explicitly said `<title>` text matters but is *not* in the top tier. The actual algorithm is a high-dimensional combination of hundreds of signals weighted dynamically per query.

What this means in practice: there's rarely a single thing you can fix to "rank higher." A page that's already half-good wins by becoming substantially more relevant, more useful, and more trusted — across many small signals at once.

### Personalization and context

Two users searching the exact same query at the exact same moment can get genuinely different SERPs. The factors that drive this:

- **Location.** "Bicycle repair shops" in Paris vs Hong Kong returns completely different results. So does "pizza near me" — a query that has *no useful answer* without location.
- **Language.** Default search language, locale-targeted versions of pages, hreflang tags all matter.
- **Device.** Mobile results often include more local elements and visual results. Desktop results may show more sidebar features.
- **History.** Google uses your recent activity to some extent, especially when you're logged into a Google account.
- **Time.** Queries about live events, news, and trending topics shift hour-to-hour.

Google's own framing, from the *How Search Works* doc: *"Relevancy is determined by hundreds of factors, which could include information such as the user's location, language, and device (desktop or phone). For example, searching for 'bicycle repair shops' would show different results to a user in Paris than it would to a user in Hong Kong."*

What this means for you: your "rank" isn't a single number. It's a distribution. A page that's #3 for one user might be #14 for another and not in the results at all for a third.

### SERP features — when "the SERP" isn't ten blue links

Modern Google rarely shows ten plain text results anymore. The SERP layout adapts to the query.

A non-exhaustive list of SERP features that can dominate a results page:

- **Featured Snippets** — a single answer pulled from a page and shown at the top.
- **AI Overviews** — Google's generative AI summary, increasingly common (we cover these in detail in Module 4).
- **People Also Ask** boxes — expandable Q&A near the top.
- **Knowledge Panels** — for entities (people, places, businesses), a structured info card.
- **Local Pack** — a map plus 3 local business results, triggered by local-intent queries.
- **Image Carousels** — for visual queries.
- **Video Results** — embedded YouTube or other video previews, often for "how-to" queries.
- **Shopping** — product cards with prices, for transactional queries.
- **Sitelinks** — when a single brand dominates a query, Google shows multiple links to that one site.

From the docs: *"Based on the user's query the search features that appear on the search results page also change. For example, searching for 'bicycle repair shops' will likely show local results and no image results, however searching for 'modern bicycle' is more likely to show image results, but not local results."*

What this means: your page can be the #1 organic result for a query and still get almost no clicks, because the SERP is dominated by an AI Overview, a Featured Snippet, a video, and three ads — pushing your "#1" below the fold.

### Why an indexed page isn't being served

Search Console may tell you a page is indexed, but you can't find it in any actual search. From the docs: *"Search Console might tell you that a page is indexed, but you don't see it in search results. This might be because:*

- *The content on the page is irrelevant to users' queries*
- *The quality of the content is low*
- *Robots meta rules prevent serving."*

That last one is important. A `noindex` meta tag prevents indexing. But there are other directives like `nosnippet` and `noarchive` that affect *serving* — controlling what Google can do with an indexed page when it shows up.

## An analogy: the maître d' at a high-end restaurant

A restaurant has 400 dishes on its full menu. A customer walks in. The maître d' decides what to recommend.

The decision isn't just "what's on the menu" — that's indexing. The decision is "what's right for *this* customer, *now*?"

The maître d' considers:

- **What the customer said.** "Something light" vs "I'm starving" vs "your seasonal special."
- **Where the customer is.** Outdoor seating in summer vs near the heater in winter changes what fits.
- **What they look like.** A family with kids vs a business dinner vs a date — wildly different recommendations.
- **The kitchen's current state.** Some dishes are running low; some take 45 minutes to prepare.
- **Time of day.** Brunch menu, lunch menu, dinner menu, late-night menu.
- **Day of week.** The kitchen rotates specials.

And the maître d' doesn't always recommend the same three dishes. They might recommend the chef's tasting menu and a wine pairing (a Featured Snippet). They might recommend the soup of the day (an AI Overview). They might say "I'd actually take you next door to my friend's pizzeria" (a Local Pack).

The dishes (the index) are mostly stable. The recommendations (the SERP) change every time. Two customers asking for "the best seafood" can be told completely different things.

## Four real-world failure scenarios

**Scenario 1: "We rank #1 but our traffic is dropping."**
A SaaS company ranks #1 for "best CRM for small business." Their traffic is still falling. Why? Google added an AI Overview to that SERP that summarizes the answer using their content (and three competitors'). The #1 organic result is now below the AI Overview, below a People Also Ask box, and below three ads. Their CTR collapsed even though their "rank" didn't change.

The fix is structural, not tactical: make sure your content is the kind that gets *quoted* in the AI Overview rather than just *under* it, and accept that some of your top SERPs now have lower CTR ceilings.

**Scenario 2: "Our rankings look great in our office, but our customers say they can't find us."**
A small business in Austin has been monitoring their rank from the office, on the desktop, while logged into Google. They consistently see themselves at #1. Their customers in Houston see them at #11 — outranked by Houston-local competitors. The fix is to monitor rank from multiple realistic locations and devices, not from your own desk.

**Scenario 3: Featured Snippet zero-click**
You wrote a great explainer page on a technical concept. Google extracts the first paragraph as a Featured Snippet. The snippet answers the user's question. The user closes the tab without clicking. Your "rank" is #1 in the snippet — your CTR is 4%. That's life in the modern SERP. The fix is to design your content so the user *needs to* click for the full answer (snippet teases, page delivers).

**Scenario 4: SERP feature mismatch**
You optimized a long-form article for "how to make pasta carbonara." But Google decided the SERP for that query should be dominated by video. Your article is #2 — beneath three YouTube videos and a recipe card. Even with perfect SEO, your traffic is capped. The fix may be to *also* make a video and embed it on the page, or to target adjacent queries where text content still wins the SERP.

## Common mistakes to avoid

- **Treating "rank" as a single number.** Your rank varies by location, device, language, time, and personalization. Average rank in tools like Search Console aggregates across all of that and hides important variation.
- **Ignoring SERP features.** Before you target a keyword, look at what its SERP actually looks like. If the SERP is dominated by video, by a Knowledge Panel, by Maps — your text article is fighting an unwinnable battle.
- **Monitoring rank from your own desk.** Use incognito mode. Use rank tracking tools that simulate different locations and devices. The SERP you see is not the SERP your customers see.
- **Optimizing only for relevance and forgetting quality and context.** Relevance gets you into the candidate pool. Quality and context determine where you land within it.
- **Underestimating personalization.** Especially for queries with local or commercial intent, the version of the SERP a given user sees can differ dramatically from a "global" view.

## Watch

- **[How Google Search serves pages](https://www.youtube.com/watch?v=lgQazesEjO4)** — Google Search Central's official explainer on Stage 3. Worth 5 minutes.
- **[How does Search work?](https://www.youtube.com/watch?v=PHyyZxPiWjw)** — A 60-second Gary Illyes short that maps the three stages back to each other.

## Summary

- Serving is Stage 3: ranking pages from the index, picking SERP features, and personalizing the results for the specific user, device, and context.
- "Ranking" is a high-dimensional decision, not a knob you can turn. Hundreds of signals contribute.
- The SERP is not just ten blue links anymore. AI Overviews, Featured Snippets, Local Packs, image carousels, and other features dynamically reshape what users see — and how much room is left for your organic listing.
- Two users searching the same query can get genuinely different SERPs because of location, device, language, history, and time.
- Diagnosing a "ranking" problem starts with looking at the real SERP your real users see — not the one you see from your office.

That wraps Module 1. You now have the mental model: three independent stages, each with its own failure modes, each requiring a different kind of fix. Everything in the rest of the course slots into this map.

When you're ready, take the Module 1 quiz — five questions to confirm you've internalized the model before we move on to content (Module 2).
