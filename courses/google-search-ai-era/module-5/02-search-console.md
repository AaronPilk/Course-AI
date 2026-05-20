---
module: 5
position: 2
title: "Search Console as your dashboard"
objective: "Set up Search Console and identify the three reports that tell you whether your SEO is working."
estimated_minutes: 12
videos:
  - title: "How To Use Search Console — Google Search Central"
    url: "https://developers.google.com/search/docs/monitor-debug/search-console-start"
    source: "Google Search Central"
---

# Search Console as your dashboard

## The puzzle

You're paying attention to SEO. You're publishing content. You're updating titles. You're cleaning up canonicals. Something is happening — but you don't actually know what.

Are you ranking? Are you being crawled? Is anything broken? Are users clicking?

Most business owners can't answer these questions because they've never properly set up Search Console, or they have but they look at the wrong things in it.

This lesson is the cure. You'll know how to set it up in 10 minutes and which three reports actually matter.

## The simple version

**Google Search Console** is a free Google tool that shows you:

- Which queries your site appeared for
- Where you ranked
- How many clicks you got
- Which pages are indexed, which aren't, and why
- Technical issues Google found while crawling

The three reports that matter most:

1. **Performance** — what queries you appear for and how often users click.
2. **Page indexing** — which pages are in the index and what's blocking the rest.
3. **URL Inspection** — diagnose a specific URL: is it crawled? Indexed? Why or why not?

Master those three and you know more about your site's SEO than 95% of operators.

## The technical version

### Setting up Search Console

Go to <https://search.google.com/search-console>, sign in with the Google account that should own the property, and add your site.

You'll be asked to **verify ownership**. The usual methods:

- **Domain property** — verify via DNS record. Covers all subdomains and protocols. Best option if you can do it.
- **URL prefix property** — verify via uploaded HTML file, HTML meta tag, or Google Analytics. Easier, but you have to register each variant separately.

For most sites: set up a Domain property if your DNS access allows. Otherwise URL prefix is fine.

After verification, Search Console starts collecting data immediately. Note that data lags by 1–3 days, so don't expect numbers right away.

### Report 1: Performance

The Performance report is the heart of Search Console. It shows:

- **Total clicks** — how many users clicked through from Google
- **Total impressions** — how many times your site appeared in results
- **Average CTR** — clicks ÷ impressions
- **Average position** — your average rank for the queries you appeared for

You can break these down by:

- **Query** — the search terms users typed
- **Page** — your URLs
- **Country** — geographic distribution
- **Device** — desktop, mobile, tablet
- **Search appearance** — AI Overviews, rich results, etc.
- **Date** — over time

**What to actually look at:**

- **Queries with high impressions but low CTR**: your title/meta description for those queries isn't compelling. Rewrite.
- **Queries where you rank position 5–15**: low-hanging fruit. A small content improvement can push you into position 1–4 where most clicks happen.
- **Pages with declining trends**: something changed. Either your content needs an update, or someone else outranked you.
- **Queries you're appearing for that you didn't expect**: real customer language. Use these to inform future content.
- **CTR over time**: if dropping, AI Overviews or SERP features may be absorbing clicks.

**What to ignore (mostly):**

- "Average position" as a single number — it averages across countries, devices, queries, and SERP features. Look at position by query and page, not as a site-wide metric.
- Tiny fluctuations day-to-day. Look at 7-day or 28-day trends.

### Report 2: Page indexing

The Page Indexing report tells you which of your URLs are actually in Google's index.

The categories:

- **Indexed** — congratulations, the URL is in the index.
- **Not indexed** — for one of many reasons listed below.

Common "not indexed" reasons and what they mean:

- **"Crawled — currently not indexed"** — Google fetched the page but chose not to store it. Usually a content quality signal. The fix is content, not technical.
- **"Discovered — currently not indexed"** — Google knows about the URL but hasn't crawled it yet. For new sites or low-authority pages, this can take time. For established sites, it can mean crawl budget issues or signals that this URL isn't worth fetching.
- **"Excluded by 'noindex' tag"** — your `noindex` meta is working. Check if you actually want this.
- **"Duplicate without user-selected canonical"** — Google clustered the URL with others and picked a different canonical. Add `<link rel="canonical">` if you want a specific one.
- **"Alternate page with proper canonical tag"** — your rel=canonical worked, this URL is an alternate. Fine.
- **"Blocked by robots.txt"** — your robots.txt is blocking. Check if intentional.
- **"Page with redirect"** — the URL redirects somewhere else. Fine if intentional.
- **"Not found (404)"** — broken URL. Fix or accept.
- **"Soft 404"** — Google thinks the page is empty/missing despite returning 200. Fix the content or the status code.

**What to do with this report:**

Sort by category. Pick the categories that suggest something is wrong (high counts of "Crawled — currently not indexed" or "Soft 404") and dig in.

Don't try to get 100% of URLs indexed. Many URLs *shouldn't* be indexed (filter pages, internal admin pages, etc.). The right target is: my important pages are indexed, and the not-indexed pages are intentional.

### Report 3: URL Inspection

The URL Inspection tool is a per-URL diagnostic. Paste any URL on your site, get back:

- Whether the URL is on Google
- The last time it was crawled
- The page that Google chose as the canonical (if any)
- Indexing eligibility
- Any errors or issues encountered

You can also **request indexing** for a URL. This is useful when:

- You just published a new important page
- You significantly updated an old page and want it re-crawled
- You're testing a fix to a previously-broken page

Caveats:

- Indexing requests are *hints*, not commands.
- There's a daily limit on requests.
- Don't bulk-submit. Use it for specific high-priority URLs.

### Other reports worth knowing

A few additional reports that come up:

- **Core Web Vitals** — page experience metrics (loading, interactivity, visual stability) by URL.
- **Mobile usability** — whether pages work well on mobile.
- **Sitemaps** — submitted sitemaps, errors, when last read.
- **Manual actions** — if Google has taken manual action against your site (rare but critical).
- **Security issues** — malware, hacked content, etc.

Check these monthly. Set up email alerts in Search Console settings to get notified of critical issues.

### The weekly Search Console habit

A simple weekly review for any business serious about SEO:

1. **Open Performance**. Look at 28-day trend. Anything dropping? Anything climbing?
2. **Drill into top pages**. Which are getting clicks? Which queries are driving them? Anything you should make more of?
3. **Check Page Indexing**. Any new "not indexed" categories trending up? Investigate.
4. **Check Core Web Vitals**. Any new "poor" URLs?
5. **Scan messages and alerts**. Anything critical?

This takes 15 minutes. It's how you stay ahead of issues instead of reactively scrambling after they cost you.

## An analogy: the dashboard in your car

Most people drive their cars without ever looking at the diagnostic dashboard. They notice when something goes wrong — a warning light comes on, the engine sounds weird, fuel runs out. By then it's often too late or expensive.

Drivers who pay attention to the dashboard catch problems early. Tire pressure is low → add air before the tire fails. Engine temperature trending up → check coolant before the engine seizes.

Search Console is your car's dashboard. The dials are there. The warning lights work. Most operators just never look. The 15 minutes a week to glance at them is the single best investment you can make in your site's long-term health.

## Three real-world scenarios

**Scenario 1: The "we have no SEO problems" wake-up.**
A small business owner insisted his site was fine — traffic seemed steady. He set up Search Console for the first time, and within 10 minutes found: 200 pages stuck in "Crawled — not indexed" (thin auto-generated tag pages), a sitewide Core Web Vitals issue on mobile, and a `noindex` tag accidentally on his three most important service pages. The fixes took a week. Traffic doubled in 3 months.

**Scenario 2: The 5,000-query goldmine.**
A content marketer pulled Performance data and discovered 5,000 queries her site appeared for that she hadn't intentionally targeted. About 300 of them had real volume and direct relevance to her business. She added a few internal links and updated two pages to better match the language users were searching for. Traffic on those 300 queries grew significantly in 2 months — just from listening to what Search Console was already telling her.

**Scenario 3: The forgotten Search Console.**
A company had Search Console set up but no one actually checked it. For 6 weeks they had a "Manual action" against their site that no one noticed. By the time they caught it, organic traffic had dropped 70%. The fix (a content cleanup) was simple; the lost months weren't recoverable. Lesson: set up email alerts. Have someone actually own the weekly review.

## Common mistakes to avoid

- **Not setting up Search Console at all.** It's free. There's no reason to skip this.
- **Setting it up and never logging in.** The data accumulates regardless; you have to look.
- **Obsessing over "average position" as a single number.** Misleading. Look at query-level position.
- **Ignoring the Page Indexing report.** This is where many quiet problems live.
- **Skipping email alert setup.** You won't catch issues in real time without alerts.
- **Treating "Requested indexing" as a guarantee.** It's a hint. Use it sparingly for high-priority URLs.

## Read more

- [Get started with Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start) — the official setup guide
- [Search Console help](https://support.google.com/webmasters) — detailed feature documentation

## Summary

- Search Console is free, foundational, and most operators don't use it well.
- Three reports to master: **Performance** (queries, clicks, impressions), **Page Indexing** (what's indexed and what isn't, with reasons), **URL Inspection** (per-URL diagnostic).
- Use Performance to find low-CTR titles, near-page-1 queries, and unexpected ranking surprises.
- Use Page Indexing to find what's not in the index and why.
- Set up email alerts so you find out about manual actions, security issues, and indexing crises in real time.
- A weekly 15-minute review keeps you ahead of issues that would otherwise become months-long recovery projects.

Next: how to hire (or fire) an SEO without getting scammed. Red flags, right questions, and what to expect.
