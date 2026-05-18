// Editorial rate table for the homepage. Reads from Supabase server-side.
// Redesign: one representative effective-rate per row (the eye can compare),
// support compressed to icons, setup column dropped, top-pick row highlighted,
// one decisive CTA per row routing to the matching quiz.

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface ProviderRow {
  name: string;
  rating: number | null;
  rating_label: string | null;
  transaction_fees: string | null;
  setup_speed: string | null;
  funding_speed: number | null;
  customer_support: string | null;
  url: string | null;
  is_top_pick: boolean;
  display_order: number;
  source_url: string | null;
  last_verified: string | null;
}

async function fetchProviders(): Promise<ProviderRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("providers")
    .select(
      "name, rating, rating_label, transaction_fees, setup_speed, funding_speed, customer_support, url, is_top_pick, display_order, source_url, last_verified"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(10);
  return (data || []) as ProviderRow[];
}

// Funding: one short word for the eye.
function fmtFunding(n: number | null): { label: string; chipTone: string } {
  if (n === null || n === undefined) return { label: "—", chipTone: "bg-muted text-muted-foreground" };
  if (n <= 1) return { label: "Next-day", chipTone: "bg-primary/10 text-primary border border-primary/20" };
  if (n <= 2) return { label: "2 days", chipTone: "bg-foreground/[0.06] text-foreground border border-border" };
  return { label: `${n} days`, chipTone: "bg-foreground/[0.06] text-foreground border border-border" };
}

// Extract one representative effective-rate from the raw transaction_fees string.
// Strategy: pull the first percent + flat-fee pair. Returns the headline pair and
// the remaining fragments as a caption.
function parseRate(raw: string | null): {
  hero: string | null;
  channelTag: string | null;
  caption: string | null;
} {
  if (!raw) return { hero: null, channelTag: null, caption: null };
  const text = raw.trim();

  // Split on common separators: " · ", " | ", " / ", " + " when between segments
  const parts = text
    .split(/\s+·\s+|\s+\|\s+|\s+\/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Helper to find first "X.X% + $Y" pair inside a fragment
  const pairRe = /(\d+(?:\.\d+)?%\s*\+\s*\$?\d+(?:\.\d+)?)/;
  // Helper to detect channel prefix like "Online", "In-person", "Keyed"
  const channelRe = /^(Online|In[- ]person|Keyed|Card[- ]present|Card[- ]not[- ]present|Retail|Ecom|Ecommerce)\s*[:\-]?\s*/i;

  for (const segment of parts.length ? parts : [text]) {
    const m = segment.match(pairRe);
    if (m) {
      const hero = m[1].replace(/\s+/g, " ");
      const tagMatch = segment.match(channelRe);
      const channelTag = tagMatch ? tagMatch[1].replace(/[- ]/g, "-") : null;
      // Remaining segments (excluding the matched one) → caption
      const remaining = parts.filter((p) => p !== segment);
      const caption = remaining.length ? `also ${remaining.join(" · ")}` : null;
      return { hero, channelTag, caption };
    }
  }

  // Fallback: subscription-style ("$99/mo + IC + $0.08") or "1.5% - 2.9%" ranges
  const rangeRe = /(\d+(?:\.\d+)?%\s*[-–—]\s*\d+(?:\.\d+)?%)/;
  const rangeMatch = text.match(rangeRe);
  if (rangeMatch) {
    return { hero: rangeMatch[1], channelTag: null, caption: text.replace(rangeMatch[1], "").trim().replace(/^[·|/-]\s*/, "") || null };
  }

  const subRe = /(\$\d+(?:\.\d+)?\s*[-–—]?\s*\$?\d*(?:\.\d+)?\s*\/mo)/i;
  const subMatch = text.match(subRe);
  if (subMatch) {
    const remainder = text.replace(subMatch[1], "").replace(/^\s*[+·|/-]\s*/, "").trim();
    return { hero: subMatch[1], channelTag: "Subscription", caption: remainder || null };
  }

  return { hero: text.length <= 24 ? text : text.slice(0, 22) + "…", channelTag: null, caption: null };
}

// Compress free-text customer_support into structured icon set + label.
function parseSupport(raw: string | null): { phone: boolean; email: boolean; chat: boolean; note: string } {
  if (!raw) return { phone: false, email: false, chat: false, note: "—" };
  const t = raw.toLowerCase();
  const phone = /phone|call/.test(t);
  const email = /email|mail/.test(t);
  const chat = /chat|message/.test(t);
  const is247 = /24\/7|24x7|round[- ]the[- ]clock/.test(t);
  const businessHours = /business hours|m[- ]f|mon[- ]fri|weekdays/.test(t);
  const note = is247 ? "24/7" : businessHours ? "Business hours" : raw.length <= 28 ? raw : raw.slice(0, 26) + "…";
  return { phone, email, chat, note };
}

function RatingPill({ rating, label }: { rating: number | null; label: string | null }) {
  if (rating === null || rating === undefined) return <span className="text-muted-foreground text-sm">—</span>;
  const tone =
    rating >= 9
      ? "bg-primary/10 text-primary border-primary/20"
      : rating >= 8
        ? "bg-foreground/[0.05] text-foreground border-border"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums ${tone}`}>
      <Star className="h-3 w-3 fill-current" />
      {Number(rating).toFixed(1)}
      {label && <span className="font-normal opacity-70">· {label}</span>}
    </span>
  );
}

function SupportIcons({ s }: { s: ReturnType<typeof parseSupport> }) {
  const cls = "h-3.5 w-3.5";
  const on = "text-foreground/70";
  const off = "text-foreground/15";
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Support: ${s.note}${s.phone ? " · phone" : ""}${s.email ? " · email" : ""}${s.chat ? " · chat" : ""}`}
      aria-label={`Support: ${s.note}${s.phone ? ", phone" : ""}${s.email ? ", email" : ""}${s.chat ? ", chat" : ""}`}
    >
      <Phone className={`${cls} ${s.phone ? on : off}`} aria-hidden="true" />
      <Mail className={`${cls} ${s.email ? on : off}`} aria-hidden="true" />
      <MessageCircle className={`${cls} ${s.chat ? on : off}`} aria-hidden="true" />
    </span>
  );
}

export default async function RateTable() {
  const rows = await fetchProviders();

  // Latest verification date for the subtitle.
  const dates = rows.map((r) => r.last_verified).filter(Boolean) as string[];
  const latestVerified = dates.length
    ? new Date(dates.sort().reverse()[0]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "May 2026";

  return (
    <section
      className="relative bg-gradient-to-b from-background via-background to-accent/30"
      aria-labelledby="rate-table-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 sm:py-16 md:py-20">
        {/* Heading block — single column, no glitchy line-break */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-primary mb-3">
            The list
          </p>
          <h2
            id="rate-table-heading"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1]"
          >
            Real 2026 effective rates.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
            Pulled from public pricing pages. Last verified {latestVerified}.
          </p>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(0,0,0,0.12)]">
          {/* Desktop / tablet table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[2fr_1.4fr_1fr_1.4fr] gap-6 px-6 py-3.5 bg-muted/40 border-b border-border text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
              <div>Provider</div>
              <div>Effective rate</div>
              <div>Funding</div>
              <div className="text-right">Rating</div>
            </div>

            {rows.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                Provider data is loading. Reload in a moment.
              </div>
            ) : (
              rows.map((p, idx) => {
                const rate = parseRate(p.transaction_fees);
                const funding = fmtFunding(p.funding_speed);
                const support = parseSupport(p.customer_support);
                const isTop = p.is_top_pick;
                return (
                  <div
                    key={p.name}
                    className={`relative grid grid-cols-[2fr_1.4fr_1fr_1.4fr] gap-6 px-6 py-5 items-center transition-colors hover:bg-accent/40 ${
                      idx !== rows.length - 1 ? "border-b border-border/70" : ""
                    } ${isTop ? "bg-primary/[0.025]" : ""}`}
                  >
                    {isTop && (
                      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                    )}

                    {/* Provider */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-lg font-semibold text-foreground tracking-tight">
                          {p.name}
                        </span>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            <Sparkles className="h-2.5 w-2.5" />
                            Editorial pick
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <SupportIcons s={support} />
                        <span className="opacity-70">{support.note}</span>
                        {p.source_url && (
                          <a
                            href={p.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            Source <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Effective rate — hero number + caption */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="font-mono text-[15px] sm:text-base font-semibold text-foreground tabular-nums leading-tight">
                        {rate.hero || "—"}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug truncate">
                        {rate.channelTag || ""}
                        {rate.channelTag && rate.caption ? " · " : ""}
                        {rate.caption || ""}
                      </div>
                    </div>

                    {/* Funding chip */}
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${funding.chipTone}`}>
                        {funding.label}
                      </span>
                    </div>

                    {/* Rating + per-row CTA */}
                    <div className="flex items-center justify-end gap-3">
                      <RatingPill rating={p.rating ? Number(p.rating) : null} label={p.rating_label} />
                      <Link
                        href={`/quiz?provider=${encodeURIComponent(p.name.toLowerCase())}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
                        aria-label={`See if ${p.name} fits — start match`}
                      >
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile cards — tight 3-row layout */}
          <div className="md:hidden divide-y divide-border">
            {rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              rows.map((p) => {
                const rate = parseRate(p.transaction_fees);
                const funding = fmtFunding(p.funding_speed);
                const support = parseSupport(p.customer_support);
                const isTop = p.is_top_pick;
                return (
                  <div key={p.name} className={`relative p-5 ${isTop ? "bg-primary/[0.03]" : ""}`}>
                    {isTop && (
                      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                    )}

                    {/* Row 1: name + tag, rating right */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-display text-lg font-semibold text-foreground tracking-tight leading-tight">
                          {p.name}
                        </span>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider w-fit">
                            <Sparkles className="h-2.5 w-2.5" />
                            Editorial pick
                          </span>
                        )}
                      </div>
                      <RatingPill rating={p.rating ? Number(p.rating) : null} label={p.rating_label} />
                    </div>

                    {/* Row 2: hero rate */}
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Effective rate
                      </p>
                      <p className="font-mono text-xl font-semibold text-foreground tabular-nums leading-tight">
                        {rate.hero || "—"}
                      </p>
                      {(rate.channelTag || rate.caption) && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {rate.channelTag}
                          {rate.channelTag && rate.caption ? " · " : ""}
                          {rate.caption}
                        </p>
                      )}
                    </div>

                    {/* Row 3: funding + support + CTA */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${funding.chipTone}`}>
                          {funding.label}
                        </span>
                        <SupportIcons s={support} />
                      </div>
                      <Link
                        href={`/quiz?provider=${encodeURIComponent(p.name.toLowerCase())}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap"
                      >
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
                      >
                        Source <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Headline rates are not effective rates. Your real cost depends on card mix, ticket size, and contract terms.
          </p>
          <Link
            href="/quiz"
            className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1.5 self-start md:self-end whitespace-nowrap"
          >
            Get a personally-vetted shortlist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
