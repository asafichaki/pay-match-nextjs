import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Firearms Merchant Account: Who Approves Gun & FFL Payment Processing (2026)",
  description: "Can a firearms business get a merchant account, and what does it cost? An operator's guide to firearms and FFL payment processing: who approves guns and ammo, why generalists decline them, reserves, and compliance.",
  keywords: "firearms merchant account, gun merchant account, ffl payment processing, firearms payment processor, high-risk merchant account, second amendment friendly processor",
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/firearms-merchant-account",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/insights/firearms-merchant-account",
    title: "Firearms Merchant Account: Who Approves Gun & FFL Payment Processing (2026)",
    description: "An operator's guide to firearms and FFL payment processing: who approves guns and ammo, why generalists decline them, reserves, and compliance.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firearms Merchant Account & FFL Payment Processing 2026",
    description: "Who approves firearms businesses, what it costs, and the compliance you need.",
  },
};

export default function FirearmsMerchantAccountPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Firearms Merchant Account: Who Approves Gun & FFL Payment Processing (2026)",
    "description": "An operator's guide to firearms merchant accounts and FFL payment processing. Which processors approve firearms, why generalists decline them, what it costs, and the compliance underwriters expect.",
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
      "@id": "https://www.mypayadvisor.com/insights/firearms-merchant-account"
    },
    "keywords": ["firearms merchant account", "gun merchant account", "ffl payment processing", "high-risk merchant account"],
    "articleSection": "High-Risk Payment Processing"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
      { "@type": "ListItem", "position": 3, "name": "Firearms Merchant Account", "item": "https://www.mypayadvisor.com/insights/firearms-merchant-account" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can a firearms business get a merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Selling firearms, ammunition, and accessories is legal for licensed dealers, but generalist processors like Stripe, PayPal, and Square restrict or prohibit firearms in their terms. Licensed dealers get approved through high-risk specialists whose acquiring banks underwrite the category, such as PaymentCloud and Soar Payments, with Durango Merchant Services adding options for harder cases. Approval depends on your federal and state licensing, your compliance, and your documentation rather than on the category alone."
        }
      },
      {
        "@type": "Question",
        "name": "What does firearms payment processing cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Firearms is priced as a high-risk vertical, so effective rates run higher than standard retail and many accounts carry a rolling reserve. Acquiring banks quote rates per merchant on underwriting rather than from a public rate card, so treat any guaranteed-rate claim as an opening position to verify in writing. The factors that move your number are processing volume, chargeback ratio, online versus in-store mix, and how complete your licensing and compliance package is, not the firearms label by itself."
        }
      },
      {
        "@type": "Question",
        "name": "Why won't Stripe, PayPal, or Square process firearms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Stripe, PayPal, and Square restrict or prohibit firearms, ammunition, and certain accessories in their acceptable-use policies, so a firearms account can be approved at signup and later terminated once review flags the category. This is a policy decision by the provider, not a legal judgment on a licensed dealer. The fix is to move to a high-risk specialist whose acquiring banks already underwrite firearms, rather than reopening another generalist account that will be closed again."
        }
      },
      {
        "@type": "Question",
        "name": "What do I need to open a firearms merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Underwriters generally require proof that you are a licensed dealer, including your Federal Firearms License where applicable and any state licensing, along with business formation documents, identification, and recent processing statements if you have them. They also expect your sales process to follow applicable transfer and background-check rules, particularly for online sales that ship to a licensed dealer for pickup. A complete licensing and compliance package up front is what separates a fast approval from weeks of back-and-forth."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Processors That Approve Firearms Merchant Accounts (2026)",
    "itemListOrder": "https://schema.org/ItemListUnordered",
    "numberOfItems": 3,
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
            "category": "Firearms merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk firearms pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "SoftwareApplication",
          "name": "Soar Payments",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://soarpayments.com",
          "offers": {
            "@type": "Offer",
            "category": "Firearms merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk firearms and tactical pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "SoftwareApplication",
          "name": "Durango Merchant Services",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "url": "https://www.durangomerchantservices.com",
          "offers": {
            "@type": "Offer",
            "category": "Firearms merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "Domestic and offshore firearms acquiring; rate quoted per merchant and acquirer"
            }
          }
        }
      }
    ]
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/firearms-merchant-account#webpage",
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
                Firearms Merchant Account: Who Approves Gun and FFL Payment Processing
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Selling firearms is legal for licensed dealers, but generalist processors decline it. Here is who approves firearms and ammo, what it costs, and the licensing underwriters expect to see.
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
                  <p className="text-sm text-muted-foreground">Covers high-risk merchant services, reserve negotiation, and onboarding restricted-but-legal verticals including licensed firearms dealers.</p>
                </div>
              </div>
            </header>

            {/* AEO lead-answer block: direct answer for AI Overviews / LLM extraction. */}
            <section className="aeo-answer mb-12 p-6 bg-primary/5 rounded-lg border-l-4 border-primary" data-speakable>
              <p className="text-lg text-foreground leading-relaxed">
                Yes, a licensed firearms business can get a merchant account, but not through Stripe, PayPal, or Square, which restrict firearms. You apply through high-risk specialists whose acquiring banks underwrite guns and ammunition, such as PaymentCloud and Soar Payments. Expect higher effective rates and often a rolling reserve, with rates quoted per merchant on underwriting rather than from a public rate card.
              </p>
            </section>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                Firearms is a restricted-but-legal category. A licensed dealer is running a lawful business, yet generalist processors classify the whole vertical as elevated-risk and decline it. The result is the same pattern CBD and nutra merchants see: an account approved at signup, then terminated once a review flags the category. For a firearms dealer the fix is a specialist account underwritten for the category from the start.
              </p>

              <p className="text-foreground leading-relaxed">
                This guide is part of our coverage of <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk merchant accounts</Link>. It covers why generalists decline firearms, who underwrites guns and ammunition, what approval costs, and the licensing and compliance underwriters expect. Reviewed by Barak Bachar, a working payments operator who has onboarded restricted-but-legal verticals.
              </p>

              {/* Section 1 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Firearms classification: legal, but high-risk to acquirers
              </h2>

              <p className="text-foreground leading-relaxed">
                Card networks and acquiring banks treat firearms as high-risk for reasons of regulatory complexity and reputational exposure rather than transaction loss alone. Sales are governed by federal and state rules, online sales involve transfer and background-check requirements, and the category draws elevated scrutiny. Generalist processors manage all of that the simplest way available to them, by restricting or prohibiting firearms in their acceptable-use policies.
              </p>

              <p className="text-foreground leading-relaxed">
                In practice, <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a>, <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal</a>, and <a href="https://squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square</a> are not the venue for a firearms dealer. You need an acquiring bank that has decided in advance to underwrite the category and understands FFL workflows.
              </p>

              {/* Section 2 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Processors that approve firearms (and how they underwrite)
              </h2>

              <p className="text-foreground leading-relaxed">
                The providers below are current, real U.S. high-risk specialists that publicly state firearms or broad high-risk acceptance. Positioning reflects each provider&rsquo;s stated focus and onboarding model. Rates are quoted per merchant on underwriting, so we do not publish fixed numbers; treat any guaranteed-rate claim as a starting position to verify in writing.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Processor</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Firearms fit</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Acquiring model</th>
                      <th className="text-left py-3 font-semibold text-foreground">Notable</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://paymentcloudinc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a></td>
                      <td className="py-3 pr-4">Firearms, ammunition, accessories, retail and online</td>
                      <td className="py-3 pr-4">U.S. acquirers, dedicated account rep</td>
                      <td className="py-3">Broad domestic high-risk acceptance</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://soarpayments.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Soar Payments</a></td>
                      <td className="py-3 pr-4">Firearms, tactical, accessories</td>
                      <td className="py-3 pr-4">U.S. acquirers</td>
                      <td className="py-3">Onboarding focus for declined domestic merchants</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.durangomerchantservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a></td>
                      <td className="py-3 pr-4">Firearms where domestic banks decline</td>
                      <td className="py-3 pr-4">Domestic and offshore acquiring</td>
                      <td className="py-3">Options for harder cases or higher volume</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Licensing is the document set that decides it
              </h2>

              <p className="text-foreground leading-relaxed">
                For firearms, the paperwork that moves an application is proof that you are a licensed dealer. That means your Federal Firearms License where applicable and any state licensing, alongside the standard package of business formation documents, identification, and recent processing statements if you have them. Underwriters also want comfort that your sales process follows applicable transfer and background-check rules, which matters most for online sales that ship to a licensed dealer for pickup rather than direct to a buyer.
              </p>

              <p className="text-foreground leading-relaxed">
                As with every high-risk vertical, the merchants who get approved quickly are the ones who send a complete, compliant package up front. Incomplete licensing is the most common reason a firearms application stalls.
              </p>

              {/* Section 4 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Reserves and rates: what firearms pricing turns on
              </h2>

              <p className="text-foreground leading-relaxed">
                Firearms accounts are priced as high-risk, so plan for a higher effective rate than standard retail and, in many cases, a rolling reserve. The reserve is usually the lever that matters most to cash flow, and it is negotiable once you have a clean processing history. For how reserves work and how to bring one down in writing, see our explainer on <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">capped vs rolling reserves and frozen funds</Link>.
              </p>

              <p className="text-foreground leading-relaxed">
                If you also sell adjacent regulated products, the same underwriting logic applies. See our guides to <Link href="/insights/merchant-account-for-cbd" className="text-primary hover:underline">CBD merchant accounts</Link> and <Link href="/insights/nutra-supplement-merchant-account" className="text-primary hover:underline">nutra and supplement merchant accounts</Link> for the document sets and processor fit in those categories.
              </p>

              {/* FAQ Section */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Can a firearms business get a merchant account?</h3>
                  <p className="text-foreground">Yes. Selling firearms, ammunition, and accessories is legal for licensed dealers, but Stripe, PayPal, and Square restrict or prohibit firearms. Licensed dealers get approved through high-risk specialists whose acquiring banks underwrite the category, such as PaymentCloud and Soar Payments, with Durango adding options for harder cases. Approval depends on your federal and state licensing, your compliance, and your documentation rather than the category alone.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What does firearms payment processing cost?</h3>
                  <p className="text-foreground">Firearms is priced as a high-risk vertical, so effective rates run higher than standard retail and many accounts carry a rolling reserve. Acquiring banks quote rates per merchant on underwriting rather than from a public rate card, so treat any guaranteed-rate claim as an opening position. The factors that move your number are volume, chargeback ratio, online versus in-store mix, and how complete your licensing package is.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why won&rsquo;t Stripe, PayPal, or Square process firearms?</h3>
                  <p className="text-foreground">Stripe, PayPal, and Square restrict or prohibit firearms, ammunition, and certain accessories in their acceptable-use policies, so an account can be approved at signup and later terminated once review flags the category. This is a policy decision by the provider, not a legal judgment on a licensed dealer. The fix is to move to a high-risk specialist whose acquiring banks already underwrite firearms.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What do I need to open a firearms merchant account?</h3>
                  <p className="text-foreground">Underwriters generally require proof that you are a licensed dealer, including your Federal Firearms License where applicable and any state licensing, along with business formation documents, identification, and recent processing statements if you have them. They also expect your sales process to follow applicable transfer and background-check rules, particularly for online sales that ship to a licensed dealer for pickup. A complete package up front separates a fast approval from weeks of back-and-forth.</p>
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
                  <Link href="/insights/merchant-account-for-cbd" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">CBD Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">Who approves CBD and the Certificate of Analysis requirement</p>
                  </Link>
                  <Link href="/insights/nutra-supplement-merchant-account" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Nutra &amp; Supplement Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">Who underwrites supplements and what the FTC angle means</p>
                  </Link>
                </div>
              </div>

              {/* CTA into the Sorting Hat */}
              <div className="mt-12 p-8 bg-primary/10 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Need a Processor That Approves Firearms?</h3>
                <p className="text-muted-foreground mb-6">Take our free 2-minute assessment and get matched with high-risk processors that underwrite licensed firearms dealers.</p>
                <Link href="/quiz" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Start Free Assessment →
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
