import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Pick {
  href: string;
  eyebrow: string;
  title: string;
  excerpt: string;
}

const PICKS: Pick[] = [
  {
    href: "/insights/payment-processor-negotiation-playbook",
    eyebrow: "Negotiation",
    title: "9 levers that actually move your processing rate",
    excerpt:
      "The processor markup is negotiable. Above $50K monthly, a 0.10–0.30 percent reduction is realistic with the right contract terms.",
  },
  {
    href: "/insights/free-statement-audit-playbook",
    eyebrow: "Statement audit",
    title: "How to audit your merchant statement in 6 steps",
    excerpt:
      "The four hidden fees most merchants miss can add 0.20–0.50 percent on top of the rate you think you are paying.",
  },
  {
    href: "/insights/reserves-frozen-funds-capped-vs-rolling",
    eyebrow: "Reserves",
    title: "Capped vs. rolling reserves — and why it is a cashflow question",
    excerpt:
      "A 10% rolling reserve on $500K monthly volume ties up $300K in working capital. That is a margin decision dressed as risk.",
  },
];

export default function EditorialPicks() {
  return (
    <section className="bg-muted/30 border-y border-border" aria-labelledby="editorial-picks-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20">
        <div className="mb-6 sm:mb-8 text-center md:text-left">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-primary mb-2">
            Editorial · Independent review
          </p>
          <h2
            id="editorial-picks-heading"
            className="font-display text-3xl md:text-4xl font-bold text-foreground"
          >
            Three guides every merchant should read first
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PICKS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group block bg-background border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <p className="text-xs uppercase tracking-wider font-medium text-primary mb-3">
                {p.eyebrow}
              </p>
              <h3 className="font-serif text-xl md:text-[1.4rem] font-semibold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {p.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Read the guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
