import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { GLOSSARY, type GlossaryTerm } from "@/lib/glossary/terms";

const URL_CANONICAL = "https://www.mypayadvisor.com/glossary";

export const metadata: Metadata = {
  title: "Payment Processing Glossary | myPayAdvisor",
  description:
    "Definitions for every payment processing term: interchange, effective rate, chargeback, PCI DSS, tokenization, AVS, MCC, and more. Independent reference for U.S. merchants.",
  keywords:
    "payment processing glossary, merchant services glossary, interchange definition, effective rate definition, chargeback definition, PCI DSS definition, payment terms",
  alternates: { canonical: URL_CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: URL_CANONICAL,
    title: "Payment Processing Glossary | myPayAdvisor",
    description:
      "Every payment processing term, defined. Interchange, effective rate, chargeback, PCI DSS, tokenization, and more.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Processing Glossary",
    description: "Every payment term, defined. Independent reference for U.S. merchants.",
  },
};

const CATEGORY_LABEL: Record<GlossaryTerm["category"], string> = {
  pricing: "Pricing models",
  infrastructure: "Infrastructure",
  operations: "Operations",
  compliance: "Compliance",
  settlement: "Settlement",
  fees: "Fees",
  fraud: "Fraud & risk",
};

const CATEGORY_ORDER: GlossaryTerm["category"][] = [
  "pricing",
  "infrastructure",
  "fees",
  "settlement",
  "operations",
  "fraud",
  "compliance",
];

function definedTermSetSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${URL_CANONICAL}#termset`,
    name: "myPayAdvisor Payment Processing Glossary",
    description:
      "Definitions of every payment processing term used by U.S. merchants and processors.",
    url: URL_CANONICAL,
    hasDefinedTerm: GLOSSARY.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${URL_CANONICAL}#${t.slug}`,
      name: t.term,
      alternateName: t.alternateNames,
      description: t.definition,
      inDefinedTermSet: { "@id": `${URL_CANONICAL}#termset` },
      url: `${URL_CANONICAL}#${t.slug}`,
    })),
  };
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Glossary", item: URL_CANONICAL },
  ],
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${URL_CANONICAL}#collection`,
  name: "Payment Processing Glossary",
  description: "Every payment processing term, defined.",
  url: URL_CANONICAL,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "[data-speakable='true']"],
  },
};

export default function GlossaryPage() {
  const byCategory = new Map<GlossaryTerm["category"], GlossaryTerm[]>();
  for (const term of GLOSSARY) {
    if (!byCategory.has(term.category)) byCategory.set(term.category, []);
    byCategory.get(term.category)!.push(term);
  }
  for (const [, list] of byCategory) list.sort((a, b) => a.term.localeCompare(b.term));

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={definedTermSetSchema()} />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Glossary</span>
      </nav>

      <header className="mb-10 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Reference</p>
        <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Payment Processing Glossary
        </h1>
        <p
          data-speakable="true"
          className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Every payment processing term U.S. merchants encounter on a merchant statement,
          processor pitch, or compliance form &mdash; defined in plain language.{" "}
          {GLOSSARY.length} terms so far, expanding monthly.
        </p>
      </header>

      <nav aria-label="Categories" className="mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => (
            <a
              key={c}
              href={`#cat-${c}`}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
            >
              {CATEGORY_LABEL[c]} ({byCategory.get(c)?.length})
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-12">
        {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => (
          <section key={c} id={`cat-${c}`}>
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2 mb-6">
              {CATEGORY_LABEL[c]}
            </h2>
            <dl className="space-y-6">
              {byCategory.get(c)?.map((term) => (
                <div key={term.slug} id={term.slug} className="scroll-mt-20">
                  <dt className="text-lg font-semibold text-foreground">
                    <a href={`#${term.slug}`} className="hover:text-primary">
                      {term.term}
                    </a>
                    {term.alternateNames?.length ? (
                      <span className="ml-3 text-sm font-normal text-muted-foreground">
                        ({term.alternateNames.join(", ")})
                      </span>
                    ) : null}
                  </dt>
                  <dd className="mt-1 text-base leading-relaxed text-foreground">
                    {term.definition}
                  </dd>
                  {term.example ? (
                    <p className="mt-2 text-sm italic text-muted-foreground">{term.example}</p>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}
