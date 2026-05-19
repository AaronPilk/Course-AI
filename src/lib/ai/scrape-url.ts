// Fetches a URL and extracts a clean main-content text + title using
// Mozilla Readability with a JSDOM environment. Falls back to cheerio for
// pages Readability can't parse (e.g., docs with custom layouts).
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import { cleanText } from "./extract-pdf";

const UA =
  "Mozilla/5.0 (compatible; CourseFactory/0.1; +https://coursefactory.example/bot)";

export interface ScrapeResult {
  title: string;
  text: string;
  author?: string;
  publishedDate?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("xml")) {
    throw new Error(`Unsupported content-type: ${contentType}`);
  }
  const html = await res.text();

  // Readability first.
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article && article.textContent && article.textContent.trim().length > 200) {
      return {
        title: article.title?.trim() || url,
        text: cleanText(article.textContent),
        author: article.byline?.trim() || undefined,
        publishedDate: undefined,
      };
    }
  } catch {
    // fall through to cheerio
  }

  // Cheerio fallback: strip nav, footer, header, scripts, styles.
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, noscript, aside").remove();
  const title = $("title").first().text() || url;
  const text = cleanText($("body").text());
  if (!text || text.length < 100) {
    throw new Error("Could not extract readable content from this URL.");
  }
  return { title: title.trim(), text };
}
