---
module: 3
position: 5
title: "The myths to ignore — meta keywords, word count, heading order, and more"
objective: "Recognize the SEO advice Google explicitly says doesn't matter, and stop spending time on it."
estimated_minutes: 11
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# The myths to ignore — meta keywords, word count, heading order, and more

## The puzzle

You search "SEO checklist 2026." The top results have 80-item checklists. They include things like:
- "Add a `<meta keywords>` tag"
- "Ensure articles are at least 2,500 words"
- "Use only one `<h1>` and use H2/H3 in strict order"
- "Set your XML sitemap priority to 1.0 for important pages"

How much of that list is real?

Roughly half of "modern SEO advice" is folklore — habits passed down from when they may have mattered, now repeated without checking whether they still do. This lesson is the cleanup pass.

## The simple version

Google has *explicitly* said the following don't matter for ranking:

- The `<meta keywords>` tag (ignored since ~2009)
- "E-E-A-T is a ranking factor" (it's a framework, not a knob)
- Specific word counts ("there's no magical, ideal word count")
- Heading semantic order (`<h1><h2><h3>` not strictly required)
- Domain TLDs beyond country-specific cases (.com vs .net mostly doesn't matter)
- Keywords in the domain name (very weak signal)
- Subdomains vs subdirectories (do what makes sense for your business)
- The "duplicate content penalty" (covered in lesson 3)
- Sitemap priority and changefreq values (largely ignored)

If you've been spending time on any of these, stop. Spend the time on content quality and the technical fundamentals that actually matter.

## The technical version

### Myth 1: The meta keywords tag

```html
<meta name="keywords" content="seo, marketing, blue shoes, ranking">
```

This tag was used by early search engines in the 1990s. Google **never** used it for ranking. Bing dropped it for ranking around 2014. Every search engine of consequence in 2026 ignores it.

From Google directly:
> "Google Search doesn't use the keywords meta tag."

Stop adding it. Remove it from existing pages. If you see SEO software flagging "missing meta keywords" as an error, change SEO software.

### Myth 2: Magic word counts

"Articles must be at least 2,500 words to rank." "Pages under 300 words get penalized." "The sweet spot is 1,800 words."

All folklore. From Google:
> "The length of the content alone doesn't matter for ranking purposes (there's no magical word count target, minimum or maximum, though you probably want to have at least one word)."

Length should be determined by *what the topic needs*. A simple definition page might be 200 words. A deep technical tutorial might be 5,000. Padding short answers to hit an arbitrary word count makes content worse, not better.

What's true: longer content *correlates* with higher rankings sometimes, because thorough coverage tends to rank well. But the causal arrow runs from thoroughness to ranking, not from word count to ranking.

### Myth 3: Strict heading order

Some SEO tools warn if you have an `<h3>` without an `<h2>` before it, or if a page has multiple `<h1>`s.

Google's actual position:
> "Having your headings in semantic order is fantastic for screen readers, but from Google Search perspective, it doesn't matter if you're using them out of order."

Translation:
- Multiple `<h1>`s aren't a penalty.
- An `<h3>` without an `<h2>` parent isn't a penalty.
- Strict semantic heading nesting is great for accessibility — and you should aim for it for that reason — but Google doesn't punish you for messy headings.

**Accessibility, not SEO**, is why heading order matters. If your tool flags this as an SEO issue, mentally reclassify it as an accessibility issue and treat it accordingly.

### Myth 4: TLD and domain keyword obsession

"Should I get a .com instead of a .net?" "Should I put the keyword in my domain?"

From Google:
> "The keywords in the name of the domain (or URL path) alone have hardly any effect beyond appearing in breadcrumbs."

And on TLDs:
> "The TLD (the domain name ending like '.com' or '.guru') only matters if you're targeting a specific country's users."

What's true:
- A country-specific TLD (`.de` for Germany, `.fr` for France) is a geotargeting signal.
- A `.com` is more familiar / memorable for general audiences.
- Beyond that, TLD doesn't matter much for ranking. Modern Google parses content, not domain endings.

Pick a domain for *branding* reasons. Don't pay 100x more for a "keyword-rich" domain that you'd be stuck with for 10 years.

### Myth 5: Subdomains vs subdirectories

"You must use subdirectories — subdomains are treated as separate sites." Or the reverse: "Subdomains are better for SEO."

Google's stance:
> "Do whatever makes sense for your business. For example, it might be easier to manage the site if it's segmented by subdirectories, but other times it might make sense to partition topics into subdomains."

The honest answer: technical and business reasons usually decide this. SEO is a minor factor. If your CMS naturally produces subdirectories, use them. If you need different tech stacks for different parts of your site, subdomains work. Either can rank well.

### Myth 6: Sitemap "priority" and "changefreq" matter

XML sitemaps support optional `<priority>` (0.0–1.0) and `<changefreq>` (daily, weekly, etc.) attributes.

Google ignores both. They've been clear about this for years. Pages aren't crawled more often because you said `<changefreq>daily</changefreq>`. Your priority-1.0 pages don't rank higher than priority-0.5 pages.

Use sitemaps to tell Google which URLs exist. Skip the priority and changefreq — they're noise.

### Myth 7: "Use exact-match anchor text everywhere"

Some old-school SEO advice: every internal link to a page should use that page's target keyword as anchor text.

Reality:
- Natural, varied anchor text reads better and isn't a signal of manipulation.
- Over-optimization of anchor text (every link to one page being identical) can look like keyword stuffing or PBN behavior.
- Descriptive anchor text in general (not specifically keyword-matched) is the actual advice.

Write anchor text that helps the user understand what they'll get when they click. That's it.

### Myth 8: "PageRank is dead" / "PageRank is all that matters"

PageRank (Google's original link-counting algorithm) is still in play. It's just one of *many* signals now. From Google:
> "While PageRank uses links and is one of the fundamental algorithms at Google, there's much more to Google Search than just links. We have many ranking signals, and PageRank is just one of those."

What's true:
- Links from credible, relevant sites still help.
- Aggressive link-building schemes (buying links, link exchanges, PBNs) still violate spam policies and can hurt you.
- The simplistic "more backlinks = higher rank" model from 2010 is dead.

Build good content. Earn real citations from real sites. Skip schemes.

### Myth 9: "E-E-A-T is a ranking factor"

Already covered in Module 2, but worth restating here since it appears on every SEO checklist:

E-E-A-T is a *framework* Google's quality raters use to evaluate content. The ranking algorithm uses many separate signals that correlate with good E-E-A-T. "Improving E-E-A-T" only means anything if you can name the specific signals you're improving.

### Myth 10: "Update old content to a new date to keep it fresh"

Changing the visible "last updated" date on old content without actually updating it is one of Google's spam policy red flags. From the helpful content doc:

> "Are you changing the date of pages to make them seem fresh when the content has not substantially changed?"

If you list this as a warning sign in your own content audit, you've found a pattern to avoid.

What's true: actual content updates are rewarded. Update the content meaningfully, then update the date. Don't just touch the date.

### Myth 11: "Add FAQ schema to every page for richer SERPs"

A few years ago, adding FAQ structured data made your snippet richer. Google has since pulled FAQ rich results back significantly — they now show mainly for select sites. Pages with manufactured FAQ schema (just to get the rich result) gain little and can look gimmicky.

What's true: if a page legitimately has a Q&A format, FAQ schema is fine. Manufacturing it for snippet-padding is no longer worth the effort.

### Myth 12: "AEO/GEO is the new SEO"

A whole industry has sprung up around "Answer Engine Optimization" and "Generative Engine Optimization." We cover this in detail in Module 4. The short version: Google explicitly says most AEO/GEO tactics — llms.txt files, content chunking for AI, manufactured mentions — don't work. Don't get suckered.

## An analogy: cargo cult science

Richard Feynman coined "cargo cult science" — practices that look like real science but aren't. After WWII, Pacific islanders who'd seen Allied cargo planes land at airstrips built fake airstrips out of bamboo, hoping more planes would come. They were imitating the *form* without the *function*.

Most SEO myths are cargo cult SEO. People observed that things ranked well in 2010 and inferred that the specific *form* (a certain word count, a certain TLD, a certain meta tag) was the cause. The form is being preserved long after the actual ranking signals have evolved.

The cure is to read what Google actually says. The myths almost all have direct contradictions in Google's own documentation. The believers usually haven't read it.

## Three real-world scenarios

**Scenario 1: The 47-point pre-publish checklist.**
A content team had a 47-point SEO pre-publish checklist. Half of it was myth (meta keywords, exact word count, FAQ schema on every page). When they audited the list against Google's documentation and removed the myths, the checklist shrank to 18 items. Content velocity tripled. Rankings actually improved because writers had more time for the items that actually matter.

**Scenario 2: The .net rebrand panic.**
A scrappy startup ranking on a .net domain considered a six-figure rebrand to acquire a .com. They asked their SEO consultant. The consultant said: "There's no reliable signal that .net hurts you compared to .com." They invested the rebrand budget into content instead. Rankings continued to grow on .net.

**Scenario 3: The "fresh content" date manipulation.**
A site mass-updated 2,000 old blog posts to show today's date, without changing the content. Within months, Google's quality systems caught the pattern and demoted the site sitewide. The fix took 18 months and required honest, substantive content updates.

## Common mistakes to avoid

- **Adding `<meta name="keywords">`.** It does nothing. Remove it.
- **Padding articles to hit word-count targets.** Makes content worse without helping rankings.
- **Worrying about heading semantic order for SEO reasons.** Worry for accessibility reasons. SEO is fine either way.
- **Spending money on exact-match keyword domains.** Almost never worth the premium.
- **Filling sitemaps with priority and changefreq.** Google ignores both.
- **Updating "last modified" dates without updating content.** Spam policy risk.
- **Buying SEO services that promise to "fix" any of the myths above.** Walk away.

## Read more

- [SEO Starter Guide — Things we believe you shouldn't focus on](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#things-we-believe-you-shouldnt-focus-on) — Google's official "myths" section

## Summary

- Most "modern SEO advice" includes a dozen pieces of folklore Google has explicitly debunked.
- Time spent on myths is time *not* spent on content quality, technical fundamentals, and authority-building — the things that actually move rankings.
- When you see SEO advice, check Google's actual documentation. If the advice contradicts Google's stated position, treat the advice with suspicion.
- Beware of SEO services that build their offering around mythical tactics. They're either ignorant or hoping you are.

That wraps Module 3. You now have the full technical toolkit: titles, structure, canonicals, images, and the long list of things you can safely ignore.

Up next: Module 4 — the part of the course that talks about AI Overviews, AI Mode, and why most "AI optimization" advice on the internet is — by Google's own admission — wrong.
