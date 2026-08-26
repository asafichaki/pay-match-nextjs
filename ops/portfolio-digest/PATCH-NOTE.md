# Patch note: myPayAdvisor SEO block in portfolio_digest.py

1. Copy `render_seo_section.py` next to `/opt/portfolio-digest/portfolio_digest.py` on Hermes (same dir, stdlib only, no install).
2. In `portfolio_digest.py`, after the imports (line 14, `from pathlib import Path`), add: `from render_seo_section import render_seo_section`.
3. In `render_email_html()` (line 219), right after `sections = "".join(...)` (line 221), add: `seo_block = render_seo_section("/var/lib/mypayadvisor-seo")`.
4. In the f-string of that function, inside `<div style="margin-top:28px;">` (line 239-241), change `{sections}` to `{sections}{seo_block}` so the SEO block renders after the CCC and Renology social sections.
5. Nothing else changes: same Resend send, same recipients, same 08:30 cron. The block is at most 25 lines; when the loop has not written a report in 36h it is one red line and nothing else about SEO.
6. The block reads `report-YYYY-MM-DD.json` for today, then yesterday; the 06:15 daily run and the 07:40 report rebuild both finish before 08:30.
7. Failures and red lines render first in `#B42318`; everything else in the digest ink colour. No PII, no em-dashes.
8. Dry check on Hermes before the first morning: `python3 /opt/portfolio-digest/render_seo_section.py /var/lib/mypayadvisor-seo` prints the HTML.
9. Local check: `python3 ops/portfolio-digest/render_seo_section.py <state_dir>` after `python3 ops/hermes-seo/main.py report --dry-run` wrote a report there.
10. Rollback: delete the import and the `{seo_block}` reference; the digest is unchanged.
