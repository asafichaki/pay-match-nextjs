import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const baseMetadata: Metadata = {
  title: "CBD Merchant Account: Who Approves CBD Payment Processing in 2026",
  description: "Can a CBD business get a merchant account, and what does it cost? An operator's guide to CBD payment processing: who approves CBD, the Certificate of Analysis requirement, reserves, and the processors that underwrite hemp and CBD.",
  keywords: "cbd merchant account, cbd payment processing, cbd payment processor, hemp merchant account, high-risk merchant account, certificate of analysis",
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/merchant-account-for-cbd",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/insights/merchant-account-for-cbd",
    title: "CBD Merchant Account: Who Approves CBD Payment Processing in 2026",
    description: "An operator's guide to CBD payment processing: who approves CBD, the Certificate of Analysis requirement, reserves, and the processors that underwrite hemp and CBD.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CBD Merchant Account & Payment Processing 2026",
    description: "Who approves CBD businesses, what it costs, and the compliance documents you need.",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("insights", "merchant-account-for-cbd", baseMetadata);
}

export default function CbdMerchantAccountPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "CBD Merchant Account: Who Approves CBD Payment Processing (2026)",
    "description": "An operator's guide to CBD merchant accounts and CBD payment processing. Which processors approve CBD, what it costs, the Certificate of Analysis requirement, and how reserves work for hemp and CBD merchants.",
    "image": "https://www.mypayadvisor.com/og-logo.png",
    "author": {
      "@type": "Organization",
      "@id": "https://www.mypayadvisor.com/#organization",
      "name": "myPayAdvisor"
    },
    "reviewedBy": {
      "@type": "Person",
      "@id": "https://www.mypayadvisor.com/about/barak#person",
      "name": "Barak Bachar",
      "jobTitle": "Global Payments Manager",
      "url": "https://www.mypayadvisor.com/about/barak",
      "sameAs": ["https://www.linkedin.com/in/barak-bachar/"]
    },
    "publisher": {
      "@type": "Organization",
      "name": "myPayAdvisor",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.mypayadvisor.com/og-logo.png"
      }
    },
    "datePublished": "2026-05-30",
    "dateModified": "2026-05-30",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.mypayadvisor.com/insights/merchant-account-for-cbd"
    },
    "keywords": ["cbd merchant account", "cbd payment processing", "hemp merchant account", "high-risk merchant account", "certificate of analysis"],
    "articleSection": "High-Risk Payment Processing"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
      { "@type": "ListItem", "position": 3, "name": "CBD Merchant Account", "item": "https://www.mypayadvisor.com/insights/merchant-account-for-cbd" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can a CBD business get a merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. CBD and hemp businesses cannot use generalist processors like Stripe, PayPal, or Square, which prohibit CBD in their terms, but they can be approved through high-risk specialists whose acquiring banks underwrite hemp-derived CBD. PaymentCloud, Easy Pay Direct, and Soar Payments publicly state CBD acceptance, and Durango Merchant Services adds offshore options for cases domestic banks decline. Approval depends on your product compliance, your chargeback history, and complete documentation rather than on the category alone."
        }
      },
      {
        "@type": "Question",
        "name": "What does CBD payment processing cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CBD is priced as a high-risk vertical, so effective rates run higher than standard retail and most CBD accounts carry a rolling reserve. Acquiring banks quote rates per merchant on underwriting rather than from a public rate card, so treat any guaranteed-rate claim as an opening position to verify in writing. The variables that move your number are processing volume, chargeback ratio, product mix, and how well your compliance documentation is prepared, not the CBD label by itself."
        }
      },
      {
        "@type": "Question",
        "name": "What documents do I need to open a CBD merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Underwriters generally require business formation documents, a government ID, recent processing statements if you have them, and product-compliance evidence specific to CBD. The compliance document that matters most is a Certificate of Analysis from an accredited lab for the products you sell, showing cannabinoid content and confirming THC within the legal threshold. Many banks also ask for your product labels, your supplier or lab relationship, and a compliant website with required disclaimers before they approve the account."
        }
      },
      {
        "@type": "Question",
        "name": "Why did Stripe or PayPal close my CBD account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Stripe, PayPal, and Square exclude CBD and many hemp products in their acceptable-use policies, so an account can be approved automatically at signup and then terminated once their review flags the CBD category. This is a policy decision, not a judgment on your business. The fix is to move to a high-risk specialist whose acquiring banks already underwrite CBD, rather than reopening another generalist account that will be closed again. Stand up the specialist account first, then migrate volume so revenue keeps moving."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Processors That Approve CBD Merchant Accounts (2026)",
    "itemListOrder": "https://schema.org/ItemListUnordered",
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": "PaymentCloud",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://paymentcloudinc.com",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk CBD pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "SoftwareApplication",
          "name": "Easy Pay Direct",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://easypaydirect.com",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk pricing with multi-bank load balancing; rate quoted per merchant"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "SoftwareApplication",
          "name": "Soar Payments",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://soarpayments.com",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk CBD pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "SoftwareApplication",
          "name": "Durango Merchant Services",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://www.durangomerchantservices.com",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "Domestic and offshore CBD acquiring; rate quoted per merchant and acquirer"
            }
          }
        }
      }
    ]
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/merchant-account-for-cbd#webpage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".aeo-answer"]
    }
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={speakableSchema} />
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex gap-12 justify-center">
          <article className="max-w-3xl flex-1 min-w-0">
            {/* Header */}
            <header className="mb-12 border-b border-border pb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-primary">High-Risk Processing</span>
                <span>•</span>
                <span>Updated May 2026</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                CBD Merchant Account: Who Approves CBD Payment Processing in 2026
              </h1>
              <AeoAnswer kind="insights" slug="merchant-account-for-cbd" />

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Generalist processors ban CBD. High-risk specialists underwrite it. Here is who approves CBD and hemp, what it costs, and the one compliance document that decides most applications.
              </p>

              {/* Reviewed-by byline: real expert only (no fabricated credentials per locked portfolio policy). */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- static monogram SVG */}
                <img
                  src="/images/barak-monogram.svg"
                  alt="Barak Bachar, Global Payments Manager at myPayAdvisor"
                  className="w-12 h-12 rounded-full object-cover border border-border bg-card"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    Reviewed by{" "}
                    <a href="/about/barak" className="underline hover:text-primary">Barak Bachar</a>, Global Payments Manager
                  </p>
                  <p className="text-sm text-muted-foreground">Covers high-risk merchant services, reserve negotiation, and onboarding regulated-but-legal verticals including CBD and hemp.</p>
                </div>
              </div>
            </header>

            {/* AEO lead-answer block: direct answer for AI Overviews / LLM extraction. */}
            <section className="aeo-answer mb-12 p-6 bg-primary/5 rounded-lg border-l-4 border-primary" data-speakable>
              <p className="text-lg text-foreground leading-relaxed">
                Yes, a CBD business can get a merchant account, but not through Stripe, PayPal, or Square, which prohibit CBD. You apply through high-risk specialists whose acquiring banks underwrite hemp-derived CBD, such as PaymentCloud, Easy Pay Direct, and Soar Payments. Expect higher effective rates and a rolling reserve, with rates quoted per merchant on underwriting rather than from a public rate card.
              </p>
            </section>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                CBD sits in the &ldquo;regulated but legal&rdquo; band that card networks treat as high-risk. The product is lawful at the federal level when it is hemp-derived and within the legal THC threshold, yet generalist processors exclude it in their acceptable-use policies. That gap is why CBD merchants get approved automatically at signup and then terminated weeks later, and why the right move is a specialist account from day one rather than a generalist account that will be closed again.
              </p>

              <p className="text-foreground leading-relaxed">
                This guide is part of our coverage of <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk merchant accounts</Link>. It covers why CBD is classified the way it is, who underwrites it, what approval actually costs, and the compliance documents that decide most applications. Reviewed by Barak Bachar, a working payments operator who has onboarded regulated-but-legal verticals.
              </p>

              {/* Section 1 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                CBD classification: why generalists decline it
              </h2>

              <p className="text-foreground leading-relaxed">
                CBD is a high-risk category for two reasons that have nothing to do with whether your specific business is legitimate. First, the regulatory picture varies by state and changes over time, which acquiring banks price as uncertainty. Second, CBD has historically carried elevated chargeback and return activity, which raises loss exposure for the bank. Generalist processors handle that uncertainty the simplest way available to them, by prohibiting the category outright in their terms.
              </p>

              <p className="text-foreground leading-relaxed">
                The practical consequence: <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a>, <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal</a>, and <a href="https://squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square</a> all exclude CBD. An account that processes for a few weeks before a freeze is not a glitch; it is the policy catching up with the signup. You need an acquiring bank that has decided, in advance, to underwrite CBD.
              </p>

              {/* Section 2 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Processors that approve CBD (and what they underwrite)
              </h2>

              <p className="text-foreground leading-relaxed">
                The providers below are current, real U.S. high-risk specialists that publicly state CBD or broad high-risk acceptance. Positioning reflects each provider&rsquo;s stated focus and onboarding model. Rates are quoted per merchant on underwriting, so we do not publish fixed numbers; treat any guaranteed-rate claim as a starting position to verify in writing.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Processor</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">CBD fit</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Acquiring model</th>
                      <th className="text-left py-3 font-semibold text-foreground">Notable</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://paymentcloudinc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a></td>
                      <td className="py-3 pr-4">CBD, hemp, e-commerce and retail</td>
                      <td className="py-3 pr-4">U.S. acquirers, dedicated account rep</td>
                      <td className="py-3">Broad domestic high-risk acceptance</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://easypaydirect.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Easy Pay Direct</a></td>
                      <td className="py-3 pr-4">CBD, supplements, subscription</td>
                      <td className="py-3 pr-4">Multi-bank load balancing across MIDs</td>
                      <td className="py-3">Routes volume across acquirers for continuity</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://soarpayments.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Soar Payments</a></td>
                      <td className="py-3 pr-4">CBD, nutra, subscription</td>
                      <td className="py-3 pr-4">U.S. acquirers</td>
                      <td className="py-3">Onboarding focus for declined domestic merchants</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.durangomerchantservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a></td>
                      <td className="py-3 pr-4">CBD where domestic banks decline</td>
                      <td className="py-3 pr-4">Domestic and offshore acquiring</td>
                      <td className="py-3">Offshore options for harder cases or higher volume</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The Certificate of Analysis is the document that decides it
              </h2>

              <p className="text-foreground leading-relaxed">
                For CBD, the single piece of paperwork that moves an application is the Certificate of Analysis. A Certificate of Analysis is a lab report from an accredited testing facility that states the cannabinoid content of your product and confirms the THC level sits within the legal threshold. Underwriters use it to confirm the product they are about to process for is the compliant product you describe, not a higher-THC item that would breach card-network and legal rules.
              </p>

              <p className="text-foreground leading-relaxed">
                Beyond the Certificate of Analysis, expect to provide business formation documents, identification, prior processing statements if you have them, product labels, and a website that carries the required disclaimers. The merchants who get approved quickly are the ones who send a complete, compliant package up front rather than answering underwriting questions one at a time over several weeks.
              </p>

              {/* Section 4 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Reserves and rates: what CBD pricing really turns on
              </h2>

              <p className="text-foreground leading-relaxed">
                CBD accounts are priced as high-risk, so plan for a higher effective rate than standard retail and, in most cases, a rolling reserve. The reserve, not the headline rate, is usually the lever that matters most to your cash flow, and it is negotiable once you have a clean processing history. For how reserves work and how to bring one down in writing, see our explainer on <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">capped vs rolling reserves and frozen funds</Link>.
              </p>

              <p className="text-foreground leading-relaxed">
                If your business spans more than one regulated vertical, the same underwriting logic applies elsewhere. See our guides to <Link href="/insights/nutra-supplement-merchant-account" className="text-primary hover:underline">nutra and supplement merchant accounts</Link> and <Link href="/insights/firearms-merchant-account" className="text-primary hover:underline">firearms merchant accounts</Link> for the document sets and processor fit in those categories.
              </p>

              {/* FAQ Section */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Can a CBD business get a merchant account?</h3>
                  <p className="text-foreground">Yes. CBD and hemp businesses cannot use Stripe, PayPal, or Square, which prohibit CBD, but they can be approved through high-risk specialists whose acquiring banks underwrite hemp-derived CBD. PaymentCloud, Easy Pay Direct, and Soar Payments publicly state CBD acceptance, and Durango adds offshore options for cases domestic banks decline. Approval depends on product compliance, chargeback history, and documentation rather than the category alone.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What does CBD payment processing cost?</h3>
                  <p className="text-foreground">CBD is priced as a high-risk vertical, so effective rates run higher than standard retail and most accounts carry a rolling reserve. Acquiring banks quote rates per merchant on underwriting rather than from a public rate card, so treat any guaranteed-rate claim as an opening position. The variables that move your number are volume, chargeback ratio, product mix, and how well your compliance documentation is prepared.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What documents do I need to open a CBD merchant account?</h3>
                  <p className="text-foreground">Underwriters generally require business formation documents, a government ID, recent processing statements if you have them, and product-compliance evidence. The document that matters most is a Certificate of Analysis from an accredited lab, showing cannabinoid content and confirming THC within the legal threshold. Many banks also ask for product labels, your lab relationship, and a compliant website with the required disclaimers.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why did Stripe or PayPal close my CBD account?</h3>
                  <p className="text-foreground">Stripe, PayPal, and Square exclude CBD and many hemp products in their acceptable-use policies, so an account can be approved at signup and then terminated once review flags the category. This is a policy decision, not a judgment on your business. The fix is to move to a high-risk specialist whose acquiring banks already underwrite CBD. Stand up the specialist account first, then migrate volume so revenue keeps moving.</p>
                </div>
              </div>

              {/* Related */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">Related Guides</h3>
                <div className="grid gap-4">
                  <Link href="/insights/high-risk-payment-processing-guide" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">High-Risk Merchant Accounts: The Operator&rsquo;s Guide</h4>
                    <p className="text-sm text-muted-foreground mt-1">Classification, reserves, VAMP, and who actually approves</p>
                  </Link>
                  <Link href="/insights/nutra-supplement-merchant-account" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Nutra &amp; Supplement Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">Who underwrites supplements and what the FTC angle means</p>
                  </Link>
                  <Link href="/insights/firearms-merchant-account" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Firearms Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">FFL processing, who approves firearms, and compliance</p>
                  </Link>
                </div>
              </div>

              {/* CTA into the Sorting Hat */}
              <div className="mt-12 p-8 bg-primary/10 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Need a Processor That Approves CBD?</h3>
                <p className="text-muted-foreground mb-6">Take our free 2-minute assessment and get matched with high-risk processors that underwrite CBD and hemp.</p>
                <Link href="/quiz" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Start Free Assessment →
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    <RelatedLinks kind="insights" slug="merchant-account-for-cbd" />
    </>
  );
}
