import fs from 'node:fs';
import assert from 'node:assert/strict';
import {routeSources} from '../seo/lastmod-core.mjs';
const manifest=JSON.parse(fs.readFileSync('public/seo-manifest.json'));
for(const file of ['cpacharge-vs-stripe','pos-by-business-type']) {
  const article=JSON.parse(fs.readFileSync(`src/data/articles/${file}.json`));
  const row=manifest.routes.find(r=>r.slug===article.slug);
  assert.equal(row.base_description,article.description,'LLM route inventory must read imported content metadata');
  assert.ok(row.outline.length>=6,'LLM outline must include imported article headings');
  const sources=routeSources().find(([route])=>route===`/insights/${article.slug}`)[1];
  assert.ok(sources.some(p=>p.endsWith(`/${file}.json`)),'content-only changes must update the route lastmod');
}
console.log('PASS: imported article metadata, outlines and lastmod dependencies remain discoverable.');
