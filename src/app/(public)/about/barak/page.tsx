import type { Metadata } from "next";
import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import {
  BARAK_NAME,
  BARAK_TITLE,
  BARAK_LINKEDIN,
  BARAK_BIO_SHORT,
  BARAK_AREAS,
  BARAK_PERSON_SCHEMA,
} from "@/data/personas/barak";

export const metadata: Metadata = {
  title: `${BARAK_NAME} — ${BARAK_TITLE}`,
  description: `${BARAK_NAME}, ${BARAK_TITLE}, reviews payment-processing content on myPayAdvisor. Hands-on payments operator with experience at the $500M+ annual volume level.`,
  alternates: { canonical: "https://www.mypayadvisor.com/about/barak" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "profile",
    url: "https://www.mypayadvisor.com/about/barak",
    title: `${BARAK_NAME} — ${BARAK_TITLE}`,
    description: BARAK_BIO_SHORT,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  ...BARAK_PERSON_SCHEMA,
  worksFor: {
    "@type": "Organization",
    name: "myPayAdvisor",
    url: "https://www.mypayadvisor.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://www.mypayadvisor.com/about/barak" },
    { "@type": "ListItem", position: 3, name: BARAK_NAME, item: "https://www.mypayadvisor.com/about/barak" },
  ],
};

export default function AboutBarakPage() {
  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
          <article>
            <header className="border-b border-border pb-8 mb-8">
              <p className="text-sm font-medium text-primary mb-3">Reviewer · myPayAdvisor</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-4">
                {BARAK_NAME}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">{BARAK_TITLE}</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={BARAK_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a
                  href="mailto:info@mypayadvisor.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Reach out
                </a>
              </div>
            </header>

            <section className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">About</h2>
              <p className="text-foreground leading-relaxed">{BARAK_BIO_SHORT}</p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-10 mb-4">Areas of focus</h2>
              <ul className="space-y-2">
                {BARAK_AREAS.map((area) => (
                  <li key={area} className="text-foreground leading-relaxed">
                    {area}
                  </li>
                ))}
              </ul>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-10 mb-4">Editorial role</h2>
              <p className="text-foreground leading-relaxed">
                {BARAK_NAME} reviews cornerstone content on myPayAdvisor for technical accuracy.
                That includes processor reviews, comparison tables, fee benchmarks, and
                operational guides for merchants negotiating with payment processors. When you
                see &quot;Reviewed by {BARAK_NAME}&quot; on an article, the rates, definitions, and
                negotiation guidance have been validated against current operator practice.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-10 mb-4">
                Talk to {BARAK_NAME.split(" ")[0]}
              </h2>
              <p className="text-foreground leading-relaxed">
                Merchants who want a second set of eyes on a contract, a statement audit, or a
                rate negotiation can request a call through the{" "}
                <Link href="/quiz" className="text-primary underline">
                  intake quiz
                </Link>
                . He takes a limited number of merchant calls per week.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
