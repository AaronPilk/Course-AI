---
module: 1
position: 1
title: "The 3-stage pipeline — why 'I'm indexed' doesn't mean 'I'm ranking'"
objective: "Distinguish the three independent stages of Google Search and explain why each can fail separately."
estimated_minutes: 12
videos:
  - title: "How Google Search Works (in 5 minutes)"
    url: "https://www.youtube.com/watch?v=0eKVizvYSUQ"
    source: "Google Search Central"
  - title: "Introducing How Search Works (with Gary Illyes)"
    url: "https://www.youtube.com/watch?v=5MIAugQ17ks"
    source: "Google Search Central"
---

# The 3-stage pipeline — why "I'm indexed" doesn't mean "I'm ranking"

## The puzzle every SEO faces

You open Google Search Console — Google's free tool that shows you how your site appears in Search. You inspect your page. It says: **"URL is on Google."** Green checkmark. Indexed.

You go to Google. You type a query you should be ranking for. You scroll. Page 1. Page 2. Page 3. Nothing.

What just happened?

If you don't have a clear answer to that question, this lesson is the most important one in the entire course. Because almost every SEO mystery — the ranking that vanished overnight, the page that "should" rank but doesn't, the site that was crawled but never indexed, the technical fix that didn't move anything — comes down to one structural misunderstanding: **most people think Google Search is one thing. It's actually three things in a sequence.**

Once you see those three stages clearly, you stop chasing ghosts. You stop running ten experiments at once. You start diagnosing.

## The simple version

Google Search works in three stages, and each one is a separate decision Google's systems make about your page:

1. **Crawl** — *can we get to this page at all?*
2. **Index** — *now that we have it, do we want to store it?*
3. **Serve** — *now that it's stored, do we want to show it to this user, for this query, right now?*

Each stage is a yes-or-no gate. To rank for a query, your page has to clear all three. Failing any one of them is enough to make you invisible — and the failure modes look very different.

Here's the part that surprises people. **Google explicitly says, in their own documentation, that none of these are guaranteed.** Not crawling. Not indexing. Not serving. Word-for-word from the *How Google Search Works* doc:

> "Google doesn't guarantee that it will crawl, index, or serve your page, even if your page follows the Google Search Essentials."

Three stages. Three independent yes/no decisions. No guarantees on any of them.

## The technical version

Let's pin down what actually happens at each stage, using Google's own terminology so you can recognize it everywhere else in the documentation.

### Stage 1 — Crawling

Crawling is the process where **Googlebot** — Google's automated web crawler, basically a program that visits websites the same way you do — downloads the actual contents of your page. The HTML (the underlying code of the page), the images, the JavaScript (the code that makes pages interactive), the CSS (the code that makes pages look styled). It's a regular web request, just like the one your browser makes every time you click a link.

Before Googlebot can crawl your page, it has to *know the page exists*. Google calls this **URL discovery**. There are three main ways your pages get discovered:

- **Internal links** from pages Google already knows about. Google visits one page, sees a link, queues that link for later.
- **External links** from other sites. Google crawls Wikipedia, sees a link to you, queues you.
- **Sitemaps**, which are files that list all your URLs in one place. You can submit one through Search Console.

Once a URL is discovered and queued, Googlebot may visit it. *May.* Google says it "uses an algorithmic process to determine which sites to crawl, how often, and how many pages to fetch from each site." Some pages never get crawled because Google's crawler decides they're not worth the bandwidth.

When Googlebot does visit, it renders the page using a recent version of Chrome — which means it executes your JavaScript, just like your browser would. That's important. If your site uses JavaScript to build its content *after* the page first loads (this is common with modern frameworks like React or Vue), Googlebot will see what's there *after* JavaScript runs. Usually. There are caveats. We'll cover them in Module 3.

Stage 1 fails when Googlebot can't reach your page. Common reasons:

- Your `robots.txt` file (a small text file on your site that gives instructions to crawlers) tells Google not to crawl this URL.
- Your server returns errors — like a 500 (server crashed) or a timeout (took too long to respond).
- The page requires logging in.
- Domain or network issues block the crawler entirely — for example, your DNS (the system that translates `yourdomain.com` into a server address) is misconfigured.

### Stage 2 — Indexing

Once Googlebot has the page, indexing is the process where Google **decides what the page is about and whether to store it**.

A few different things happen at this stage:

- **Content analysis.** Google parses the text on the page, the `<title>` element (the title of the page that shows up in browser tabs and search results), the headings, the alt attributes on images (short text descriptions used by screen readers and search engines), and the contents of embedded videos. It builds a picture of what this page is about.
- **Canonicalization.** Google looks for pages with similar content and groups them into **clusters**. Then it picks one URL from each cluster to be the **canonical** — the official, representative URL for that content. Only the canonical can really show up in search results. The other URLs in the cluster get filed as "alternates" and may show up in specific contexts (for example, the mobile version of a page might show on mobile devices).
- **Signal collection.** Google notes things like the page's language, the country it's relevant to, how usable the page is, whether it has structured data (special tags that label what your content is about — we'll cover those in Module 3), and many other signals. These get used in Stage 3.

Then, finally: **Google decides whether to actually add the canonical to its index.** Or not. The Google index is a massive database hosted on thousands of computers. It's huge. It's also not infinite, and it's not indiscriminate. Google explicitly says: *"Indexing isn't guaranteed; not every page that Google processes will be indexed."*

Stage 2 fails when Google looks at your page and decides it's not worth storing. Common reasons:

- The content is low quality.
- The page is a duplicate and another URL won the canonical selection.
- A `noindex` tag on the page tells Google not to index it (this is something a developer might add deliberately, or accidentally, in the page's HTML).
- The page is hard to understand — design quirks, broken structure, JavaScript that won't render properly.

### Stage 3 — Serving

The index exists. Your page is in it. Now a user types a query.

Google's serving systems take that query and search the index for matching pages. Then they rank those pages by relevance and quality — using *hundreds* of factors. From Google: *"Relevancy is determined by hundreds of factors, which could include information such as the user's location, language, and device."*

Two things to internalize about serving:

1. **The result isn't the same for everyone.** Someone in Paris searching "bicycle repair shops" sees different results than someone in Hong Kong. Different language settings, different device types, different histories — all of it can shift the SERP (the *Search Engine Results Page* — the page of results you see when you type a query into Google).
2. **The SERP format isn't the same for every query.** Searching "bicycle repair shops" surfaces a local map with nearby shops. Searching "modern bicycle" surfaces image results. Different queries trigger entirely different SERP layouts. Your page can be indexed and excellent, and just not fit the format Google decided to use for that query.

Stage 3 fails when your page is in the index, but Google's serving systems decide it's not the best match for this user, for this query, at this moment. Reasons range from "not relevant" to "lower quality than competitors" to "this SERP is dominated by a different content type entirely" (e.g., your blog post can't beat a YouTube tutorial when Google decides the user wants video).

## An analogy: the city, the records office, and the realtor

A house gets onto Zillow. How does that happen?

First, a **city building inspector** visits the property — measures it, photographs it, writes up the assessment. *That's crawling.* If the inspector can't get past the front gate, nothing else happens. If your dog scares them off, nothing else happens.

Then, the inspection report goes to the **county records department**. The records department decides what to file: which official address represents this property (canonical), what category it belongs to, which other listings it conflicts with. Some submissions get filed. Some get rejected. *That's indexing.*

Finally, the **realtor** decides which houses to put in front of which buyers. A first-time buyer looking in your price range sees one set of homes. A wealthy out-of-towner looking for investment property sees another set. The realtor knows about every house on file — but they only show a few. *That's serving.*

You can have a beautiful house. The inspector can't reach it. Game over.
You can have the inspector inside. The records office decides another house already represents that lot. Game over.
You can be filed. The realtor shows different houses to the buyer you wanted. Game over.

Three independent gates. Each one has its own way of failing.

## Three real-world failure scenarios

**Scenario 1: Stuck at crawling.**
You launched a new product page two weeks ago. Search Console shows the URL as "Discovered — currently not indexed." Your sitemap lists it. But Google hasn't crawled it yet. Most likely cause: your site has thousands of URLs, low overall authority (other sites don't link to you much), and Google's crawler is rationing visits. Or: your `robots.txt` has a rule you didn't realize was matching. The fix isn't a content rewrite. The fix is making the page crawlable, prominent in your link structure, and ideally linked to from somewhere outside your site.

**Scenario 2: Stuck at indexing.**
Your page is crawled — Search Console says "Crawled — currently not indexed." This means Googlebot saw it, but Google decided not to store it. Most often: the content is too thin, too duplicate, or too templated (looks just like every other page on your site). The fix isn't more keywords. The fix is making the page substantively worth indexing.

**Scenario 3: Stuck at serving.**
Your page is indexed. The URL Inspection Tool in Search Console (the tool that tells you the status of any URL) says everything is fine. But you're nowhere on the SERP. This is the *serving* failure, and it's the most common one. Your page is in the index — just not winning against other pages for this query. The fix is content quality, topical relevance, and the kind of authority Google's systems associate with trusted sources. The fix is almost never technical.

## The mistake almost everyone makes

The single biggest SEO mistake — and you'll see it in every forum thread, every Twitter post, every cheap consultant's audit — is conflating these three stages.

People say "my page isn't ranking" and then check whether it's indexed. They confirm it's indexed. They breathe a sigh of relief and start tweaking title tags, hoping to "rank higher." But indexing and ranking are two different gates. Confirming the first one tells you nothing about the second.

People say "I submitted my sitemap" as if that solves crawling. It doesn't. Submitting a sitemap is a hint to Google. Not a command. Google may still decide not to crawl, not to index, or not to serve.

People treat SEO as one big knob to turn. It's not. It's three sequential gates, each with their own diagnostic, each with their own fix.

## Common mistakes to avoid

- **Assuming indexed = ranking.** Indexed means "Google has decided to store this." Ranking means "Google has decided to show this for a specific query." Two different decisions.
- **Assuming submitted = indexed.** A sitemap submission is a hint. Indexing isn't guaranteed even for sitemap URLs.
- **Treating SEO as one problem.** "My SEO is bad" isn't a diagnosis. "My page is stuck at indexing because the content is templated" is a diagnosis.
- **Skipping the URL Inspection Tool.** Search Console's URL Inspection Tool tells you exactly which stage your URL is at. Use it before guessing.

## Watch

Two short Google Search Central videos that reinforce this lesson:

- **[How Google Search Works (in 5 minutes)](https://www.youtube.com/watch?v=0eKVizvYSUQ)** — A five-minute animated overview of how Google's software indexes the web, ranks sites, and serves results. Perfect first watch.
- **[Introducing How Search Works](https://www.youtube.com/watch?v=5MIAugQ17ks)** — Gary Illyes, a senior engineer on the Google Search team, kicks off a series demystifying Search. Good companion to this lesson.

## Summary

- Google Search runs in three sequential stages: **crawl** (can we get it?), **index** (do we store it?), and **serve** (do we show it for this query?).
- Each stage is an independent decision. Each can fail. None are guaranteed.
- Most SEO mysteries are diagnosed by figuring out which stage your page is stuck at.
- The next three lessons go deep on each stage: crawling, then indexing, then serving.

By the end of Module 1, you'll be able to look at a page that's underperforming and say, with confidence, *"It's a Stage 2 problem"* — and you'll know what to do about it.
