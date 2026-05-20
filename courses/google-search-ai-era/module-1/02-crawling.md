---
module: 1
position: 2
title: "Crawling — how Googlebot finds you (and what stops it)"
objective: "Explain URL discovery, the role of links and sitemaps, and identify the top reasons Googlebot fails to reach a page."
estimated_minutes: 14
videos:
  - title: "How does Google Search crawl a web page?"
    url: "https://www.youtube.com/watch?v=aRqfr3R5ncU"
    source: "Google Search Central"
  - title: "How Googlebot Crawls the Web"
    url: "https://www.youtube.com/watch?v=iGguggoNZ1E"
    source: "Google Search Central"
  - title: "What is a web crawler, really?"
    url: "https://www.youtube.com/watch?v=xVg9LcrSwyQ"
    source: "Google Search Central"
---

# Crawling — how Googlebot finds you (and what stops it)

## The puzzle

A blog post sits in your sitemap. Six weeks pass. Search Console shows it as **"Discovered — currently not indexed."** Translated: Google knows the URL exists. Google has not visited it. Not once.

Meanwhile, a different page on your site — one you didn't even add to the sitemap — got crawled within hours of going live.

How does Google decide which pages to visit, when, and how often? And what could you do to nudge that decision in your favor?

Welcome to Stage 1.

## The simple version

Crawling is the part of Google Search where a program called **Googlebot** literally downloads your page — same as your browser would when you visit a website. Before that can happen, two things have to be true:

1. Google has to **know your page exists**. This is called *URL discovery*.
2. Google has to **decide your page is worth fetching today**. This is bandwidth budgeting.

When both of those are true, Googlebot visits, downloads the page, and runs the JavaScript on it (just like Chrome does). The page becomes a candidate for Stage 2 (indexing). When either of those isn't true, your page stays invisible.

## The technical version

### URL discovery

Google has no master list of every page on the internet. It builds its picture of the web by following clues. There are three main ways your URLs come to Google's attention.

**1. Internal links.** Google has already crawled some page on the web. That page links to a new URL. Google adds the new URL to its queue. Internal linking — pages on your own site linking to other pages on your site — is the single most important way new pages get discovered. From Google's own docs: *"Other pages are discovered when Google extracts a link from a known page to a new page."*

**2. External links** ("backlinks" in SEO jargon). Another site links to you. Google finds your URL when it crawls their page. This is how brand-new domains get on Google's radar in the first place.

**3. Sitemaps.** A sitemap is a file (almost always named `sitemap.xml`) that lists URLs on your site. You can submit one through Search Console, or reference it in your `robots.txt`. The sitemap is a hint. *Not a guarantee.* From Google's docs: *"Other pages are discovered when you submit a list of pages (a sitemap) for Google to crawl."*

Note the careful language. *Discovered* — not crawled, not indexed. A sitemap helps Google find your URLs faster. It does nothing for whether they get crawled, indexed, or ranked.

### The crawl decision

Once a URL is queued, Googlebot doesn't just visit it immediately. Google says: *"Googlebot uses an algorithmic process to determine which sites to crawl, how often, and how many pages to fetch from each site."*

In other words, Google rations its crawler's attention. This rationing is sometimes called **crawl budget** — the rough amount of crawling Google is willing to do on your site in a given period. Big factors that influence it:

- **Site quality.** Higher-quality sites get crawled more.
- **Server responsiveness.** If your server is slow or returns errors, Googlebot slows down. From Google: *"Google's crawlers are also programmed such that they try not to crawl the site too fast to avoid overloading it. This mechanism is based on the responses of the site (for example, HTTP 500 errors mean 'slow down')."* (An HTTP 500 is a generic "server error" code — your server tried to respond and failed.)
- **Existing crawl history.** Frequently-updated parts of your site get crawled more frequently.
- **Site size.** A site with 5 URLs gets fully crawled almost daily. A site with 5 million URLs may take months for Google to fully scan.

For small sites (under ~10,000 URLs), crawl budget is rarely a real concern. For larger sites, especially e-commerce catalogs and content libraries, it becomes a real bottleneck.

### Fetching and rendering

When Googlebot does visit a URL, it makes a regular HTTP request — the same kind of request your browser makes — and downloads the page. Critically, it doesn't stop at the raw HTML. Googlebot renders the page using a recent version of Chrome, which means it executes JavaScript and waits for it to finish loading the content.

Why this matters: modern websites built with frameworks like React, Vue, or Angular often deliver an empty HTML shell that gets filled in by JavaScript after the page loads. Googlebot has to wait for that JS to run before it can see your real content. Most of the time, this works. Occasionally, it doesn't — JS errors, slow API calls, or rendering bugs can prevent Googlebot from seeing the page the way a user does.

From the Search Central guide:
> "If your site is hiding important components that make up your website (like CSS and JavaScript), Google might not be able to understand your pages, which means they might not show up in search results."

### robots.txt — the on/off switch

`robots.txt` is a small text file that lives at the root of your domain (e.g., `https://yourdomain.com/robots.txt`). It contains instructions for web crawlers — most importantly, which parts of your site they're allowed to crawl.

A minimal `robots.txt` looks like this:

```
User-agent: *
Disallow: /admin/
Allow: /
```

That tells *every* crawler (`User-agent: *`) to skip `/admin/` but crawl everything else.

Two important properties of `robots.txt`:

1. **It only controls crawling, not indexing.** A URL blocked in `robots.txt` won't be crawled, but it *can* still appear in search results — Google might know about it from external links and list it as a bare URL with no description. To truly keep a page out of search results, you need a `noindex` meta tag (which we'll cover in the indexing lesson), and the page has to be *crawlable* for Google to see the tag. (Yes, that's a paradox: if you block crawling, Google never reads your noindex. We'll come back to it.)
2. **Mistakes here are catastrophic.** A misplaced `Disallow: /` blocks your entire site from being crawled. It happens more often than you'd think — usually after a developer accidentally deploys a staging-environment `robots.txt` to production.

## An analogy: the mail carrier with a list

Imagine a mail carrier delivering letters in a massive city.

Every day, headquarters hands them a stack of addresses to visit. Some addresses are on their stack because someone explicitly registered an address change (that's the sitemap). Some are there because another resident on yesterday's route mentioned them (that's a link). Some are there because the carrier has visited them many times before and is checking back in (that's recrawling).

But the carrier can only visit so many addresses per day. So they prioritize: addresses on busy streets, addresses that have changed recently, addresses where last week's visit went smoothly. Addresses where the dog bit them last time get fewer visits. Addresses with "No Solicitors" signs (robots.txt) get skipped entirely.

You can submit your address to headquarters (sitemap submission). You can ask neighbors to mention it to the carrier (external links). You can keep your street tidy and your dog inside (good server performance, no errors). But you can't force a visit on any given day.

## Four real-world failure scenarios

**Scenario 1: The accidental `Disallow: /`**
A developer pushes a new release. Two days later, organic traffic falls off a cliff. The culprit: their staging environment's `robots.txt` had `Disallow: /` to keep search engines out, and it got deployed to production alongside the real release. Every URL on the site is now blocked from crawling. Google starts dropping pages from its index because it can no longer verify they exist.

How to catch it: check `https://yourdomain.com/robots.txt` after every deploy, or use Search Console's `robots.txt` Tester.

**Scenario 2: Soft 404s**
You delete a product. Instead of returning an HTTP 404 (Not Found), your site shows a friendly "Sorry, this product is gone" page with HTTP 200 (OK). Googlebot sees an HTTP 200 and thinks the page is fine. It keeps trying to crawl, index, and rank that page — wasting crawl budget on dead content.

These are called *soft 404s*. The fix: return a real 404 status code (or 410 for "Gone") when a page is truly gone. Reserve the friendly UI for genuine error pages.

**Scenario 3: JavaScript that won't render**
Your single-page app uses an API call to load the main content. The API takes 8 seconds to respond. Googlebot waits, then times out before seeing the content. Your page looks empty to Google — and gets treated like an empty page.

The fix: make sure your critical content renders quickly, ideally server-side. Or pre-render for crawlers. We'll cover JavaScript SEO properly in Module 3.

**Scenario 4: Server overload**
Your site is suddenly returning HTTP 500 errors during a traffic surge. Googlebot detects the errors, interprets them as "slow down," and reduces its crawl rate. Even after the surge passes, your crawl rate stays depressed for days or weeks while Google cautiously feels out whether your server is healthy again. New content gets crawled late. Old content gets re-crawled less often.

## Common mistakes to avoid

- **Blocking CSS or JavaScript in `robots.txt`.** Google needs to render your page like a user does. Block the resources it uses to render and you may end up with broken indexing.
- **Treating the sitemap as a guarantee.** It's a hint, not a command. Get your linking structure right too — pages that aren't linked to from anywhere inside your site are hard for Google to take seriously.
- **Returning HTTP 200 for "not found" pages.** Always return a 404 or 410 for content that's truly gone. Google literally has a "soft 404" report in Search Console for this reason.
- **Hiding important content behind logins.** Googlebot doesn't log in. Anything behind a login wall is invisible to Search.
- **Putting `noindex` in your `robots.txt`.** Google doesn't support `Noindex:` in `robots.txt`. The `noindex` directive belongs in a meta tag in the page itself, or in an `X-Robots-Tag` HTTP header — not in `robots.txt`.

## Watch

These Google Search Central videos go deeper on what we covered:

- **[How does Google Search crawl a web page?](https://www.youtube.com/watch?v=aRqfr3R5ncU)** — A short, focused video on the mechanics of a single crawl.
- **[How Googlebot Crawls the Web](https://www.youtube.com/watch?v=iGguggoNZ1E)** — A broader overview of Googlebot's behavior, from the Search Relations team.
- **[What is a web crawler, really?](https://www.youtube.com/watch?v=xVg9LcrSwyQ)** — A 5–10 minute deep dive on web crawlers with Gary Illyes and Lizzi Sassman. Worth the time.

## Summary

- Crawling is Stage 1: getting your page's bytes onto Google's servers.
- For that to happen, Google needs to **discover** the URL (via links, sitemaps, or external references) and **decide** to crawl it (which depends on site quality, server health, and crawl budget).
- Googlebot renders pages with a real Chrome engine, so JavaScript runs — but slow or broken JavaScript can hide your content from it.
- `robots.txt` controls *crawling only*. A misplaced `Disallow: /` is one of the fastest ways to wreck a site's SEO.
- Soft 404s, login walls, and chronic server errors are the most common crawling failures.

Next: even if Google crawled your page successfully, that doesn't mean it gets indexed. Stage 2 is its own decision — and there are some surprising rules about which URL "wins" when Google sees two similar pages.
