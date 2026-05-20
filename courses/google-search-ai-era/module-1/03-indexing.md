---
module: 1
position: 3
title: "Indexing — canonicals, clustering, and what gets stored"
objective: "Describe how Google clusters duplicate pages, picks a canonical, and decides what makes it into the index."
estimated_minutes: 14
videos:
  - title: "Spilling the beans on Caffeine (Google's indexing system)"
    url: "https://www.youtube.com/watch?v=65rE4mvzCX0"
    source: "Google Search Central · Search Off the Record"
  - title: "SEO summer: Index waves, sandboxes, crawling, and more!"
    url: "https://www.youtube.com/watch?v=YDK78_jIGRs"
    source: "Google Search Central · Search Off the Record"
---

# Indexing — canonicals, clustering, and what gets stored

## The puzzle

You have one product. It has three URLs:

```
https://example.com/products/blue-shoes
https://example.com/products/blue-shoes?ref=email
https://example.com/products/blue-shoes?utm_source=facebook&utm_medium=cpc
```

All three URLs return the same page. Google crawls all three. Which one shows up in search results?

If you've ever wondered why Google sometimes shows a URL you don't recognize from your own site — or why your "main" version isn't the one ranking — this lesson resolves it.

## The simple version

Crawling got the page's bytes to Google. Indexing is where Google **figures out what the page is about and decides whether (and which version) to store**.

Three things happen at this stage:

1. **Content analysis.** Google reads the text, the title, the headings, the images. It builds a picture of what the page is about.
2. **Canonicalization.** Google groups similar pages into clusters and picks one URL from each cluster as the official, indexable version (the *canonical*). The others get filed as alternates.
3. **Indexing decision.** Google decides whether the canonical is worth storing in the index at all. Not every crawled page gets indexed.

The kicker, again from Google's own docs: *"Indexing isn't guaranteed; not every page that Google processes will be indexed."*

## The technical version

### Content analysis

When Googlebot brings a page back to the indexing system, Google parses its content. This includes:

- The text on the page.
- The `<title>` element — the title that shows in browser tabs and search snippets.
- The headings (`<h1>` through `<h6>`).
- The `alt` attributes on images — the short text descriptions used by screen readers and search engines.
- The contents of any embedded videos or other media.
- Structured data — special tags that label your content (e.g., "this is a recipe," "this is a product priced at $X"). More on this in Module 3.

From the *How Search Works* doc: *"This stage is called indexing and it includes processing and analyzing the textual content and key content tags and attributes, such as `<title>` elements and alt attributes, images, videos, and more."*

The output of this stage is a representation of the page — not the page itself — that Google can search against efficiently. Think of it as Google's notes on your page, indexed for fast lookup.

### Canonicalization — Google's deduplication system

This is where most people's mental model breaks. The internet is full of pages that are nearly identical. Google has built an elaborate system to deal with that.

When Google indexes pages, it tries to identify clusters of similar content. Google's own description:

> "During the indexing process, Google determines if a page is a duplicate of another page on the internet or canonical. The canonical is the page that may be shown in search results. To select the canonical, we first group together (also known as clustering) the pages that we found on the internet that have similar content, and then we select the one that's most representative of the group."

In plain English: Google looks at your URLs, decides which ones are really the same page (or nearly so), and picks one URL to represent the cluster in search results. The others get tagged as alternates — they're still in Google's awareness, but they don't normally show up directly.

Google considers many things when picking the canonical:

- **Whether you specified one.** If your page includes a `<link rel="canonical" href="...">` tag in its HTML head, Google takes that as a strong hint. Hint, not command — Google may override it if your hint is clearly wrong (a canonical that points to an unrelated page, for instance).
- **Internal linking.** The URL most heavily linked to from elsewhere on your site is a strong candidate.
- **Sitemap inclusion.** URLs in your sitemap are stronger candidates.
- **HTTPS over HTTP.** Google prefers secure URLs.
- **Shorter, cleaner URLs.** All else equal, `/products/blue-shoes` beats `/products/blue-shoes?utm_source=email`.
- **Whether the URL returns the right content.** Page must actually resolve to the content.

So for our three blue-shoes URLs at the top of this lesson, Google clusters them, ignores the tracking parameters, and (if you didn't specify a canonical) probably picks `https://example.com/products/blue-shoes` as the canonical. The other two are alternates. If a user clicks on `?utm_source=facebook` from Facebook, that's fine — but `?utm_source=facebook` won't show up in your organic search results.

### Specifying a canonical yourself

If you want to be explicit (and you should, especially on an e-commerce site or anywhere URL parameters can multiply), add a `<link>` element in the page's `<head>`:

```html
<link rel="canonical" href="https://example.com/products/blue-shoes">
```

Place this tag on *every* version of the page — including on the canonical URL itself, pointing to itself. That tells Google: "This is the version that should win."

There are also other ways to consolidate signals:

- **301 redirects** — if a URL no longer exists, redirect to the canonical. Much stronger than rel=canonical because the alternate stops returning content entirely.
- **HTTPS upgrade** — redirect all `http://` URLs to `https://`.
- **www vs non-www** — pick one and redirect the other to it.
- **Trailing slash consistency** — `/about` and `/about/` should resolve to the same URL.

### Signal collection

Beyond the content itself, the indexing system also collects metadata about the canonical:

- **Language.** Detected from the content and from any `lang` attributes in your HTML.
- **Locale / target country.** Inferred from your content, hosting location, and any hreflang annotations.
- **Mobile usability.** Whether the page renders well on a small screen.
- **Page experience signals.** Including Core Web Vitals, which we'll cover in Module 3.
- **Structured data.** If you've added schema markup, Google extracts it here.
- **Freshness signals.** When was the page first indexed? When did it last meaningfully change?

These signals don't directly cause indexing or rejection — they feed Stage 3 (serving), where they help Google decide which results to show for which queries.

### The indexing decision itself

After all of that, Google decides: do we add the canonical URL to our index, or not?

The Google index is a massive distributed database. It's not a paid product. Storage and serving cost real money. So Google is selective.

From the docs: *"The collected information about the canonical page and its cluster may be stored in the Google index, a large database hosted on thousands of computers. Indexing isn't guaranteed; not every page that Google processes will be indexed."*

The common reasons Google chooses *not* to index a crawled canonical:

- **Content quality is low.** Thin pages, AI slop, doorway pages, content that's substantially duplicated from elsewhere on the web.
- **`noindex` meta tag.** Including `<meta name="robots" content="noindex">` in the page's `<head>` is an explicit instruction *not* to index. Many CMS settings flip this on for staging environments — a common SEO disaster when it accidentally rolls to production.
- **Page is non-canonical.** It got clustered with another URL that won the canonical selection.
- **Indexing system overwhelmed.** Very rarely, sites with millions of URLs hit limits where new content takes a long time to be considered for indexing.

In Search Console's *Page Indexing* report, you'll see categories like:

- *Indexed* — congratulations.
- *Crawled — currently not indexed* — Google looked at it and decided to pass.
- *Discovered — currently not indexed* — Google knows it exists but hasn't even crawled yet.
- *Duplicate without user-selected canonical* — Google picked a different URL as canonical.
- *Alternate page with proper canonical tag* — your rel=canonical worked, this is the alternate.
- *Excluded by 'noindex' tag* — your noindex is doing its job.

Each of those tells you exactly what stage of indexing failed (or succeeded). The right diagnostic move is always: read the Page Indexing report first, then act.

## An analogy: the library cataloger

Imagine a national library that receives every book published in the country.

Books arrive constantly. The chief cataloger has to make four decisions per book:

1. **What is this book about?** They read the dust jacket, the table of contents, the index. They write up a short description for the library's records.
2. **Is this a duplicate?** Sometimes two publishers send the same book with different covers. The cataloger looks for an existing entry that this could be merged into. If found, they pick the "best" edition (hardcover, latest printing) as the master record. The duplicate gets noted in the system but doesn't get its own shelf.
3. **Is this worth shelving?** Some books arrive but never make it onto the shelves. They're too thin, too derivative, too poorly written, or just duplicate something already there. They go in the "received but not catalogued" pile.
4. **What category does it go in?** Books that do make the shelves get a Dewey Decimal number — a category that helps future readers find them.

That's indexing. The cataloger is Google's indexing system. Some books get shelved. Some get filed but not shelved. Some get marked "duplicate of X" and never get their own listing. And the cataloger has no obligation to shelve everything they receive.

## Four real-world failure scenarios

**Scenario 1: The accidental `noindex`**
Your developer ships a new release. Some pages — let's say all pages under `/blog/` — get `noindex` tags by accident, copy-pasted from a template that was used in staging. Within days, your blog pages disappear from search results. The fix is simple but you have to spot it. The lesson: include "no rogue `noindex` tags" in your release checklist.

**Scenario 2: Infinite URL parameters**
Your e-commerce site lets users filter products by color, size, price, brand, rating, in-stock status, and shipping speed. Every combination generates a distinct URL. Google crawls thousands of these and spends crawl budget on near-identical pages. Your real product pages get crawled less often. Fix: set canonical tags on every filter page pointing to the un-filtered category page, or block parameter combinations in `robots.txt`.

**Scenario 3: HTTP / HTTPS / www / non-www**
A site exists at all four:
- `http://example.com`
- `https://example.com`
- `http://www.example.com`
- `https://www.example.com`

Google sees four "different" sites with identical content and clusters them. Sometimes it picks the wrong canonical for a particular query. The fix: pick one (almost always `https://www.example.com` or `https://example.com`) and redirect the other three to it with 301s.

**Scenario 4: The "duplicate content penalty" panic**
Someone tells your client that having two pages with similar content gives Google a penalty. They panic and start deleting valuable pages. The truth, straight from Google's SEO Starter Guide: *"Having duplicate content on your site is not a violation of our spam policies, but it can be a bad user experience and search engines might waste crawling resources on URLs that you don't even care about."* No penalty. Just inefficiency. The fix is to canonicalize properly — not to delete pages reflexively.

## Common mistakes to avoid

- **Believing in the "duplicate content penalty."** It doesn't exist. Having duplicates is inefficient, not punitive (unless you're scraping or auto-generating mass content, which is a separate spam policy issue).
- **Not setting a canonical when you have variations.** If your pages have UTM parameters, session IDs, or sort/filter URLs, set explicit canonicals. Don't make Google guess.
- **Self-canonicalizing wrong.** Every page should have a `rel="canonical"` pointing to itself (unless it really is an alternate). Pages with no canonical tag at all are fine; pages pointing to the wrong canonical can disappear from results.
- **Mixing `noindex` with `Disallow:` in `robots.txt`.** If you block a page with `robots.txt`, Google can't read the page, so it can't see your `noindex` tag. The two directives don't compose well together. To remove a page from the index, leave it crawlable and use `noindex`.
- **Trusting "indexed" as a final state.** Pages drop out of the index all the time, especially low-engagement pages on big sites. Indexing is not a permanent contract.

## Watch

Two podcasts from Google's *Search Off the Record* series — these are deep cuts but worth the time once you've got the basics:

- **[Spilling the beans on Caffeine (Google's indexing system)](https://www.youtube.com/watch?v=65rE4mvzCX0)** — How Google's actual indexing infrastructure works, straight from the engineers who built it.
- **[SEO summer: Index waves, sandboxes, crawling, and more!](https://www.youtube.com/watch?v=YDK78_jIGRs)** — A wide-ranging episode that touches on indexing waves and what it means when a site gets crawled but not indexed for a while.

## Summary

- Indexing is Stage 2: deciding what your page is about, picking a canonical version when there are duplicates, and storing the canonical in Google's index (or not).
- Canonicalization is how Google deduplicates the web. You influence it with `rel="canonical"` tags, 301 redirects, and consistent URL conventions.
- The "duplicate content penalty" is a myth. The real risk of duplicates is wasted crawl budget and Google picking the "wrong" URL to show.
- `noindex` meta tags are the right way to keep a page out of the index. `robots.txt` is the wrong way (it just blocks crawling).
- Search Console's *Page Indexing* report is the diagnostic that tells you exactly which indexing outcome a URL got. Read it before guessing.

Next: your page is crawled, indexed, has a clean canonical. A user types a query. Now what? Welcome to Stage 3, the most mysterious one of all.
