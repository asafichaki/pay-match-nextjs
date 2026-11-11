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
    "dateModified": "2026-11-11",
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
          "text": "Yes. Square lists CBD products as unsupported, and Stripe treats low-THC CBD as a restricted category that needs extra due diligence, so most CBD and hemp businesses apply through high-risk specialists instead. PaymentCloud and Easy Pay Direct publish dedicated CBD merchant account programs. Durango Merchant Services lists CBD and hemp among its high-risk industries for U.S. accounts. Soar Payments offers CBD eCheck processing only, not card processing. Approval depends on your product compliance, your chargeback history, and complete documentation rather than on the category alone."
        }
      },
      {
        "@type": "Question",
        "name": "What does CBD payment processing cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CBD is priced as a high-risk vertical, and the specialists named here do not publish CBD rate cards, so pricing is quote-only and set per merchant on underwriting. Some accounts also carry a reserve. Treat any guaranteed-rate claim as an opening position to verify in writing. The variables that move your number are processing volume, chargeback ratio, product mix, and how well your compliance documentation is prepared, not the CBD label by itself."
        }
      },
      {
        "@type": "Question",
        "name": "What documents do I need to open a CBD merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Underwriters generally require business formation documents, a government ID, recent processing statements if you have them, and product-compliance evidence specific to CBD. The compliance document that matters most is a Certificate of Analysis from an accredited lab for the products you sell, showing cannabinoid content and confirming THC within the legal threshold. Durango, for example, says its CBD accounts need a Certificate of Analysis under 12 months old. Many banks also ask for your product labels, your supplier or lab relationship, and a compliant website with required disclaimers before they approve the account."
        }
      },
      {
        "@type": "Question",
        "name": "Why did Stripe or Square close my CBD account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each platform writes its own rules. Square's Payment Terms list products containing CBD, THC, or other cannabinoids as unsupported. Stripe lists CBD with only negligible THC as a restricted category that requires additional due diligence, and prohibits CBD above the local THC limit, including CBD edibles. PayPal's US Acceptable Use Policy does not name CBD, so confirm with PayPal before you rely on it. An account opened without that review can be closed once the processor sees what you sell. This is a policy decision, not a judgment on your business. The fix is a specialist account underwritten for CBD. Stand up the specialist account first, then migrate volume so revenue keeps moving."
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
          "url": "https://paymentcloudinc.com/industries/cbd-hemp/",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "Quote-only; no published CBD rates"
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
          "url": "https://www.easypaydirect.com/merchant-accounts/cbd-merchant-accounts/",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "Quote-only; transaction routing across multiple merchant accounts"
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
          "url": "https://www.soarpay.com/industry/cbd/",
          "offers": {
            "@type": "Offer",
            "category": "CBD eCheck processing",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "CBD eCheck (ACH) processing only; quote-only"
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
          "url": "https://www.durangomerchantservices.com/high-risk-merchant-account/",
          "offers": {
            "@type": "Offer",
            "category": "CBD merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "Quote-only; CBD and hemp accounts are U.S.-only per its site"
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
                <span>Updated November 2026</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                CBD Merchant Account: Who Approves CBD Payment Processing in 2026
              </h1>
              <AeoAnswer kind="insights" slug="merchant-account-for-cbd" />

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Big generalist processors ban or restrict CBD. High-risk specialists underwrite it. Here is who publishes CBD programs, how pricing works, and the compliance document underwriters ask for first.
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
                Yes, a CBD business can get a merchant account. Square lists CBD as unsupported and Stripe treats low-THC CBD as a restricted category, so most CBD sellers apply through high-risk specialists that publish CBD programs, such as PaymentCloud and Easy Pay Direct. Pricing is quote-only, set per merchant on underwriting, and a reserve is possible.
              </p>
            </section>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                CBD sits in the &ldquo;regulated but legal&rdquo; band that acquiring banks treat as high-risk, and the rules keep moving. Congress rewrote the federal definition of hemp in Public Law 119-37, enacted November 12, 2025; per the <a href="https://www.everycrsreport.com/reports/IF13136.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Congressional Research Service</a>, most of the new definition takes effect December 11, 2026, and it excludes finished hemp-derived cannabinoid products with more than 0.4 milligrams of total THC per container. State rules vary on top of that. This is general information, not legal advice; check your products with counsel. Generalist processors handle that uncertainty by excluding or restricting CBD, which is why the right move is a specialist account from day one rather than a generalist account that may be closed later.
              </p>

              <p className="text-foreground leading-relaxed">
                This guide is part of our coverage of <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk merchant accounts</Link>. It covers why CBD is classified the way it is, who underwrites it, what approval actually costs, and the compliance documents that decide most applications.
              </p>

              {/* Section 1 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                CBD classification: why generalists decline it
              </h2>

              <p className="text-foreground leading-relaxed">
                CBD is a high-risk category for reasons that have nothing to do with whether your specific business is legitimate. The regulatory picture varies by state and changes over time, which acquiring banks price as uncertainty, and most CBD sales are online, where disputes and fraud cost the bank more. Generalist processors handle that uncertainty the simplest way available to them, by prohibiting or restricting the category in their terms.
              </p>

              <p className="text-foreground leading-relaxed">
                Here is what each policy says (checked November 11, 2026). <a href="https://squareup.com/us/en/legal/general/payment" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square&rsquo;s Payment Terms</a> list &ldquo;products containing CBD, THC, or other cannabinoids&rdquo; as unsupported. <a href="https://stripe.com/legal/restricted-businesses" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe&rsquo;s restricted businesses list</a> puts CBD with only negligible THC under restricted categories that need additional due diligence, and prohibits CBD above the local legal THC limit, including CBD edibles. <a href="https://www.paypal.com/us/legalhub/paypal/acceptableuse-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal&rsquo;s US Acceptable Use Policy</a> does not name CBD, so ask PayPal before you rely on it. An account that processes for a few weeks before a freeze is usually the policy catching up with the signup. You need an acquiring bank that has decided, in advance, to underwrite CBD.
              </p>

              {/* Section 2 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Processors that approve CBD (and what they underwrite)
              </h2>

              <p className="text-foreground leading-relaxed">
                The providers below are U.S. high-risk specialists whose own sites address CBD (checked November 11, 2026). Each cell reflects what the provider publishes. None publishes CBD rates, so pricing is quote-only; treat any guaranteed-rate claim as a starting position to verify in writing.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Processor</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">CBD fit</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">What it offers (published)</th>
                      <th className="text-left py-3 font-semibold text-foreground">Notable</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://paymentcloudinc.com/industries/cbd-hemp/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a></td>
                      <td className="py-3 pr-4">Dedicated CBD and hemp merchant account page</td>
                      <td className="py-3 pr-4">Card processing; dedicated account managers</td>
                      <td className="py-3">Says no long-term contracts or hidden fees</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.easypaydirect.com/merchant-accounts/cbd-merchant-accounts/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Easy Pay Direct</a></td>
                      <td className="py-3 pr-4">CBD, hemp, and hemp-derived product businesses</td>
                      <td className="py-3 pr-4">Transaction Routing (load balancing) across multiple merchant accounts</td>
                      <td className="py-3">Says underwriting takes 1 to 4 business days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.soarpay.com/industry/cbd/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Soar Payments</a></td>
                      <td className="py-3 pr-4">Hemp and CBD oil businesses</td>
                      <td className="py-3 pr-4">eCheck (ACH) processing only, no card processing</td>
                      <td className="py-3">Says its sponsor banks will not underwrite CBD for card processing</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.durangomerchantservices.com/high-risk-merchant-account/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a></td>
                      <td className="py-3 pr-4">Lists CBD and hemp (under 0.3% THC) among its high-risk industries</td>
                      <td className="py-3 pr-4">U.S.-only CBD and hemp accounts</td>
                      <td className="py-3">Requires a Certificate of Analysis under 12 months old</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The Certificate of Analysis is the document that decides it
              </h2>

              <p className="text-foreground leading-relaxed">
                For CBD, the single piece of paperwork that moves an application is the Certificate of Analysis. A Certificate of Analysis is a lab report from an accredited testing facility that states the cannabinoid content of your product and confirms the THC level sits within the legal threshold. Underwriters use it to confirm the product they are about to process for is the compliant product you describe, not a higher-THC item that would breach the processor&rsquo;s rules or the law. Durango, for one, states that its CBD accounts need a Certificate of Analysis under 12 months old.
              </p>

              <p className="text-foreground leading-relaxed">
                Beyond the Certificate of Analysis, expect to provide business formation documents, identification, prior processing statements if you have them, product labels, and a website that carries the required disclaimers. The merchants who get approved quickly are the ones who send a complete, compliant package up front rather than answering underwriting questions one at a time over several weeks.
              </p>

              {/* Section 4 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Reserves and rates: what CBD pricing really turns on
              </h2>

              <p className="text-foreground leading-relaxed">
                CBD accounts are priced as high-risk and quoted per merchant, and some come with a reserve. If you are offered one, the reserve often matters more to cash flow than the headline rate, and its terms are worth negotiating in writing once you have a clean processing history. For how reserves work and how to bring one down in writing, see our explainer on <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">capped vs rolling reserves and frozen funds</Link>.
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
                  <p className="text-foreground">Yes. Square lists CBD products as unsupported, and Stripe treats low-THC CBD as a restricted category that needs extra due diligence, so most CBD and hemp businesses apply through high-risk specialists instead. PaymentCloud and Easy Pay Direct publish dedicated CBD merchant account programs. Durango Merchant Services lists CBD and hemp among its high-risk industries for U.S. accounts. Soar Payments offers CBD eCheck processing only, not card processing. Approval depends on your product compliance, your chargeback history, and complete documentation rather than on the category alone.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What does CBD payment processing cost?</h3>
                  <p className="text-foreground">CBD is priced as a high-risk vertical, and the specialists named here do not publish CBD rate cards, so pricing is quote-only and set per merchant on underwriting. Some accounts also carry a reserve. Treat any guaranteed-rate claim as an opening position to verify in writing. The variables that move your number are processing volume, chargeback ratio, product mix, and how well your compliance documentation is prepared, not the CBD label by itself.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What documents do I need to open a CBD merchant account?</h3>
                  <p className="text-foreground">Underwriters generally require business formation documents, a government ID, recent processing statements if you have them, and product-compliance evidence specific to CBD. The compliance document that matters most is a Certificate of Analysis from an accredited lab for the products you sell, showing cannabinoid content and confirming THC within the legal threshold. Durango, for example, says its CBD accounts need a Certificate of Analysis under 12 months old. Many banks also ask for your product labels, your supplier or lab relationship, and a compliant website with required disclaimers before they approve the account.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why did Stripe or Square close my CBD account?</h3>
                  <p className="text-foreground">Each platform writes its own rules. Square&rsquo;s Payment Terms list products containing CBD, THC, or other cannabinoids as unsupported. Stripe lists CBD with only negligible THC as a restricted category that requires additional due diligence, and prohibits CBD above the local THC limit, including CBD edibles. PayPal&rsquo;s US Acceptable Use Policy does not name CBD, so confirm with PayPal before you rely on it. An account opened without that review can be closed once the processor sees what you sell. This is a policy decision, not a judgment on your business. The fix is a specialist account underwritten for CBD. Stand up the specialist account first, then migrate volume so revenue keeps moving.</p>
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
