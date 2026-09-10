import { DomUtils, parseDocument } from "htmlparser2";

/** Wrap uncontained tables without serializing or rewriting article markup. */
export function containArticleTables(html: string): string {
  const doc = parseDocument(html, { withStartIndices: true, withEndIndices: true });
  const tables = DomUtils.findAll((node) => node.name === "table", doc.children);
  const inserts: Array<{ start: number; end: number }> = [];
  for (const table of tables) {
    if (table.startIndex == null || table.endIndex == null) continue;
    let contained = false;
    for (let parent = table.parent; parent; parent = parent.parent) {
      if (parent.type !== "tag") continue;
      if (parent.name === "table" || /overflow(?:-x)?\s*:\s*(auto|scroll)/i.test(parent.attribs.style || "") ||
        /\boverflow-x-(?:auto|scroll)\b/.test(parent.attribs.class || "")) {
        contained = true;
        break;
      }
    }
    if (!contained) inserts.push({ start: table.startIndex, end: table.endIndex + 1 });
  }
  for (const { start, end } of inserts.sort((a, b) => b.start - a.start)) {
    html = html.slice(0, start) +
      '<div role="region" aria-label="Scrollable data table" tabindex="0" style="max-width:100%;overflow-x:auto">' +
      html.slice(start, end) + "</div>" + html.slice(end);
  }
  return html;
}
