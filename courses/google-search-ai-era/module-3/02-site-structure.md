---
module: 3
position: 2
title: "Site structure — URLs, directories, and breadcrumbs"
objective: "Design a URL structure and directory layout that Google can crawl efficiently and users can understand."
estimated_minutes: 12
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# Site structure — URLs, directories, and breadcrumbs

## The puzzle

Site A's product page URL: `https://example.com/products/blue-shoes`

Site B's product page URL: `https://example.com/p/?id=4729&cat=8&sess=A2F8`

Both pages return the same product. Both have great content. Site A consistently outranks Site B. Why?

It's not magic. URL structure isn't a giant ranking factor on its own — Google has said so multiple times. But the *cumulative* effect of how a site is organized — URL structure, directory hierarchy, internal linking, breadcrumbs — compounds over a site's life. Site A is easier for Google and users to understand and navigate. That compounds.

## The simple version

Three things to get right about your site's structure:

1. **Descriptive URLs.** URLs that tell a human (and a crawler) what the page is about, just from the URL.
2. **Logical directories.** Group related pages into folders that reflect the site's actual content hierarchy.
3. **Visible breadcrumbs.** Show users where a page sits in the hierarchy, and let Google read that hierarchy from your HTML.

None of these are "ranking factors" in the simple sense. All of them contribute to a site Google can crawl efficiently, understand structurally, and surface confidently.

## The technical version

### Descriptive URLs

A descriptive URL contains words that hint at the page's content. Compare:

- `https://example.com/pets/cats.html` ← descriptive
- `https://example.com/2/6772756D707920636174` ← not descriptive

From Google's SEO Starter Guide:

> "Try to include words in the URL that may be useful for users."

Why this matters:

1. **Breadcrumb display.** Google can extract breadcrumb-like segments from descriptive URLs and show them in the SERP.
2. **User trust.** A user previewing a search result reads the URL. A clean URL boosts CTR. A `?id=4729&sess=...` URL doesn't.
3. **Sharing.** Clean URLs get pasted into chat, embedded in articles, copied into bookmarks. Cryptic URLs don't.
4. **Crawl efficiency.** Marginal, but URLs that pattern-match what Google already understands about your site are easier to prioritize.

What makes a good URL:

- **Lowercase.** Mixed case (`/Products/BlueShoes`) creates duplicate URL risk (servers may treat them as different but indistinct pages).
- **Hyphens between words.** Not underscores. Google treats hyphens as word separators; underscores are sometimes treated as one word.
- **Short, but meaningful.** Both `/blue-shoes` and `/the-amazing-best-blue-shoes-for-2026-special` rank for the same things. The short one looks better.
- **Avoid unnecessary parameters.** Tracking parameters (`?utm_source=...`) and session IDs (`?sess=...`) create canonicalization complexity. Strip them from canonical URLs when you can.

### Directory structure

Group related pages into directories that reflect your site's hierarchy. Two examples:

```
/products/blue-shoes
/products/red-shoes
/products/leather-jacket
/policies/return-policy
/policies/shipping-policy
```

Notice each directory contains topically similar pages. From Google:

> "Using directories (or folders) to group similar topics can help Google learn how often the URLs in individual directories change."

So Google can learn:
- `/products/` changes often (new products, updated prices)
- `/policies/` rarely changes (return policy is stable)

This affects how Google schedules crawls — more frequent for changing directories, less frequent for stable ones. Beneficial for both efficient crawling and freshness signals.

A directory structure also gives you natural breadcrumb extraction (more in a moment).

### Avoid the deep-nesting trap

Some sites bury content deep:

```
/category/subcategory/sub-subcategory/sub-sub-subcategory/page
```

This isn't a penalty per se, but it has practical issues:

- Pages five levels deep are harder for Google's crawler to discover and prioritize.
- Internal linking has to work harder to give those pages authority.
- URLs become unwieldy.

Two or three levels is plenty for most sites. If you find yourself going deeper, your category structure might be wrong.

### Breadcrumbs

Breadcrumbs are the trail of links at the top of a page showing where you are in the hierarchy:

`Home › Products › Shoes › Blue Shoes`

Two reasons they matter for SEO:

1. **They can appear in the SERP.** Google often shows breadcrumb-style segments in the SERP instead of the raw URL — making your listing look more polished.
2. **They help Google understand site structure.** Marked-up breadcrumbs (via BreadcrumbList structured data) tell Google exactly how your site is organized.

To get the SERP breadcrumb display, you can:

- Use descriptive URLs (Google will sometimes infer breadcrumbs from URL segments)
- Add explicit `BreadcrumbList` structured data (more reliable)

The structured data version looks like JSON-LD in your page's `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://example.com/products/" },
    { "@type": "ListItem", "position": 3, "name": "Shoes", "item": "https://example.com/products/shoes/" }
  ]
}
</script>
```

This is light, harmless, and broadly useful.

### Internal linking

URLs and directories define your site's *physical* structure. Internal linking defines its *navigational* structure. They should agree.

Practical guidance:

- **Link to relevant content from within your content.** When you mention something covered in another article, link to that article. Natural, contextual links pass topical signal.
- **Use descriptive anchor text.** "How crawling works" links better than "click here."
- **Avoid orphan pages.** A page with no inbound internal links is hard for Google to find and rank.
- **Keep navigation consistent.** Site-wide navigation (header menus, footer links) feeds the crawler a stable view of your site's important pages.

### URL changes and redirects

When you change a URL (renaming, restructuring), you need to redirect the old URL to the new one — typically with a **301 (Permanent Redirect)**.

A 301 redirect:
- Sends users to the new URL
- Tells Google the move is permanent
- Passes the bulk of the old page's ranking signals to the new page (over time)

Common mistakes:

- **Forgetting redirects entirely.** Old URLs return 404s, users hit dead ends, Google sees you've broken links.
- **Using 302 (temporary) instead of 301.** 302s don't fully pass signal because Google assumes you'll restore the old URL.
- **Chained redirects.** `/a → /b → /c → /d` is slow and lossy. Redirect `/a` directly to `/d`.
- **Redirecting many old pages to a single home page.** This is "soft 404" territory — Google treats those redirects as not-very-useful.

If you must move a site or restructure URLs, plan the redirect map carefully, test it, and submit an updated sitemap.

## An analogy: the library

A well-organized library has:

- **Clear shelf labels.** (Descriptive URLs.) You can find the cooking section by reading signs, not by memorizing aisle numbers.
- **Categories that match how readers actually look for books.** (Directory structure.) Cooking is one section, not split across "Books With Recipes" and "Books About Food."
- **Floor maps near the entrance.** (Breadcrumbs.) You always know where you are.
- **Cross-references between books.** (Internal links.) A book on bread baking links to a book on flour milling.

A disorganized library has random shelving, no maps, no cross-references. You can find anything if you search the catalog by exact title — but browsing is hopeless. New books get lost. Visitors get frustrated.

Site structure is library structure. Both Google's crawler and your users are doing what a library visitor does.

## Three real-world scenarios

**Scenario 1: The 30,000-product e-commerce mess.**
A site with 30,000 products had URLs like `/p/?id=4729`. After migrating to descriptive URLs (`/products/blue-leather-shoes`) and adding BreadcrumbList structured data, organic clicks grew 38% in 6 months without changing product content. The clean URLs surfaced in SERPs as breadcrumb trails; users were more confident clicking.

**Scenario 2: The deep-nesting recovery.**
A documentation site had URLs nested 6 levels deep: `/docs/products/widgets/api/v2/endpoints/create-widget`. They consolidated to `/docs/widgets/api/create-widget`. Discovery of newly published pages sped up from ~weeks to ~days, and rankings on long-tail technical queries improved.

**Scenario 3: The forgotten redirect map.**
A site rebranded and changed every URL on launch day. They didn't set up redirects. Within 30 days, 80% of their organic traffic was gone. They scrambled to add 301s for the most-trafficked pages. Recovery took 6 months. Lesson: never change URLs without a redirect plan.

## Common mistakes to avoid

- **Random or numeric URLs.** `/p/?id=4729` works but is worse than `/products/blue-shoes` on every dimension.
- **Mixed-case URLs.** `/Products/BlueShoes` and `/products/blueshoes` are different URLs to most servers — duplicate content waiting to happen.
- **Deep nesting beyond 3 levels.** Hard to crawl, hard to link to, ugly to share.
- **Skipping breadcrumb structured data.** Easy win for SERP appearance.
- **Forgetting redirects after URL changes.** This is the single highest-impact technical mistake possible.
- **Letting tracking parameters proliferate.** Every `?utm_*` variant of your URL is a near-duplicate Google has to canonicalize.

## Read more

- [SEO Starter Guide — Organize your site](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#organize-your-site) — Google's site-organization guidance
- [Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects) — redirect handling

## Summary

- Use descriptive URLs with lowercase, hyphens, and meaningful words.
- Group related pages into directories. Reflect your site's real hierarchy.
- Keep nesting shallow (2–3 levels max for most sites).
- Add BreadcrumbList structured data — it helps both SERP appearance and Google's structural understanding.
- Internal linking should reinforce the directory structure with descriptive anchor text.
- When URLs change, use 301 redirects. Never skip them. Avoid chains. Don't redirect everything to the homepage.

Next: the much-misunderstood world of canonicals and duplicates — including the fact that the "duplicate content penalty" doesn't actually exist.
