---
module: 4
position: 4
title: "Where to actually focus, plus a preview of agentic SEO"
objective: "Apply the two things Google says matter for AI search (non-commodity content + technical clarity) and understand what's coming with browser agents and protocols like UCP."
estimated_minutes: 11
videos:
  - title: "Google Search Central — Channel"
    url: "https://www.youtube.com/c/GoogleSearchCentral"
    source: "Google Search Central"
---

# Where to actually focus, plus a preview of agentic SEO

## The puzzle

You've cleared out the AEO/GEO snake oil from your strategy. You've reinvested in classic SEO fundamentals. What's left? Are there *any* AI-era-specific things that genuinely matter?

Yes. There are exactly two from Google's documentation, plus a preview of what's coming. This lesson covers all three — concise, honest, and grounded in Google's actual guidance.

## The simple version

If you've absorbed the previous three lessons, the practical AI-era playbook is short:

1. **Create non-commodity content.** Unique, first-hand, expert. Information that doesn't exist anywhere else.
2. **Build clear technical structure.** Crawlable, indexable, well-organized, fast.

Those are the two things Google calls out in the AI Optimization Guide as primary drivers of AI search success.

Then, looking forward: **agentic browsing.** Autonomous AI agents that visit websites to complete tasks. This is emerging in 2026 and will probably be a significant part of how websites get used by 2027–2028. We cover what to do about it.

## The technical version

### Focus 1: Non-commodity content

We covered this thoroughly in Module 2, lesson 3, but it bears repeating here because Google specifically highlights it in the AI Optimization Guide as a primary driver of AI search visibility.

From the guide:

> "Creating content that people find unique, compelling, and useful will likely influence your website's presence in generative AI search in the long run more than any of the other suggestions in this guide."

Note the "**more than any of the other suggestions in this guide**." Of everything in the AI Optimization Guide, *this is the one that matters most.*

Practical implications:

- A site of 50 substantive original pieces will outperform a site of 500 derivative pieces.
- "More content" is rarely the answer in the AI era. Better content almost always is.
- Cull aggressively. Pages that aren't pulling weight are diluting your site's signal.
- The investment that compounds: depth, originality, first-hand perspective, real research, real opinion, real cases.

### Focus 2: Clear technical structure

Also from the AI Optimization Guide:

> "Build and maintain a clear technical structure. The way Google Search finds and processes your pages remains the core of how our AI systems access your data."

Specifics Google calls out:

- **Meet the Search technical requirements** — basic indexability, no `noindex` errors, valid HTML, etc.
- **Follow crawling best practices** — `robots.txt` not blocking important resources, no broken internal links, etc.
- **Use semantic HTML when natural** — but Google explicitly says perfect semantic HTML isn't required. "Focus on human readability and don't worry about perfect code."
- **JavaScript SEO best practices** if you have a JS-heavy site
- **Good page experience** — Core Web Vitals, responsive design, no intrusive interstitials
- **Reduce duplicate content** — covered in Module 3, lesson 3

Notice every one of these is in Modules 1–3 of this course. There's no AI-specific technical wizardry. The same fundamentals apply.

### A small but real new property: ecommerce surfacing

Google does highlight one new pattern for ecommerce sites:

> "Where appropriate, generative AI responses can include product listings, product information, and information about local businesses. Using products like Merchant Center (such as Merchant Center feeds) and Google Business Profiles can help your products and services to be visible in both AI responses and other Google Search results."

If you sell products or operate a local business, the Merchant Center / Business Profile work you already do for shopping and local search also feeds AI features. It's not a new tactic — it's the same tactic, with additional payoff in the AI surface.

### Agentic browsing — the next wave

The most interesting AI-era development isn't AI Overviews. It's **autonomous AI agents** that visit websites to complete tasks on behalf of users.

Examples already in production or imminent:

- An agent that books a flight by visiting airline sites
- An agent that compares product prices across retailers
- An agent that fills out a form to apply for a service
- An agent that gathers information from multiple sites to answer a research question

These agents are different from AI Overviews in important ways:

- They don't just *summarize* content; they *interact* with sites
- They read the page like a browser (rendered HTML, accessibility tree, sometimes screenshots)
- They follow links, fill forms, click buttons
- The user gets a completed task, not a summary

Google's guide acknowledges this:

> "AI agents are autonomous systems that can perform tasks on behalf of people, such as booking a reservation or comparing product specifications. These agents can take many forms; for example, browser agents may access your website to gather the data they need to complete these tasks, such as analyzing visual renderings (like screenshots), inspecting the DOM structure, and interpreting the accessibility tree."

### What "agent-friendly" sites look like

The early guidance — partially from Google, partially from the web platform community — converges on:

- **Clean semantic HTML.** Agents inspect the DOM. Pages that mark up buttons as `<button>`, headings as `<h2>`, forms as `<form>` are easier to parse than pages that fake it all with `<div>`s.
- **Accessibility done well.** Agents rely on the accessibility tree (the same one screen readers use). Sites with good accessibility (ARIA roles, alt text, clear focus order) are also good for agents.
- **Predictable forms.** Forms with proper `<label>` elements, clear field names, no captchas blocking essential flows.
- **No surprise blocks.** Agents from major AI tools usually identify themselves via User-Agent. Don't block them reflexively — many sites are unintentionally invisible to agents because of overly aggressive bot-blocking.

### Universal Commerce Protocol (UCP)

A newer development Google is referencing: protocols like **Universal Commerce Protocol** that standardize how AI agents and websites interact for commerce tasks.

From Google:

> "Protocols like Universal Commerce Protocol (UCP) are emerging that will allow Search agents to do more."

The intent: instead of agents having to scrape product info from arbitrary HTML, sites can publish structured data conforming to UCP that agents can interact with directly. Think of it as "structured data, but for actions, not just descriptions."

UCP and similar protocols are early — likely too early to invest in heavily for most sites. But this is a watch-this-space area. By late 2026 or 2027 we may have clearer guidance on when this matters.

### The practical 2026 forward-looking checklist

If you're investing in being well-positioned for the next phase of AI search:

1. **Get the fundamentals right first.** All of Modules 1–3 of this course. Without these, nothing else matters.
2. **Invest in non-commodity content.** The single highest-leverage long-term move.
3. **Make sure your site works well with accessibility tools.** This is also a check for agent-friendliness.
4. **Use semantic HTML.** Real `<button>`s, real `<form>`s, real headings. Skip if Google's docs are crystal clear that it's optional — but if you have a choice between proper semantics and faking it, pick semantics.
5. **Keep Merchant Center and Business Profile current.** For commerce and local.
6. **Watch the agentic-web space.** Don't over-invest yet. Track UCP, agent-friendly site standards, and major launches (Anthropic's Computer Use, OpenAI's agents, Google's own).
7. **Skip every "AEO/GEO" pitch that doesn't appear in Google's documentation.**

That's the full forward-looking strategy. Most of it is classic SEO done well. A small slice is agent-aware site design.

## An analogy: the long bet on infrastructure

In the 1990s, businesses faced a choice: invest in flashy CD-ROM-based marketing experiences, or invest in dull, foundational website infrastructure. Most flashy CD-ROM strategies are forgotten today. The websites compounded for decades.

In 2010, businesses faced a choice: invest in elaborate mobile apps for every promotion, or build mobile-friendly websites. The apps mostly died. The mobile-friendly websites compounded.

In 2026, businesses face the same choice: invest in AEO/GEO marketing tactics that aren't in Google's documentation, or build deep content and clean technical structure on a site that's accessible, semantic, and agent-friendly.

The pattern always rewards infrastructure. The hype cycles around the infrastructure come and go. The sites that focus on the substance — quality content, technical clarity, openness to whatever next interaction model emerges — are the ones still here a decade later.

## Three real-world scenarios

**Scenario 1: The "all-in on classic" winner.**
A B2B SaaS company decided in 2024 to invest entirely in non-commodity content + clean technical structure, ignoring all AI-specific marketing tactics. By 2026, they:
- Rank well in classic Google search
- Get cited frequently in AI Overviews
- Have content that AI agents can summarize accurately
- Surface in Merchant Center / Business Profile contexts where relevant

Their AI-specific spend over two years: $0. Their AI-specific results: substantial.

**Scenario 2: The site that quietly broke agents.**
An ecommerce site implemented aggressive bot-blocking after a scraping incident. The block was overzealous — it caught agents from Anthropic, OpenAI, and Google's own AI tools. The site became "invisible" in agent-mediated tasks: users asking AI assistants to compare prices got told the site couldn't be checked. The fix took an hour (allowlisting major AI user-agents). The lost transactions were never recovered.

**Scenario 3: The accessibility win that paid off twice.**
A health information site invested in accessibility — proper headings, real labels, alt text on every image, clear focus order. The first benefit was the obvious one: more accessible to users with disabilities. The unexpected benefit two years later: AI agents and AI Overviews parsed and quoted the site exceptionally well, because the semantic structure was clear. Accessibility work paid the SEO benefit they hadn't designed for.

## Common mistakes to avoid

- **Skipping the fundamentals to chase agentic SEO.** Like all AI tactics, this is built on top of normal SEO.
- **Aggressive bot-blocking.** Reflexive blocks against all crawlers/agents will make you invisible to AI features that drive traffic. Allowlist intentionally.
- **Investing heavily in UCP or similar early protocols.** Still emerging. Watch, don't invest yet for most sites.
- **Believing accessibility is "optional" for SEO purposes.** It increasingly isn't. Agents and AI features rely on the same semantic / accessibility tree screen readers do.
- **Trying to optimize for AI agents the way you'd optimize for SEO.** Agents complete tasks; they don't rank. The optimization is "be functional and predictable," not "be top-of-results."

## Read more

- [Optimizing for generative AI features — Explore agentic experiences](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#agentic-experiences) — Google's note on agents
- [AI agent site UX (web.dev)](https://web.dev/articles/ai-agent-site-ux) — broader community guidance on agent-friendly sites
- [Universal Commerce Protocol](https://ucp.dev/latest/) — the emerging UCP standard

## Summary

- The two things Google explicitly says drive AI search success: **non-commodity content** and **clear technical structure**. Both are fundamentals from earlier modules.
- For ecommerce and local: Merchant Center / Business Profile feeds AI features the same way they feed shopping and maps.
- The next wave: **agentic browsing**. Autonomous AI agents that interact with sites. The right preparation is accessibility, semantic HTML, predictable forms, and not blocking AI user-agents reflexively.
- Emerging protocols (UCP) are early. Watch, don't over-invest.
- The forward-looking checklist is 90% classic SEO and 10% agent-aware site design. There's no separate "AI optimization" tier.

That wraps Module 4. You now know how AI Overviews and AI Mode actually work, why classic SEO still applies, what's snake oil, and what's worth investing in for the next wave.

Up next: Module 5 — moving from "how does this all work" to "what do I actually do with my business this week." Hiring SEOs without getting scammed, Search Console as a dashboard, and diagnosing traffic drops without panicking.
