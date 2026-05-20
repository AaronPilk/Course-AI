---
module: 2
position: 4
title: "YMYL — when trust is everything"
objective: "Recognize 'Your Money or Your Life' topics and apply the heightened E-E-A-T bar Google uses for them."
estimated_minutes: 12
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# YMYL — when trust is everything

## The puzzle

Two sites publish the same general claim: "X supplement may improve cognitive performance."

The first site ranks fine for non-medical queries. The second never appears in results for any medical-adjacent topic, no matter what they publish. Both sites have author bylines. Both have decent design. Both have similar traffic profiles.

The difference is *what kind of queries* trigger Google's strictest content scrutiny — and how each site fares under that scrutiny. Welcome to YMYL.

## The simple version

YMYL stands for **Your Money or Your Life**. It's Google's term for topics where bad information could meaningfully harm someone's:

- **Health** (medical, mental health, drug interactions)
- **Financial well-being** (investing, taxes, banking, debt)
- **Safety** (emergency procedures, child safety, dangerous activities)
- **Welfare** (legal advice, civic decisions, news on consequential events)

For YMYL queries, Google's algorithm applies *extra* weight to the signals that correlate with strong E-E-A-T. From the Helpful Content doc:

> "Our systems give even more weight to content that aligns with strong E-E-A-T for topics that could significantly impact the health, financial stability, or safety of people, or the welfare or well-being of society. We call these 'Your Money or Your Life' topics, or YMYL for short."

In plain English: it's harder to rank for medical or financial queries than for, say, "best board games." That's by design.

## The technical version

### What makes a query YMYL

Google uses YMYL as a *query-side* classification, not a site-side one. A site can have some YMYL pages and some not. A query can be YMYL for one user (in a health emergency) and not for another (browsing for fun).

The categories Google explicitly lists:

**Health and safety**
- Medical conditions, symptoms, treatments
- Mental health
- Drug information and interactions
- Medical procedures
- Diet and nutrition advice
- Child safety
- Emergency preparedness

**Financial**
- Investment advice
- Tax preparation
- Banking and loans
- Insurance
- Retirement planning
- Cryptocurrency

**Legal**
- Legal advice on consequential topics
- Immigration
- Family law
- Criminal law

**Civic / news**
- Voting and elections
- Government services
- Current events (especially health/safety/finance-related)

**Other "your life" categories**
- Adoption and foster care
- Major life events
- Anything involving children's safety

Queries that *might* relate to any of the above also trigger heightened scrutiny. "How much should I save for retirement" is YMYL. "Best high-yield savings account" is YMYL. Even "what is a 401k" is YMYL.

### What "more weight" actually means

Google never publishes the exact mechanics. But based on the public Quality Rater Guidelines and observable behavior:

- **Authority signals matter more.** Established medical sites (Mayo Clinic, NIH, WebMD) outrank well-written individual articles even when the individual article is technically more accurate. This isn't favoritism — it's the algorithm leaning harder on Authoritativeness for high-stakes queries.
- **Recency matters more.** Outdated YMYL content gets demoted faster. Health guidelines change; financial advice from 2018 may be actively harmful in 2026.
- **Author credentials matter more.** Bylines from credentialed experts outperform anonymous content more dramatically on YMYL than on other queries.
- **Citations matter more.** YMYL content that cites primary sources (peer-reviewed papers, government data, regulatory documents) does substantially better than content that doesn't.
- **Errors are punished harder.** A factual mistake on a recipe blog is forgivable. A factual mistake on a medication dosing page can knock the whole site down.

### The site-wide reputation effect

For YMYL content, Google evaluates not just the *page* but the *site behind the page*. From the rater guidelines:

> "When determining the trustworthiness of a YMYL page, raters should look at the reputation of the website..."

A medical claim on a randomly-named blog with no clear ownership will fail. The same claim on a hospital's website will succeed. The content is the same — the site reputation does the lifting.

This compounds: small mistakes on a YMYL site damage the *site's* reputation, which then affects all the site's other pages.

### YMYL also affects *who can rank at all*

A pattern you'll observe in real SERPs: for hard YMYL queries, the top 10 results are *almost all institutional sources*. Government agencies, accredited hospitals, established financial publications.

Independent blogs, even high-quality ones, rarely break into those top 10 — not because the content is bad, but because the algorithm is *deliberately conservative* on these queries. Surfacing a random blog post about a medication's side effects is much riskier than surfacing the FDA's page.

For YMYL niches, the practical implication is: unless you have the institutional weight to match the incumbents, you'll usually rank for *long-tail or adjacent* YMYL queries, not the head queries themselves.

### Adjacent territory: when *isn't* a query YMYL?

Lots of topics that *touch* health or money aren't YMYL by Google's definition. The line is "could bad info significantly harm someone?"

- "What's the best gaming laptop?" → not YMYL. Bad info costs you a laptop, not your life.
- "What's the best mortgage lender?" → YMYL. Bad info could cost you tens of thousands of dollars over decades.
- "Recipe for chicken soup" → not YMYL.
- "Can pregnant women eat chicken soup with [specific herb]?" → YMYL.

When you're unsure, ask: *if my reader follows this advice and it's wrong, could it materially hurt them?* If yes, treat it as YMYL.

## An analogy: the doctor vs the bartender

Imagine asking "what should I do about this rash?"

If you ask a bartender, you'll probably get a confident answer. They might even be right. But you wouldn't *trust* it the same way you'd trust your dermatologist's answer.

You apply different scrutiny to medical advice depending on the source. The bartender has to clear a much higher bar to be worth listening to — they need to credibly establish, *before* you'll trust the medical answer, that they actually know medicine.

Google's algorithm does the same thing for YMYL queries. A site has to establish credibility *before* the content gets trusted. For non-YMYL queries, the content can largely speak for itself. For YMYL, the source has to speak first.

## Three real-world scenarios

**Scenario 1: The high-quality independent medical blog that can't rank.**
A retired physician starts a blog about chronic conditions she treated for 30 years. The content is excellent — original, evidence-based, careful. She still struggles to rank against Mayo Clinic and WebMD for almost any head query. She pivots to ranking on long-tail queries ("[specific condition] in [specific demographic]") where she can compete on depth, and gradually builds her site's reputation. Two years in, she starts breaking into head queries.

**Scenario 2: The fintech blog that lost everything in a core update.**
A scrappy fintech blog ran AI-assisted articles on investing topics — broadly accurate but generic, with no author credentials. After a core update they lost 80% of traffic. The fix wasn't subtle: hire credentialed financial writers, add reviewed-by lines from CFAs, link aggressively to primary sources, kill all auto-generated content. Recovery took 9 months but it worked. The lesson: YMYL needs visible *people* and visible *sources*.

**Scenario 3: The recipe site with one YMYL page.**
A general recipe site published one article: "Foods to avoid during pregnancy." It got modest traffic for a year, then suddenly disappeared from results after a quality update. Audit revealed: no medical reviewer, no citations, written by a marketing intern. They commissioned a registered dietitian to rewrite it with citations, added a "Medically reviewed by [name, credentials]" line, and linked sources. Rankings recovered within weeks. Lesson: even one YMYL page on a non-YMYL site needs YMYL-grade treatment.

## How to publish YMYL content responsibly (and rank)

If you have to write about YMYL topics — and many businesses do — here's the playbook:

1. **Make authorship and credentials extremely clear.** Real names, real credentials, linked bio pages.
2. **Cite primary sources, not other articles.** Peer-reviewed papers, government data, regulatory filings.
3. **Have a "Reviewed by [credentialed person]" line.** Even better: actually have it reviewed.
4. **Add "Last updated" dates and update content regularly.** YMYL content decays fast.
5. **Include appropriate disclaimers** without making the page feel defensive. ("This is general information and isn't medical advice. Consult your physician for guidance specific to your situation.")
6. **Don't oversell.** Claims like "cures" or "guarantees" are red flags for both raters and the algorithm.
7. **Audit for accuracy regularly.** A factual mistake on a YMYL page is worse than a missing page.

## Common mistakes to avoid

- **Treating YMYL as "the medical niche."** It's broader. Tax advice, legal advice, child safety — all YMYL.
- **Publishing one YMYL page on a non-YMYL site without raising the bar for it.** That single page can drag the whole site's reputation.
- **Letting AI generate YMYL content unsupervised.** This is the fastest way to destroy a site's reputation. Use AI for research, never for unreviewed publication on YMYL topics.
- **Faking credentials.** "Reviewed by Dr. Smith" with no Dr. Smith on staff will get caught and ruin your trust.
- **Ignoring updates.** Health guidelines, tax codes, and legal precedent change. YMYL content that says "as of 2019…" is actively dangerous.

## Read more

- [Creating helpful, reliable, people-first content (YMYL section)](https://developers.google.com/search/docs/fundamentals/creating-helpful-content#eat) — Google's own framing
- [Quality Rater Guidelines](https://services.google.com/fh/files/misc/hsw-sqrg.pdf) — the rater guidelines have an extensive YMYL section

## Summary

- YMYL = Your Money or Your Life. Topics where bad info could meaningfully harm health, finances, safety, or welfare.
- Google applies *extra weight* to E-E-A-T-correlated signals for YMYL queries.
- Site reputation, recency, credentials, and citations all matter more on YMYL than on other content.
- Top YMYL SERPs are dominated by institutional sources. Independent sites usually have to compete on long-tail and adjacent queries first.
- If you publish YMYL: name the author, cite primary sources, have it reviewed, keep it updated. The bar is higher and it's there for good reason.

Next: AI-assisted content. When Google calls it "scaled content abuse" and when they don't — and how to use AI tools as part of your workflow without crossing the line.
