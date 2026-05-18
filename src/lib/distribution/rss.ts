// Full-content RSS builder per geo-architect § 06-distribution-pipelines.md.
// Perplexity, OpenAI search, and most RSS-consuming AI agents prefer full
// <content:encoded> over title-only excerpts.

const SITE = "https://www.mypayadvisor.com";
const BRAND = "myPayAdvisor";

export interface RssItem {
  title: string;
  link: string;
  pubDate: string; // RFC 822
  description: string;
  contentHtml?: string;
  author?: string;
  categories?: string[];
  guid?: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  // Wrap in CDATA, but escape internal `]]>` if any.
  const safe = (s || "").replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

function toRfc822(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export interface RssChannel {
  title: string;
  link: string;
  description: string;
  language?: string;
  items: RssItem[];
}

export function buildRss(channel: RssChannel): string {
  const lang = channel.language || "en-us";
  const lastBuildDate = new Date().toUTCString();

  const itemsXml = channel.items
    .map((item) => {
      const guid = item.guid || item.link;
      const cats = (item.categories || [])
        .map((c) => `      <category>${escapeXml(c)}</category>`)
        .join("\n");
      const contentEncoded = item.contentHtml
        ? `      <content:encoded>${cdata(item.contentHtml)}</content:encoded>`
        : "";
      const author = item.author ? `      <dc:creator>${escapeXml(item.author)}</dc:creator>` : "";
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(guid)}</guid>`,
        `      <pubDate>${toRfc822(item.pubDate)}</pubDate>`,
        `      <description>${cdata(item.description)}</description>`,
        contentEncoded,
        author,
        cats,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <atom:link href="${escapeXml(channel.link)}.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(channel.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>${escapeXml(BRAND)} RSS</generator>
${itemsXml}
  </channel>
</rss>`;
}

export const SITE_URL = SITE;
export const BRAND_NAME = BRAND;
