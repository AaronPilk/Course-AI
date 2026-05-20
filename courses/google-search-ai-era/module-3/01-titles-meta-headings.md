---
module: 3
position: 1
title: "Titles, headings, and meta descriptions — what AI summarizers read first"
objective: "Write a title and meta description that influence both the SERP snippet and the AI summary."
estimated_minutes: 13
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# Titles, headings, and meta descriptions — what AI summarizers read first

## The puzzle

You write a 2,000-word article you're proud of. You spent hours on it. Then you slap a generic `<title>` on it like "Blog Post #47 - YourCompany.com" and a placeholder meta description.

The article ranks. But:
- Search Console shows a low click-through rate
- The Google AI Overview summarizes the topic from a competitor's page
- Your snippet on the SERP is just a chopped-up first sentence

The article isn't the problem. The framing of the article — its `<title>`, its `<h1>`, its meta description — is what Google and its AI features read first to decide *what your page is about* and *how to present it*.

This lesson is about that framing.

## The simple version

There are four elements that punch above their weight in modern Google Search:

1. **The `<title>` element.** The title in your page's HTML. Influences both your SERP listing's clickable headline *and* how Google's systems describe the page in AI summaries.
2. **The `<h1>` (main heading).** The visible top heading on the page. Confirms what the page is about.
3. **The `<h2>`/`<h3>` subheadings.** Help Google understand the page's structure and which sections are about which sub-topics.
4. **The meta description.** A summary in the page's HTML that *sometimes* becomes the SERP snippet.

All four are technically simple. Almost everyone gets them subtly wrong. This lesson fixes that.

## The technical version

### The `<title>` element

This is the single highest-leverage piece of HTML on your page. It does three things:

**1. It's a strong signal of what the page is about.** Google uses the title to confirm topical relevance.

**2. It's a candidate for the "title link" on the SERP.** That's the big blue (or dark, in dark mode) clickable headline. Google may or may not use your literal `<title>` text — they sometimes rewrite it for clarity — but your `<title>` is the strongest signal of what they'll show.

**3. It's used by AI summarizers.** When AI Overviews or AI Mode reach for a quick label of what your page is about, the `<title>` is one of the first things they read.

What makes a good `<title>`:

- **Unique to the page.** Every page on your site should have a distinct title. "Home" or "Untitled" are SEO disasters.
- **Accurate to the content.** Wildly mismatched titles ("Make $1M in a week!" on a sober tax article) make Google more likely to rewrite the title to a more accurate alternative.
- **Concise.** Roughly 50–60 characters before it gets truncated on desktop. Mobile cuts earlier. Front-load the essential meaning.
- **Includes the brand when useful.** Patterns like *"How to do X — BrandName"* are fine. Avoid stuffing brand at the front of every title; users searching for the topic don't want to see your brand name first on every snippet.
- **Reflects what someone would actually search for.** Not in a keyword-stuffing way — but if your page is the answer to "how to make sourdough bread," the title should contain those phrases, naturally.

### What NOT to do with `<title>`:

- **Keyword stuffing.** "Sourdough bread sourdough recipe bread baking sourdough" — Google has been ignoring or rewriting these for ~15 years.
- **All-caps.** Looks shouty, often gets rewritten.
- **Clickbait that misrepresents the page.** Google's rewrites are partly aimed at exactly this.
- **Identical titles across pages.** If 50 product pages all share "Buy our products | Acme" as the title, Google will struggle to differentiate them.

### The `<h1>`

The `<h1>` is the main heading users see on the rendered page. It typically reinforces the `<title>` but can differ.

- **One `<h1>` per page is conventional.** Multiple `<h1>`s aren't a ranking penalty (Google said so explicitly) but they're a usability mess.
- **The `<h1>` confirms topical relevance.** When `<title>` and `<h1>` agree, Google is more confident about what the page covers.
- **It's the natural anchor for screen readers.** Treating headings as semantic structure (not just visual) matters for accessibility AND for AI systems that parse pages.

### `<h2>`, `<h3>`, and structure

Subheadings break the page into navigable chunks. Three reasons they matter:

1. **They help readers scan.** Long content without subheadings reads as a wall of text and gets abandoned faster.
2. **They help AI Overviews quote specific sections.** When an AI Overview summarizes a topic, it often pulls text from under specific subheadings. Well-named subheadings make your page more quotable.
3. **They help Google understand what each part of a page is about.** A page with clear `<h2>` "Setup," "Configuration," "Troubleshooting" sections is easier for the algorithm to understand than the same text in a single blob.

There's no magic number of subheadings. Google explicitly says "there's no magical, ideal amount of headings a given page should have." Use as many as the content naturally has.

### Meta descriptions

This is the snippet under the title on a SERP — *sometimes*. Google often generates its own snippet from the page body if the meta description doesn't fit the query well. But when Google uses your meta description, it's a powerful piece of marketing.

What makes a good meta description:

- **Concise.** ~150–160 characters before truncation.
- **Specific to the page.** "Learn more about our company" is a wasted meta description.
- **Useful at a glance.** What does this page give the reader? Why should they click?
- **Avoid duplicate meta descriptions across pages.** Each page should have a distinct one.

### The often-missed elements

A few other elements that punch above their weight:

- **Alt text on images.** Brief descriptions of what each meaningful image shows. Used by screen readers AND by Google's image search AND by AI summarizers when they reference your page.
- **Open Graph tags (`og:title`, `og:description`, `og:image`).** Used by social platforms and increasingly by AI systems to label your page. Filling these in well doesn't directly affect organic rank but does affect how your page appears in shared links and aggregator views.
- **`<title>` and meta description on dynamic / generated pages.** Many sites get titles right on static pages and forget to set them on dynamically generated ones (search results pages, filter pages, product pages). Audit your templates.

### What gets reused in AI summaries

When AI Overviews or AI Mode generate a summary that references your page, they tend to pull:

- The `<title>` as the page label
- Specific sentences that directly answer the query (usually from body content under subheadings)
- Lists and tabular data when present
- Sometimes the meta description, especially for "what is X" framing

This means: writing for AI Overviews is mostly the same as writing well for humans. Clear titles, clear subheadings, clear sentences. The clearer your page is to a careful reader, the easier it is for AI to quote you accurately.

## An analogy: the book cover

Think of your `<title>` and meta description as the book cover and back-cover blurb. Think of your `<h1>` as the title page inside. Think of your `<h2>` subheadings as the table of contents.

If you were a librarian deciding which book to recommend to a reader asking for "books about X," you'd:

- Look at the cover (does it look like it's about X?)
- Read the blurb (does the description suggest this is what I want?)
- Glance at the table of contents (does the book actually cover what the blurb promises?)
- Open to the most relevant chapter and skim a paragraph

That's almost exactly what Google's algorithm does — and what AI Overviews do — when deciding whether and how to surface your page.

Make every layer of that match what your page actually does. Misalignment between any of them is a signal of either bad authorship or worse, deception.

## Three real-world scenarios

**Scenario 1: The "untitled" disaster.**
A CMS migration accidentally set the `<title>` on every page to "Untitled Document." Organic traffic dropped 60% in 3 weeks. The fix took an hour (templated titles per content type). Recovery took 3 months. Lesson: titles are the single most fragile SEO element. Audit yours after every deploy.

**Scenario 2: The brand-first title that hurt CTR.**
An ecommerce site templated all product titles as "Acme Co | [Product Name]." Users scanning SERPs saw "Acme Co | Acme Co | Acme Co" running down the page and couldn't differentiate. CTR was sub-1%. They flipped to "[Product Name] | Acme Co" and CTR doubled. Lesson: put the user-relevant signal first, brand last.

**Scenario 3: The page Google rewrote.**
A blog post titled "10 SECRET TIPS TO HACK GOOGLE SEARCH (NUMBER 7 WILL SHOCK YOU)" found that Google kept showing a different, more accurate title in the SERP. The site complained. Google's response (paraphrased): when your title misrepresents the content, we rewrite. The fix wasn't to fight Google — it was to write an accurate, useful title in the first place.

## Common mistakes to avoid

- **Templated, identical titles across many pages.** Each page needs its own title.
- **Stuffing keywords.** Doesn't help. Often gets rewritten.
- **Letting the CMS pick the title.** Audit what your CMS actually outputs. Many output the H1 or post slug as the `<title>` — sometimes that's fine, sometimes it's bad.
- **Skipping meta descriptions.** Google falls back to body text, which is rarely as good as a well-crafted summary.
- **Forgetting alt text on meaningful images.** Decorative images don't need alt text; informative ones absolutely do.
- **Setting a clickbait title.** Google will rewrite it. Spend the energy writing an accurate, compelling one instead.

## Read more

- [Influencing your title links in Google Search](https://developers.google.com/search/docs/appearance/title-link) — Google's title link doc
- [How to write meta descriptions](https://developers.google.com/search/docs/appearance/snippet) — snippets and meta descriptions

## Summary

- `<title>` is the highest-leverage piece of HTML on your page. Keep it unique, accurate, concise.
- `<h1>` is your visible main heading. One per page, agreeing with the `<title>`.
- `<h2>` / `<h3>` subheadings help readers scan, Google parse, and AI Overviews quote your page.
- Meta descriptions are the SERP snippet — when Google uses them. Write a distinct one for every important page.
- The same elements feed AI summaries. Writing them well is writing for both human readers and machine readers at once.

Next: site structure — URLs, directories, breadcrumbs, and the underrated decisions that compound over a site's life.
