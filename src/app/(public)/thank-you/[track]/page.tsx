import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Calendar, Mail, BookOpen } from "lucide-react";
import { CALENDLY_URL } from "@/lib/funnel/resend-client";

export const metadata: Metadata = {
  title: "You're in. Barak is on it.",
  description: "Your shortlist is on the way. While you wait, you can also book a 15-minute call with Barak Bachar.",
  robots: { index: false, follow: false },
};

const COPY = {
  a: {
    title: "You're in. Barak is on it.",
    sub: "First email lands in minutes. Full shortlist tomorrow morning.",
    body: [
      "While you wait, you can also book a 15-minute call. Barak takes a limited number of merchant calls per week, mostly to walk through pricing or routing setups before you sign with anyone.",
      "If you'd rather just read the comparison guides we've already published, those are linked below.",
    ],
    bookHeadline: "Book a 15-minute call with Barak",
    bookSub: "Bring your latest statement and we'll talk through what your effective rate actually is and what to negotiate.",
    readMoreLinks: [
      { href: "/insights/payment-processor-fees-guide", label: "Real 2026 rates from 14 processors" },
      { href: "/insights/credit-card-processing-fees-explained", label: "Credit card fees, hidden costs, what you actually pay" },
      { href: "/comparisons", label: "Side-by-side processor comparisons" },
    ],
  },
  b: {
    title: "You're in. Barak is on it.",
    sub: "First email lands in minutes. In-person shortlist tomorrow with hardware notes.",
    body: [
      "Most comparison tools are built for online merchants and miss the things that actually matter at the location level. Barak builds your list against real in-person MDR, hardware compatibility, and reconciliation.",
      "You can also grab a 15-minute call below if you want a second set of eyes on a contract before you sign.",
    ],
    bookHeadline: "Book a 15-minute call with Barak",
    bookSub: "We'll walk through your terminal setup, current MDR, and the questions to ask before signing anything.",
    readMoreLinks: [
      { href: "/insights/online-vs-instore-payments", label: "The real cost gap between online and in-store" },
      { href: "/insights/helcim-review-2025", label: "Helcim review: real rates and verdict" },
      { href: "/comparisons", label: "Side-by-side processor comparisons" },
    ],
  },
  c: {
    title: "You're in. Barak is on it.",
    sub: "First email lands in minutes. Shortlist tomorrow with reserve and approval-rate notes.",
    body: [
      "Barak has spent years managing payment operations at the $500M+ annual volume level. He knows which acquirers stay easy to work with six months after you sign, and which ones quietly tighten the screws.",
      "If you want a second look at terms you've already been offered, the call below is the fastest way.",
    ],
    bookHeadline: "Book a 15-minute call with Barak",
    bookSub: "Bring whatever offer or contract you've been quoted. Barak will tell you straight whether it's normal for your category.",
    readMoreLinks: [
      { href: "/insights/payment-processor-fees-guide", label: "Real 2026 processor rates" },
      { href: "/insights/merchant-statement-audit-guide", label: "How to audit your merchant statement" },
      { href: "/insights/merchant-contract-cancellation-guide", label: "How to exit a processor contract cleanly" },
    ],
  },
} as const;

export default async function ThankYouTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!["a", "b", "c"].includes(track)) {
    notFound();
  }
  const copy = COPY[track as "a" | "b" | "c"];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            {copy.title}
          </h1>
          <p className="text-lg text-muted-foreground">{copy.sub}</p>
        </div>

        <section className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
          {copy.body.map((para, i) => (
            <p
              key={i}
              className="text-foreground leading-relaxed mb-4 last:mb-0"
            >
              {para}
            </p>
          ))}
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {copy.bookHeadline}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{copy.bookSub}</p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Book the call
                <Calendar className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-primary/20 pt-4 mt-4">
            Reviewed and run by{" "}
            <Link href="/about/barak" className="underline hover:text-primary">
              Barak Bachar
            </Link>
            , Global Payments Manager. He takes 5 to 8 calls per week.
          </p>
        </section>

        <section className="border border-border rounded-lg p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">While you wait</h2>
          </div>
          <ul className="space-y-3">
            {copy.readMoreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground hover:text-primary underline underline-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2">
            <Mail className="h-3 w-3" />
            Check your inbox in a few minutes for the first email from Barak. If it&apos;s not there, check Promotions or Spam.
          </p>
        </section>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return [{ track: "a" }, { track: "b" }, { track: "c" }];
}
