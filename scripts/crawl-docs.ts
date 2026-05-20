#!/usr/bin/env tsx
/**
 * Crawls a documentation site and writes a list of in-scope URLs to a
 * course's sources.json. BFS, same-origin, path-prefix-matched, polite
 * (~1 req/sec).
 *
 * Usage:
 *   npx tsx scripts/crawl-docs.ts <root-url> \
 *       --out courses/<slug>/sources.json \
 *       [--max 300] \
 *       [--prefix /search/docs/] \
 *       [--title "Course title"]
 *
 * Example:
 *   npx tsx scripts/crawl-docs.ts \
 *     https://developers.google.com/search/docs \
 *     --out courses/google-search-ai-era/sources.json \
 *     --prefix /search/docs/
 *
 * If --prefix isn't supplied, we use the pathname of the root URL.
 */
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const UA =
  "Mozilla/5.0 (compatible; CourseFactory/0.1; +https://coursefactory.example/bot)";
const DELAY_MS = 800; // polite

interface DiscoveredSource {
  title: string;
  url: string;
  type: "url";
  license?: string;
  author?: string;
}

interface SourcesFile {
  slug: string;
  sources: DiscoveredSource[];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function inScope(href: string, origin: string, prefix: string): boolean {
  try {
    const u = new URL(href);
    if (u.origin !== origin) return false;
    if (!u.pathname.startsWith(prefix)) return false;
    // Strip fragments / query for canonical compare.
    return true;
  } catch {
    return false;
  }
}

function canonical(href: string): string {
  try {
    const u = new URL(href);
    u.hash = "";
    // Drop common doc tracking parameters
    u.searchParams.delete("hl");
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    // Trailing slash normalization
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }
    return u.toString();
  } catch {
    return href;
  }
}

async function fetchHtml(url: string): Promise<{ html: string; title: string } | null> {
  try {
    // Force the English locale: Google serves localized doc pages based on
    // Accept-Language and IP geolocation. We send Accept-Language: en + add
    // ?hl=en as a belt-and-suspenders fallback so we always get English.
    const fetchUrl = (() => {
      try {
        const u = new URL(url);
        if (!u.searchParams.has("hl")) u.searchParams.set("hl", "en");
        return u.toString();
      } catch {
        return url;
      }
    })();
    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  · ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const title =
      dom.window.document.querySelector("title")?.textContent?.trim() ?? url;
    return { html, title };
  } catch (e) {
    console.warn(`  · fetch error — ${url}: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const dom = new JSDOM(html, { url: baseUrl });
  const anchors = Array.from(
    dom.window.document.querySelectorAll<HTMLAnchorElement>("a[href]")
  );
  return anchors.map((a) => a.href).filter(Boolean);
}

async function crawl(opts: {
  rootUrl: string;
  prefix: string;
  maxPages: number;
}) {
  const startUrl = canonical(opts.rootUrl);
  const origin = new URL(startUrl).origin;
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const discovered: { url: string; title: string }[] = [];

  while (queue.length > 0 && discovered.length < opts.maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    process.stdout.write(`  [${discovered.length + 1}/${opts.maxPages}] ${url} … `);
    const page = await fetchHtml(url);
    if (!page) {
      process.stdout.write("skip\n");
      continue;
    }
    discovered.push({ url, title: page.title });
    process.stdout.write("ok\n");

    const links = extractLinks(page.html, url);
    for (const raw of links) {
      const u = canonical(raw);
      if (!inScope(u, origin, opts.prefix)) continue;
      if (visited.has(u)) continue;
      if (queue.includes(u)) continue;
      queue.push(u);
    }
    await sleep(DELAY_MS);
  }

  return discovered;
}

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.replace(/^--/, "");
      const val = argv[i + 1];
      if (val && !val.startsWith("--")) {
        out[key] = val;
        i++;
      } else {
        out[key] = "true";
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, opts: out };
}

async function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const rootUrl = positional[0];
  if (!rootUrl) {
    console.error(
      "Usage: npx tsx scripts/crawl-docs.ts <root-url> --out <sources.json> [--max 300] [--prefix /path/] [--title \"Title prefix\"]"
    );
    process.exit(1);
  }
  const outPath = opts.out;
  if (!outPath) {
    console.error("Missing --out <path/to/sources.json>");
    process.exit(1);
  }
  const maxPages = Number(opts.max ?? "300");
  let prefix = opts.prefix;
  if (!prefix) {
    prefix = new URL(rootUrl).pathname;
    if (!prefix.endsWith("/")) prefix = prefix + "/";
  }

  console.log(`Crawling ${rootUrl}`);
  console.log(`  scope: same origin + path prefix "${prefix}"`);
  console.log(`  max:   ${maxPages} pages`);
  console.log();

  const discovered = await crawl({ rootUrl, prefix, maxPages });
  console.log(`\nDiscovered ${discovered.length} URLs.`);

  // Merge with existing sources.json (if any).
  const absOut = path.resolve(outPath);
  let existing: SourcesFile;
  if (fs.existsSync(absOut)) {
    existing = JSON.parse(fs.readFileSync(absOut, "utf8")) as SourcesFile;
  } else {
    // Infer slug from path: courses/<slug>/sources.json
    const m = absOut.match(/courses\/([^/]+)\/sources\.json$/);
    existing = { slug: m?.[1] ?? "unnamed", sources: [] };
  }

  const seen = new Set(existing.sources.map((s) => s.url).filter(Boolean));
  let added = 0;
  for (const d of discovered) {
    if (seen.has(d.url)) continue;
    existing.sources.push({
      title: d.title,
      url: d.url,
      type: "url",
    });
    seen.add(d.url);
    added++;
  }

  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  fs.writeFileSync(absOut, JSON.stringify(existing, null, 2) + "\n");
  console.log(
    `\n✔ Wrote ${absOut} — total ${existing.sources.length} sources (${added} new).`
  );
}

main().catch((e) => {
  console.error("Crawl failed:", e);
  process.exit(1);
});
