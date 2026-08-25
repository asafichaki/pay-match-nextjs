// Minimal, dependency-free Markdown to HTML for feed bodies (updates_feed.body_md).
// Handles what the Pulse editorial roundups actually use: paragraphs, ##/### headings,
// bullet and numbered lists, **bold**, and [text](url) links. Everything is HTML-escaped
// first, so untrusted characters in the source never reach the feed unescaped.
// Not a general Markdown parser on purpose: the output goes inside <content:encoded>
// CDATA and must stay simple for RSS readers and AI crawlers.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // [text](https://url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, text, url) => `<a href="${url}">${text}</a>`);
  // **bold**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return out;
}

export function markdownToHtml(md: string): string {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");

    const heading = block.match(/^(#{1,6})\s+(.+)$/);
    if (heading && lines.length === 1) {
      const level = Math.min(Math.max(heading[1].length, 2), 4);
      html.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      continue;
    }

    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      html.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`);
      continue;
    }

    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      html.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
      continue;
    }

    html.push(`<p>${lines.map((l) => inline(l.trim())).join(" ")}</p>`);
  }
  return html.join("\n");
}

export { escapeHtml as escapeHtmlText };
