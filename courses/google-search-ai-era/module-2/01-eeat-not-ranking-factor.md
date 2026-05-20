---
module: 2
position: 1
title: "E-E-A-T isn't a ranking factor (but it's how Google measures whether you're winning)"
objective: "Explain what E-E-A-T actually is, why Google says it's not a ranking factor, and how to use it as a diagnostic tool anyway."
estimated_minutes: 14
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# E-E-A-T isn't a ranking factor (but it's how Google measures whether you're winning)

## The puzzle

You hire an SEO consultant. They tell you their #1 priority is improving your E-E-A-T score. They run an audit. They give you a 40-page deck full of E-E-A-T recommendations: more author bios, more sources, more credentials.

You implement everything. Six months later, traffic hasn't moved.

You go to Google's own documentation. There it is, in plain English:

> "While E-E-A-T itself isn't a specific ranking factor..."

Wait, what?

If E-E-A-T isn't a ranking factor — why does every SEO talk about it? Why does it appear in Google's own quality docs? And what should you actually *do* about it?

This lesson resolves the contradiction.

## The simple version

E-E-A-T stands for **Experience, Expertise, Authoritativeness, Trustworthiness**. It's the framework Google's *quality raters* use to evaluate whether search results seem helpful. Quality raters are real humans — outside contractors — who rate sample search results to help Google judge whether its algorithm is doing a good job.

Two things to internalize:

1. **E-E-A-T is not a knob in the algorithm.** Google doesn't compute an "E-E-A-T score" for your page. There's no field in the index labeled `eeat: 7.3`. The algorithm uses *many other signals* that, taken together, identify content that *looks like* it has good E-E-A-T.
2. **Trust is the goal.** Google says explicitly: "trust is most important. The others contribute to trust, but content doesn't necessarily have to demonstrate all of them."

So when you "improve E-E-A-T," what you're really doing is making your content demonstrate more of the *signals* that correlate with trustworthiness in human raters' eyes. The algorithm picks up those signals from the page and uses them — alongside hundreds of other inputs — to rank content.

## The technical version

### Why Google made this distinction

The line "E-E-A-T isn't a ranking factor" is precise on purpose. From Google's own documentation:

> "While E-E-A-T itself isn't a specific ranking factor, using a mix of factors that can identify content with good E-E-A-T is useful."

Google is saying: there's no single "E-E-A-T score" in the ranking algorithm. Instead, the algorithm looks at many separate signals — authorship, source citations, factual accuracy, design patterns, link patterns, user engagement — and those signals *collectively correlate* with what a human rater would call good E-E-A-T.

The reason this matters: anyone selling you a service to "improve your E-E-A-T" should be able to point to *specific signals* they're improving. "E-E-A-T optimization" as a vague service offering is meaningless. "Adding bylines with linked author pages" is a real, concrete signal change.

### The four letters

Let's walk through each component, because they're not interchangeable.

**Experience.** First-hand familiarity with the topic. Did the author actually use the product, visit the place, do the thing? A review of a hotel by someone who stayed there has Experience. A review of a hotel by someone who summarized other people's reviews does not.

This is the *newest* letter — the first E was added in late 2022. Google added it because the rise of AI-generated and aggregator content made it valuable to distinguish "this person actually did this" from "this person wrote about doing this."

**Expertise.** Subject-matter knowledge. The author *knows* the topic, even if they didn't personally experience the specific thing they're writing about. A surgeon writing about appendix surgery has Expertise even if they're not the patient.

Expertise can be professional ("I'm a cardiologist") or it can be domain-deep amateur ("I've been brewing beer for 20 years"). Google's quality rater guidelines explicitly say everyday expertise counts.

**Authoritativeness.** Reputation in the field. Is this person/site widely cited or referenced by others as a source on this topic? Authoritativeness is about *how the field perceives you*, not what you say about yourself.

This is the hardest letter to fake. It compounds over time and is mostly built through real work that other people end up linking to or referencing.

**Trustworthiness.** Honesty, accuracy, safety. Does the content correctly represent itself? Are claims supported? Are facts checked? Is the site itself transparent about who's behind it?

Trust is the meta-letter — Google says the others *contribute to trust*. A page can have Experience and Expertise but still fail at Trust if it makes inaccurate claims or hides who wrote it.

### Why Google uses quality raters at all

Quality raters do not directly affect rankings. Their feedback is used to *evaluate Google's algorithm*, not to score individual pages.

Picture it this way: Google ships a tweak to the ranking algorithm. The tweak might affect millions of queries. Did it make results better or worse? Engineers can't tell just by looking at metrics like CTR — sometimes worse results get higher CTR because they're more clickbait-y.

So Google uses raters. They send raters real query / result combinations and ask: "is this result helpful for this query?" Raters use the quality rater guidelines — a 168-page document Google publishes — to evaluate. E-E-A-T is the central framework in those guidelines.

If a new algorithm change makes raters' scores go up, the change is probably good. If scores go down, the change probably hurts users.

Rater data → evaluates algorithm changes → guides what Google ships → which then affects what shows up in search.

But raters don't touch individual pages directly. Google says it plainly:

> "Search raters have no control over how pages rank. Rater data is not used directly in our ranking algorithms."

### YMYL — when trust matters most

A subset of queries get extra E-E-A-T scrutiny. Google calls these **YMYL — Your Money or Your Life**. They're queries where bad information could meaningfully harm someone:

- Medical / health
- Financial advice / investing
- Legal advice
- Safety information
- News on consequential topics

For YMYL queries, Google's algorithm gives more weight to signals associated with high E-E-A-T. A poorly-credentialed page might still rank for "what's a fun board game" — but it's very unlikely to rank for "should I take this medication while pregnant."

The next lesson goes deeper on YMYL specifically.

## An analogy: hiring an expert witness

Imagine you're a lawyer picking an expert witness for a trial. You need an expert on, say, structural engineering, because the case involves a bridge collapse.

There's no single test you give candidates that scores them on "expert-ness." Instead, you look at a bunch of things:

- **Experience**: Have they personally inspected bridges? Worked on construction sites?
- **Expertise**: What's their degree? How many years in the field?
- **Authoritativeness**: Have they testified before? Published papers? Are they cited by other engineers?
- **Trustworthiness**: Are they honest? Do they have conflicts of interest? Are their past testimonies accurate?

You synthesize all of these into a judgment: "this person seems credible." That judgment isn't a *single score*. It's a gestalt — built from many independent signals.

Google's ranking algorithm does the same thing. It doesn't compute "E-E-A-T = 7.3." It evaluates many signals that *collectively suggest* the content is credible.

That's why fixing "your E-E-A-T" isn't a single button. It's many small, concrete improvements that add up.

## Three real-world scenarios

**Scenario 1: The bylineless blog.**
A SaaS company runs a blog. Articles are posted under "Acme Team" with no author info. After a core update, traffic drops sharply. They start adding author bylines, linking to bio pages, citing the engineers who actually wrote the technical posts. Six months later, traffic recovers and exceeds previous highs.

What happened: Google's algorithm uses authorship signals as one component of E-E-A-T diagnosis. Anonymous content can rank, but it's harder to rank for queries where users want to know "who said this?" — which is increasingly most queries.

**Scenario 2: The fitness influencer with no credentials.**
A fitness coach posts workout advice on her blog. She has no degree in exercise science but has 15 years of competitive powerlifting experience and 50,000 active clients. She started adding short personal stories ("In 2021 I tore my rotator cuff doing this exact movement, here's what I learned…") to her articles. Engagement and rankings both improved.

What happened: Experience can substitute for formal Expertise in many topics. The personal stories signal first-hand familiarity, which the algorithm picks up via various engagement and content patterns.

**Scenario 3: The high-credential site that still lost rankings.**
A medical site staffed entirely by MDs published a thousand articles. After an update, half of them lost rankings. Audit found: the articles were largely template-driven AI summaries with weak citations and no specific clinical evidence. Adding original case studies, specific guideline references, and patient outcome data restored rankings.

What happened: Expertise alone isn't enough. The *content itself* has to demonstrate the expertise, not just claim it via author bios. The algorithm reads the page, not the credentials.

## How to use E-E-A-T as a diagnostic (not a checklist)

Here's the practical move: stop asking "how do I improve my E-E-A-T?" Start asking, for each page:

1. **Whose Experience does this page reflect?** Is it clear someone *did the thing* the page is about?
2. **Whose Expertise does this page reflect?** Is the person who wrote (or reviewed) it credibly knowledgeable?
3. **What in the world *outside this page* would confirm Authoritativeness?** Citations, references, links from other credible sites in the field.
4. **What would make a careful reader Trust this page?** Sources cited, claims supported, no hidden conflicts, the site is what it says it is.

If a page is missing two or three of those, you've found something specific to fix. If a page nails all four, you've done the part of "E-E-A-T optimization" that actually matters.

## Common mistakes to avoid

- **Treating E-E-A-T as a ranking factor you can tune.** It's not. It's a framework for diagnosing content quality. The actual ranking factors are the many smaller signals that correlate with E-E-A-T.
- **Adding fake credentials.** Stuffing "Dr." in front of contributor names without real expertise will eventually get caught — by raters in evaluation passes, by users, or by Google's algorithms that look at the *content's* claims against known facts.
- **Confusing Authoritativeness with link spam.** Authoritativeness is built by being cited by credible sources naturally, not by buying or trading links. The second one is a spam policy violation and will hurt you.
- **Ignoring it on non-YMYL content.** Many SEOs only worry about E-E-A-T for medical or financial content. But Experience and Trustworthiness signals matter on every topic — including hobbies, software reviews, and travel.
- **Hiring "E-E-A-T services" without specifics.** Anyone selling you "E-E-A-T optimization" should be able to name *specific signals* they're going to improve. If they can't, they're selling vapor.

## Read more

- [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — Google Search Central
- [Quality Rater Guidelines (PDF)](https://services.google.com/fh/files/misc/hsw-sqrg.pdf) — the actual document raters use, published in full

## Summary

- E-E-A-T = Experience, Expertise, Authoritativeness, **Trustworthiness** (the meta-letter — trust is the goal).
- It's a framework Google's *quality raters* use to evaluate content, not a direct ranking signal.
- The ranking algorithm uses many separate signals that correlate with good E-E-A-T — bylines, source citations, factual accuracy, link patterns, engagement.
- For YMYL queries (health, finance, safety), the algorithm weighs E-E-A-T-correlated signals more heavily.
- The practical move: stop chasing "E-E-A-T optimization" as a thing. Audit pages for the four questions in this lesson. Fix what's missing. Track the specific signal changes, not the abstract concept.

Next lesson: the three-question framework Google itself suggests for evaluating your own content — *Who, How, Why* — and how to apply it in a 10-minute self-audit.
