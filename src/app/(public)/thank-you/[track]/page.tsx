import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "You're in. Barak is on it.",
  description: "Your shortlist is on the way. Barak Bachar reviews it personally and emails you directly.",
  robots: { index: false, follow: true },
};

const COPY = {
  a: {
    title: "You're in. Barak is on it.",
    sub: "First email lands in minutes. Full shortlist tomorrow morning.",
    body: [
      "Barak personally reviews every shortlist before it goes out. He reads your volume, your pain point, and what you're paying now, then builds the list by hand.",
      "If you'd rather just read the comparison guides we've already published, those are linked below.",
    ],
    bookHeadline: "What happens next",
    bookSub: "Barak reviews your details and emails you directly, usually within one business day. Reply with your latest statement and he'll tell you what your effective rate actually is and what to negotiate.",
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
      "If you'd rather just read the guides we've already published, those are linked below.",
    ],
    bookHeadline: "What happens next",
    bookSub: "Barak reviews your terminal setup and current MDR, then emails you directly, usually within one business day, with the questions to ask before signing anything.",
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
      "If you want a second look at terms you've already been offered, mention it when you reply and he'll go through them.",
    ],
    bookHeadline: "What happens next",
    bookSub: "Barak reviews your reserve and approval-rate notes, then emails you directly, usually within one business day. Reply with whatever offer or contract you've been quoted and he'll tell you straight whether it's normal for your category.",
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
            <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {copy.bookHeadline}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{copy.bookSub}</p>
              <a
                href="mailto:barak@mypayadvisor.com?subject=My%20payment%20processor%20shortlist"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Email Barak directly
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground border-t border-primary/20 pt-4 mt-4">
            Reviewed and run by{" "}
            <Link href="/about/barak" className="underline hover:text-primary">
              Barak Bachar
            </Link>
            , Global Payments Manager. He reviews every shortlist personally.
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
