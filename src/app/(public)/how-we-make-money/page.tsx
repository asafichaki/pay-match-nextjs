import type { Metadata } from "next";
import Link from "next/link";
import { DISCLOSURE_TEXT } from "@/components/AffiliateLink";
import { RATES_CHECKED } from "@/lib/data/ranking-2026";

export const metadata: Metadata = {
  title: { absolute: "How myPayAdvisor Makes Money | Disclosure" },
  description:
    "Who pays us, for what, and how we keep it out of the rankings. The scoring method, the providers we have agreements with, and how a referral to Barak works.",
  alternates: { canonical: "https://www.mypayadvisor.com/how-we-make-money" },
  robots: { index: true, follow: true },
};

// The agreements list is read from the partners table, so this page stays true
// the day a program is signed or paused without anyone editing it.
export const revalidate = 3600;

type Row = { name: string; network: string | null; program_status: string };

async function activeAgreements(): Promise<Row[] | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(
      `${base}/rest/v1/partners?select=name,network,program_status&program_status=eq.active&is_active=eq.true&order=name`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Row[];
  } catch {
    return null;
  }
}

export default async function HowWeMakeMoneyPage() {
  const agreements = await activeAgreements();
  return (
    <main className="min-h-screen bg-background">
      <article className="container mx-auto max-w-3xl px-4 pt-16 pb-20">
        <p className="text-sm font-medium text-primary mb-3">Disclosure</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How we make money</h1>
        <p className="text-lg text-muted-foreground mb-8">{DISCLOSURE_TEXT}</p>

        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold text-foreground">Who pays us, and for what</h2>
          <p className="text-muted-foreground">
            Some payment providers run partner programs. When a business opens an account through one of our links and the provider confirms it, the provider may pay us a one-time fee. What counts as confirmed is set by each provider: an activated account, a first payment, or an approved merchant account.
          </p>
          <p className="text-muted-foreground">
            You pay the same price as anyone who goes to the provider directly. A link that carries a commission is marked <code>rel=&quot;sponsored&quot;</code> and goes through <code>mypayadvisor.com/go/</code> so we can count clicks per page.
          </p>
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="font-semibold text-foreground mb-1">Agreements in place today</p>
            {agreements === null ? (
              <p className="text-sm text-muted-foreground">The live list is unavailable right now. Email info@mypayadvisor.com and we will send it.</p>
            ) : agreements.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet. Every Visit button on the site currently goes straight to the provider&apos;s own page, and we earn nothing from it.</p>
            ) : (
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                {agreements.map((a) => (
                  <li key={a.name}>{a.name}{a.network ? ` (through ${a.network})` : ""}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold text-foreground">How rankings are made</h2>
          <p className="text-muted-foreground">
            Rankings come from one published rule. Each provider&apos;s published prices are turned into an effective rate (percentage, plus the fixed fee on a $50 sale, plus any monthly fee spread over your volume) at four monthly volumes ($10K, $50K, $250K, $1M). Interchange-plus providers get the same stated estimate of card-network cost. The score is the cheaper of the provider&apos;s in-person and online rate. Lower is better. Prices were last checked {RATES_CHECKED}; the full method is on the <a href="/comparisons/best-payment-processors-2026#method" className="text-primary hover:underline">ranking page</a>.
          </p>
          <p className="text-muted-foreground">
            Whether a provider pays us is not an input. A provider that pays nothing keeps its place and still gets a Visit button. A provider that does not publish pricing we can compute is left out of the ranked list instead of being given a score. If we ever sell a placement for a flat fee, that slot will say &quot;Sponsored&quot; on the slot itself.
          </p>
          <p className="text-muted-foreground">
            The data and sources are open: <Link href="/data/effective-rates-2026" className="text-primary hover:underline">effective rates 2026</Link>. The live ranking: <Link href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline">best payment processors 2026</Link>.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold text-foreground">The quiz and Barak</h2>
          <p className="text-muted-foreground">
            The quiz gives you an instant match by email. If you leave a phone number, Barak Bachar, a payments manager who reviews our method, may call you about your case. He explains how pricing works and can read your current statement with you. He does not quote or negotiate another provider&apos;s rates on its behalf.
          </p>
          <p className="text-muted-foreground">
            We never sell your details. We pass them to a provider only if you ask us to introduce you to that provider, and if that provider pays us for the introduction we tell you before we make it. Details are in the <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Corrections</h2>
          <p className="text-muted-foreground">
            If a rate or a fee on the site is wrong, email <a href="mailto:info@mypayadvisor.com" className="text-primary hover:underline">info@mypayadvisor.com</a> with the provider&apos;s source. We fix it and note the change on the page.
          </p>
        </section>
      </article>
    </main>
  );
}
