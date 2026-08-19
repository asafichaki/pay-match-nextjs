import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Travel Agency Payment Processing Guide 2026",
  description: "Why card networks classify travel agencies as high-risk (MCC 4722), which processors actually approve them, and how large merchants negotiate reserves.",
  keywords: "travel agency payment processing, travel merchant account, tour operator merchant account, high risk travel merchant, payment processing for travel agencies",
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/travel-merchant-account",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/insights/travel-merchant-account",
    title: "Travel Agency Payment Processing Guide 2026",
    description: "Why card networks classify travel agencies as high-risk (MCC 4722), which processors actually approve them, and how large merchants negotiate reserves.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Agency Payment Processing Guide 2026",
    description: "MCC 4722, the agency model vs merchant of record distinction, and how large travel merchants negotiate reserves.",
  },
};

export default function TravelMerchantAccountPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Travel Agency Payment Processing: How High-Volume Travel Merchants Get Approved",
    "description": "Why card networks classify travel agencies and tour operators under MCC 4722 and treat the category as high-risk, the agency model vs merchant of record distinction that sets the reserve, which processors approve travel, and what large merchants can negotiate.",
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
    "dateModified": "2026-08-19",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.mypayadvisor.com/insights/travel-merchant-account"
    },
    "isPartOf": {
      "@type": "WebPage",
      "@id": "https://www.mypayadvisor.com/insights"
    },
    "about": [
      { "@id": "https://www.mypayadvisor.com/glossary#mcc-4722" },
      { "@id": "https://www.mypayadvisor.com/glossary#merchant-of-record" },
      { "@id": "https://www.mypayadvisor.com/glossary#future-delivery-risk" },
      { "@id": "https://www.mypayadvisor.com/glossary#reserve" },
      { "@id": "https://www.mypayadvisor.com/glossary#mcc" },
      { "@id": "https://www.mypayadvisor.com/glossary#card-not-present" },
      { "@id": "https://www.mypayadvisor.com/glossary#chargeback" }
    ],
    "keywords": ["travel agency payment processing", "travel merchant account", "tour operator merchant account", "high risk travel merchant", "MCC 4722"],
    "articleSection": "High-Risk Payment Processing"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
      { "@type": "ListItem", "position": 3, "name": "Travel Agency Payment Processing", "item": "https://www.mypayadvisor.com/insights/travel-merchant-account" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why did Stripe (or another aggregator) shut down my travel agency account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Because travel is on their written lists. Stripe's published restricted-businesses page marks \"Travel reservation services and clubs\" as restricted, requiring additional due diligence, under Stripe's own heading of businesses that \"might pose elevated financial risk,\" and separately prohibits timeshare services and commercial airlines and cruises outright (quotes verified against Stripe's restricted businesses page, accessed August 18, 2026). Aggregators approve instantly by underwriting lightly, then their risk systems flag travel's signature pattern later: high tickets, long delivery windows, seasonal spikes. The termination usually arrives after volume grows, which is the worst possible timing. The fix is structural, not cosmetic: a dedicated travel merchant account that underwrites your model upfront, so the risk review happens before your peak season instead of during it."
        }
      },
      {
        "@type": "Question",
        "name": "What is MCC 4722 and why does it matter for my travel business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MCC 4722, Travel Agencies and Tour Operators, is the merchant category code card networks assign to businesses that arrange flights, hotels, packages, and tours. It is how a processor's systems classify you before a human reads your application, it shapes your interchange treatment, and it flags your account for high-risk underwriting. It matters because you cannot opt out of it: registering under a milder code to avoid travel underwriting is misrepresentation and a standard reason for termination. The winning approach is to accept the classification and present strong evidence (delivery windows, dispute history, refund discipline) inside it."
        }
      },
      {
        "@type": "Question",
        "name": "How big is a rolling reserve on a travel merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "There is no single number, and be wary of anyone quoting you one before underwriting. Among processors that publish figures, Durango Merchant Services states travel rolling reserves range from 0% to 10% of processing volume and typically decrease or are removed as processing history stabilizes. Your actual reserve depends on the exposure your account presents: how much volume settles on your merchant account (versus your suppliers'), how far ahead of delivery you charge, your average ticket, and your dispute ratio. Merchant-of-record tour operators with long horizons sit at the high end; agency-model shops running mostly service fees sit at the low end."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need ARC or IATA accreditation to get a travel merchant account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Only if you issue airline tickets. PaymentCloud's published requirements ask for an ARC bond or IATA certificate specifically from merchants selling flight tickets, and Soar Payments requires a current ARC bond for airfare sellers. If you sell tours, packages, hotels, or cruises without issuing air, accreditation is not a standard underwriting requirement, though supplier and reseller agreements are. Worth knowing: ARC accreditation changes your risk profile too, because ARC-settled tickets run on the airlines' merchant accounts rather than yours, which shrinks the volume your own acquirer has to underwrite."
        }
      },
      {
        "@type": "Question",
        "name": "Can a large travel agency negotiate a lower reserve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, and large merchants have the most negotiating room, because reserves are priced on provable exposure, not on industry labels alone. The levers that move terms: twelve or more months of processing statements with a controlled dispute ratio, documentation showing how much of your volume settles on suppliers' accounts as merchant of record, evidence of your real booking-to-delivery windows, and enforced cancellation terms accepted at checkout. The realistic negotiation targets are a capped reserve instead of an uncapped rolling one, scheduled reserve reviews at three and six months with written release conditions, and reserve percentage steps tied to dispute performance."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Providers That Approve Travel Merchant Accounts (2026)",
    "itemListOrder": "https://schema.org/ItemListUnordered",
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Service",
          "name": "Durango Merchant Services",
          "serviceType": "Travel merchant account",
          "provider": { "@type": "Organization", "name": "Durango Merchant Services" },
          "url": "https://www.durangomerchantservices.com",
          "offers": {
            "@type": "Offer",
            "category": "Travel merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk travel pricing; rate quoted per merchant and acquirer"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Service",
          "name": "PaymentCloud",
          "serviceType": "Travel merchant account",
          "provider": { "@type": "Organization", "name": "PaymentCloud" },
          "url": "https://paymentcloudinc.com",
          "offers": {
            "@type": "Offer",
            "category": "Travel merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk travel and timeshare pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Service",
          "name": "Soar Payments",
          "serviceType": "Travel merchant account",
          "provider": { "@type": "Organization", "name": "Soar Payments" },
          "url": "https://www.soarpay.com",
          "offers": {
            "@type": "Offer",
            "category": "Travel merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk travel pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Service",
          "name": "PayCompass",
          "serviceType": "Travel merchant account",
          "provider": { "@type": "Organization", "name": "PayCompass" },
          "url": "https://paycompass.com",
          "offers": {
            "@type": "Offer",
            "category": "Travel merchant account",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "description": "High-risk travel pricing; rate quoted per merchant on underwriting"
            }
          }
        }
      }
    ]
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/travel-merchant-account#webpage",
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
                <span>Updated August 2026</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                Travel Agency Payment Processing: How High-Volume Travel Merchants Get Approved
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Why card networks classify travel agencies as high-risk (MCC 4722), which processors actually approve them, and how large merchants negotiate reserves.
              </p>

              {/* Reviewed-by byline: real expert only (no fabricated author, per portfolio_no_fictional_credentials). */}
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
                  <p className="text-sm text-muted-foreground">Covers high-risk and future-delivery underwriting, reserve negotiation, and chargeback management, and has negotiated processing terms for high-risk merchants.</p>
                </div>
              </div>
            </header>

            {/* AEO lead-answer block: direct answer for AI Overviews / LLM extraction. */}
            <section className="aeo-answer mb-12 p-6 bg-primary/5 rounded-lg border-l-4 border-primary" data-speakable>
              <p className="text-lg text-foreground leading-relaxed">
                Travel agency payment processing is the acceptance of card payments for trips delivered weeks or months after the charge. Card networks classify travel agencies and tour operators under MCC 4722 and treat the category as high-risk because of future-delivery exposure, high average tickets, and high chargeback rates, so most travel businesses need a specialized high-risk merchant account.
              </p>
            </section>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                If you run a travel agency, an OTA, or a tour operator doing serious monthly volume, you have probably lived some version of this: a mainstream processor approved you fast, processed you for a season, then froze funds or terminated the account right as bookings peaked. Or a high-risk processor approved you but parked 10% of every settlement in a reserve you never agreed to in spirit.
              </p>

              <p className="text-foreground leading-relaxed">
                None of that means your business is bad. It means the card networks price travel like a loan, not a payment stream. This page explains the actual risk mechanics, who approves travel today, and what a large merchant can negotiate that a small one cannot. It is part of our wider guide to <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk merchant accounts</Link>.
              </p>

              {/* Section 1 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Why Travel Agency Payment Processing Is Classified High-Risk
              </h2>

              <p className="text-foreground leading-relaxed">
                Underwriters look at travel and see one thing before anything else: money collected now for a service delivered later. Everything else flows from that.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Future-delivery risk.</strong> Future-delivery risk is the exposure an acquiring bank carries between the day a card is charged and the day the travel is actually delivered. A customer pays in January for a July safari. For six months, the acquiring bank is exposed: if the trip never happens (the agency fails, the operator fails, the flight is canceled), the cardholder can dispute the charge and the bank wears the loss if the merchant cannot cover it. The longer the gap between charge and delivery, the bigger the exposure. Card-network dispute rules for delayed-delivery purchases can run the cardholder&rsquo;s window from the expected delivery date rather than the charge date, so a travel merchant&rsquo;s tail of liability is longer than almost any other retail category.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Chargeback exposure you do not fully control.</strong> Travel chargebacks come from cancellations, weather, itinerary changes, supplier failures, and plain buyer&rsquo;s remorse, not just fraud. Durango Merchant Services, which has published one of the more detailed travel risk breakdowns, states that travel chargeback rates often run 3 to 5x higher than traditional retail and that the majority of travel chargebacks are experience-related rather than fraud. When a hurricane closes an airport, the disputes land on the merchant account, not on the weather.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>High average tickets.</strong> Durango&rsquo;s published figures describe $1,000 to $8,000 bookings as very common. One disputed honeymoon package can equal a hundred disputed t-shirts. High tickets concentrate risk into single transactions, which is exactly what underwriting models penalize.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Card-not-present by default.</strong> ARC&rsquo;s own card acceptance guide notes that the large majority of transactions in the travel agency channel are card-not-present, that GDSs do not make card terminals available to US travel agents, and that this makes cardholder validation genuinely hard. Card-not-present fraud liability sits with the merchant.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Seasonality.</strong> Travel volume spikes around booking seasons. To a risk engine, a merchant that processes $150,000 in March and $900,000 in June looks like a fraud pattern unless the underwriter understood the seasonality upfront. Aggregator risk models usually did not.
              </p>

              <p className="text-foreground leading-relaxed">
                Travel shares this future-delivery underwriting problem with other card-not-present verticals we cover, like <Link href="/insights/gaming-merchant-account" className="text-primary hover:underline">gaming merchant accounts</Link> and <Link href="/insights/nutra-supplement-merchant-account" className="text-primary hover:underline">nutraceutical merchant accounts</Link>. The mechanics rhyme; the delivery windows differ.
              </p>

              <h3 className="text-xl font-serif font-bold text-foreground mt-10 mb-4">
                MCC 4722: The Code That Tells Underwriters What You Are
              </h3>

              <p className="text-foreground leading-relaxed">
                MCC 4722, Travel Agencies and Tour Operators, is the four-digit merchant category code the card networks assign to businesses that arrange flights, hotels, packages, and tours on behalf of travelers. It covers retail agencies, OTAs, and tour operators. The code matters for three reasons. First, it is how a processor&rsquo;s risk system recognizes you as travel before a human reads your application. Second, it is how the card networks and your acquirer categorize your transactions, which feeds the interchange treatment your account receives. Third, miscoding yourself to dodge the classification is a fast way to get terminated for misrepresentation. If you sell travel, you will be underwritten as travel. The useful move is to present the risk well, not to hide the code.
              </p>

              <h3 className="text-xl font-serif font-bold text-foreground mt-10 mb-4">
                Why Stripe and Other Aggregators Terminate Travel Merchants
              </h3>

              <p className="text-foreground leading-relaxed">
                Aggregator terminations of travel merchants are written policy, not anecdote. Stripe&rsquo;s published restricted-businesses list places &ldquo;Commercial airlines and cruises,&rdquo; &ldquo;International (cross-border) charter and private airlines,&rdquo; and &ldquo;Timeshare services&rdquo; under prohibited categories, and lists &ldquo;Travel reservation services and clubs&rdquo; as restricted, meaning they require additional due diligence, under Stripe&rsquo;s own heading of businesses that &ldquo;might pose elevated financial risk&rdquo; (quotes verified verbatim against Stripe&rsquo;s restricted businesses page, accessed August 18, 2026). Other aggregators apply similar house rules.
              </p>

              <p className="text-foreground leading-relaxed">
                Aggregators onboard instantly precisely because they underwrite lightly. When their risk systems later catch up with what a travel merchant actually is (large tickets, long delivery windows, seasonal spikes), the standard responses are holds, reserves imposed without negotiation, or termination. A dedicated travel merchant account flips the order: heavy underwriting first, stability after. For a merchant doing real volume, that trade is the whole game.
              </p>

              {/* Section 2 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Agency Model vs. Merchant of Record: The Distinction That Sets Your Reserve
              </h2>

              <p className="text-foreground leading-relaxed">
                A merchant of record is the business whose merchant account accepts the traveler&rsquo;s card and carries the chargebacks, refunds, and card-network obligations for that sale. In travel, whether that business is you or your supplier is the distinction that sets your reserve, and it is the first question a good underwriter will ask you: <strong>whose merchant account does the traveler&rsquo;s money actually touch?</strong>
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Agency model.</strong> The supplier (airline, hotel, cruise line) is the merchant of record. Your agency passes the traveler&rsquo;s card to the supplier, the charge settles on the supplier&rsquo;s merchant account, and you earn commission. Your own merchant account only carries your service fees and markups. In the airline channel this is formalized: ARC-accredited agencies accept cards on behalf of ARC participating airlines, the ticket settles as the airline&rsquo;s transaction, and when a cardholder disputes it, ARC&rsquo;s guide states the dispute is submitted to the airline&rsquo;s payment processor. The Merchant of Record analysis published by AltexSoft puts it simply: in the agency model, suppliers carry the direct chargeback and payment risk.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>Merchant model (merchant of record).</strong> Your business is the merchant of record. You negotiate net rates, add markup, charge the traveler&rsquo;s card on your own merchant account, and pay suppliers later. Most tour operators, package builders, and merchant-model OTAs live here. Every dollar of every package settles through your account, so your acquirer&rsquo;s exposure equals your full booking value across your entire delivery horizon.
              </p>

              <p className="text-foreground leading-relaxed">
                The underwriting consequence is direct. An agency-model shop doing $2M a month in gross bookings but only $80K a month through its own merchant account (service fees, small markups) is, to an acquirer, an $80K merchant with small average tickets. A merchant-model tour operator doing the same $2M gross is a $2M exposure with $8,000 tickets delivered nine months out. Same industry, same MCC, radically different reserve conversation. If you are structured partly agency-model, say so on the application and prove it with supplier agreements; it can shrink your underwritten exposure by an order of magnitude.
              </p>

              <p className="text-foreground leading-relaxed">
                One honest caveat: the agency model reduces your acquirer&rsquo;s exposure, it does not erase yours. ARC&rsquo;s guide is blunt about where liability lands in the airline channel: &ldquo;The agent is financially responsible for the sale, associated fees and chargebacks,&rdquo; and if the airline cannot reverse a cardholder&rsquo;s dispute, &ldquo;the agent assumes financial responsibility for the debit memo issued as a result.&rdquo; Also note that agency service fees (TASF) require their own authorization, separate from the ticket, which is exactly the money that runs on your own merchant account.
              </p>

              {/* Section 3 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Travel Merchant Account Providers That Approve Travel
              </h2>

              <p className="text-foreground leading-relaxed">
                These are processors whose own published pages confirm they underwrite travel today. This table only contains rows we verified against the providers&rsquo; live pages; it is a map of the category, not a ranking.
              </p>

              <p className="text-sm text-muted-foreground">
                Disclosure: myPayAdvisor may be compensated when a merchant we refer opens an account with a provider listed here. Rates and terms are set and quoted per merchant by each provider and its acquiring bank, and should be confirmed in writing before you sign. Every figure in this table is the provider&rsquo;s own published claim, not ours.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Provider</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Travel fit (per their own pages)</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Reserve approach</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Approval speed (their published claim)</th>
                      <th className="text-left py-3 font-semibold text-foreground">Notable</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.durangomerchantservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a></td>
                      <td className="py-3 pr-4">Dedicated travel program: agencies, OTAs, tour operators, charters</td>
                      <td className="py-3 pr-4">Publishes a 0% to 10% rolling reserve range and states reserves typically decrease or are removed as processing stabilizes</td>
                      <td className="py-3 pr-4">1 to 3 business days once documentation is complete</td>
                      <td className="py-3">Publishes full rate ranges (1.95% to 4.95% discount rate); acquiring bank network in US, Canada, EU; $5,000 monthly minimum (US)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://paymentcloudinc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a></td>
                      <td className="py-3 pr-4">Dedicated travel and timeshare page: agencies, cruises, timeshares</td>
                      <td className="py-3 pr-4">Not published</td>
                      <td className="py-3 pr-4">Application &ldquo;in as little as 5 minutes,&rdquo; representative within 24 hours</td>
                      <td className="py-3">Requires ARC bond or IATA certificate for airfare sellers; multiple gateway options (Authorize.net, NMI, others)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://www.soarpay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Soar Payments</a></td>
                      <td className="py-3 pr-4">Travel and timeshare page; states it has served travel since its founding</td>
                      <td className="py-3 pr-4">Not published</td>
                      <td className="py-3 pr-4">Not published</td>
                      <td className="py-3">Requires a current ARC bond for airfare sellers and reseller agreements for resold inventory</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4"><a href="https://paycompass.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayCompass</a></td>
                      <td className="py-3 pr-4">Dedicated travel page: agencies, tour operators, timeshares</td>
                      <td className="py-3 pr-4">Not published</td>
                      <td className="py-3 pr-4">3 to 5 business days</td>
                      <td className="py-3">Publishes a typical travel fee range of 3% to 5%; multi-currency processing and virtual cards</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-foreground leading-relaxed">
                PayKings, Host Merchant Services, Zen Payments, and Easy Pay Direct also market travel merchant accounts; we excluded them from the table because their pages could not be verified during this review (rate-limited or blocked), not because of any negative finding.
              </p>

              <p className="text-foreground leading-relaxed">
                The pattern worth noticing: every serious travel processor is a merchant account provider with multiple acquiring bank relationships, not an instant-onboarding aggregator. That is the structural difference between an account built to survive a heavy season and one built to onboard you in five minutes.
              </p>

              {/* Section 4 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Rolling Reserves on Travel Merchant Accounts: What Large Merchants Can Negotiate
              </h2>

              <p className="text-foreground leading-relaxed">
                A rolling reserve is a percentage of every settlement the acquirer holds back for a defined window to cover potential future chargebacks and merchant default, released on a rolling schedule as the window ages out. (Full definition at our <Link href="/glossary#reserve" className="text-primary hover:underline">glossary entry on reserves</Link>.) In travel it exists to cover the bank&rsquo;s future-delivery exposure: if you fail before the trips deliver, the reserve absorbs the chargebacks. Among the providers that publish numbers, Durango states travel reserves run from 0% to 10% and typically shrink or disappear as processing history stabilizes. Reserves also come in two other shapes: a capped reserve (holdbacks stop once a fixed dollar amount is reached) and an upfront reserve (a fixed deposit before processing begins).
              </p>

              {/* Inline Barak Quotation block: opinion/experience, no fabricated stats. */}
              <figure className="my-8 border-l-4 border-primary bg-muted/40 px-6 py-5 rounded-r-md not-prose">
                <blockquote cite="https://www.mypayadvisor.com/about/barak" className="text-foreground italic leading-relaxed">
                  &ldquo;With travel, the reserve is the whole negotiation. The bank is not worried about today&rsquo;s sale, it is worried about the trip that has not happened yet, so it holds back cash to cover it. What moves that number is evidence: a clean dispute history, real supplier contracts, proof you deliver, and documented refunds when a trip falls through. Bring that to a risk desk in writing after you have a track record, and the reserve comes down. Ask before you have the history, and it will not.&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm text-muted-foreground not-italic">
                  <a href="/about/barak" className="text-primary hover:underline font-medium">Barak Bachar</a>, Global Payments Manager, myPayAdvisor
                </figcaption>
              </figure>

              <p className="text-foreground leading-relaxed">
                Here is the frame that makes reserve negotiation rational instead of emotional. The acquirer is estimating one number:
              </p>

              <p className="text-foreground leading-relaxed font-semibold">
                Exposure ≈ monthly volume through your account × share of bookings not yet delivered × expected dispute severity.
              </p>

              <p className="text-foreground leading-relaxed">
                Everything you can prove that shrinks one of those three factors is a negotiation lever. Large merchants have more levers, not because banks like them more, but because they have more provable history:
              </p>

              <ul className="text-foreground space-y-2 ml-6 list-disc">
                <li><strong>Processing history.</strong> Twelve or more months of statements showing volume, refunds, and a dispute ratio at or under network monitoring thresholds is the single strongest input. It replaces the underwriter&rsquo;s worst-case guess with your actual numbers.</li>
                <li><strong>Delivery-horizon mix.</strong> If 60% of your bookings deliver within 30 days, document it. An underwriter modeling every booking at nine months out will reserve you like a tour operator when you book like a city-break shop.</li>
                <li><strong>Merchant of record split.</strong> Airfare settling through ARC on the airlines&rsquo; accounts, or hotel stays settling on the supplier, should be carved out of your underwritten volume. Show the supplier agreements.</li>
                <li><strong>Refund and cancellation discipline.</strong> Published cancellation terms, cardholder-accepted at checkout, plus proactive refunds before disputes, directly cut expected severity. ARC&rsquo;s chargeback guidance is built on exactly this evidence chain: prove identity, prove authorization, prove accepted terms.</li>
                <li><strong>Reserve review dates in the contract.</strong> The realistic ask for a new account is rarely &ldquo;no reserve.&rdquo; It is a defined reserve with a scheduled review at 3 and 6 months, a cap instead of an uncapped rolling percentage, and written release terms. Durango&rsquo;s own published position, that reserves typically decrease or get removed as processing stabilizes, tells you processors already operate this way; the negotiation is getting it in writing on day one.</li>
              </ul>

              {/* Section 5 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Travel Merchant Account Approval Checklist: What Underwriters Ask For
              </h2>

              <p className="text-foreground leading-relaxed">
                A travel merchant account application is judged on its document file: corporate identity, banking, processing history, accreditation if you issue air, and proof of how you book and deliver. The list below is compiled from the published requirements of the travel processors above. Have it ready before you apply; incomplete files are the most common reason a 3-day approval becomes a 3-week one.
              </p>

              <ul className="text-foreground space-y-2 ml-6 list-disc">
                <li>Business license and articles of incorporation</li>
                <li>EIN / tax ID and government-issued ID for all owners</li>
                <li>3 to 6 months of business bank statements</li>
                <li>3 to 6 months of prior processing statements, including your dispute counts (if you have processed before)</li>
                <li>ARC bond or IATA/IATAN accreditation certificate, if you issue airfare</li>
                <li>Supplier and reseller agreements for inventory you resell</li>
                <li>Published cancellation and refund policy, terms of service, privacy policy, and full contact details on your website, with secure checkout</li>
                <li>A one-page description of your business model: agency vs merchant of record split, average ticket, booking-to-delivery window, seasonality curve, and your chargeback prevention stack</li>
                <li>A business plan or volume projection (some processors request it for new entities)</li>
              </ul>

              <p className="text-foreground leading-relaxed">
                That last one-pager is not a formality. It is you doing the underwriter&rsquo;s exposure math before they do it with worst-case assumptions.
              </p>

              {/* Section 6 */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Merchant Size and Average Ticket: How Volume Changes the Conversation
              </h2>

              <p className="text-foreground leading-relaxed">
                Merchant size and average ticket decide how much underwriting attention a travel merchant account gets and how much of its terms are genuinely negotiable. The dynamics in this guide scale with size, in both directions.
              </p>

              <p className="text-foreground leading-relaxed">
                A small agency (say, under $50K a month, service fees and commissions) is a lightweight file: modest exposure, small tickets, quick approval, often minimal reserve. The risk is neglect, not rejection; small travel files get standard terms because nobody spends negotiation effort on them, in either direction.
              </p>

              <p className="text-foreground leading-relaxed">
                A very large merchant ($1M+ monthly, $5,000+ average tickets, months-long delivery horizons) is a different animal. Your file will get a human senior underwriter, and possibly more than one acquiring bank. Expect deeper document requests and financials. In exchange, you can genuinely negotiate: reserve caps and review schedules, settlement timing, volume tiers, and a multi-acquirer setup so one bank&rsquo;s risk appetite never becomes your single point of failure. Processors with several bank relationships (Durango and Easy Pay Direct both advertise this model) exist precisely for this file. High average tickets cut both ways: they raise per-transaction exposure, but a clean dispute history at high tickets is the strongest character evidence a travel merchant can show.
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>The verdict:</strong> travel is not unbankable, it is mispriced by default. The merchants that get sane terms are the ones that walk in with the exposure math already done: model split documented, delivery horizons proven, dispute ratio in hand. If you want that shortlist built for your specific file instead of a generic one, <Link href="/quiz" className="text-primary hover:underline">take our matching quiz</Link> and Barak will review the shortlist against your volume, ticket size, and model before you apply anywhere.
              </p>

              {/* FAQ Section */}
              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                FAQ: Travel Agency Payment Processing
              </h2>

              <div className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why did Stripe (or another aggregator) shut down my travel agency account?</h3>
                  <p className="text-foreground">Because travel is on their written lists. Stripe&rsquo;s published restricted-businesses page marks &ldquo;Travel reservation services and clubs&rdquo; as restricted, requiring additional due diligence, under Stripe&rsquo;s own heading of businesses that &ldquo;might pose elevated financial risk,&rdquo; and separately prohibits timeshare services and commercial airlines and cruises outright (quotes verified against Stripe&rsquo;s restricted businesses page, accessed August 18, 2026). Aggregators approve instantly by underwriting lightly, then their risk systems flag travel&rsquo;s signature pattern later: high tickets, long delivery windows, seasonal spikes. The termination usually arrives after volume grows, which is the worst possible timing. The fix is structural, not cosmetic: a dedicated travel merchant account that underwrites your model upfront, so the risk review happens before your peak season instead of during it.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What is MCC 4722 and why does it matter for my travel business?</h3>
                  <p className="text-foreground">MCC 4722, Travel Agencies and Tour Operators, is the merchant category code card networks assign to businesses that arrange flights, hotels, packages, and tours. It is how a processor&rsquo;s systems classify you before a human reads your application, it shapes your interchange treatment, and it flags your account for high-risk underwriting. It matters because you cannot opt out of it: registering under a milder code to avoid travel underwriting is misrepresentation and a standard reason for termination. The winning approach is to accept the classification and present strong evidence (delivery windows, dispute history, refund discipline) inside it.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">How big is a rolling reserve on a travel merchant account?</h3>
                  <p className="text-foreground">There is no single number, and be wary of anyone quoting you one before underwriting. Among processors that publish figures, Durango Merchant Services states travel rolling reserves range from 0% to 10% of processing volume and typically decrease or are removed as processing history stabilizes. Your actual reserve depends on the exposure your account presents: how much volume settles on your merchant account (versus your suppliers&rsquo;), how far ahead of delivery you charge, your average ticket, and your dispute ratio. Merchant-of-record tour operators with long horizons sit at the high end; agency-model shops running mostly service fees sit at the low end.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Do I need ARC or IATA accreditation to get a travel merchant account?</h3>
                  <p className="text-foreground">Only if you issue airline tickets. PaymentCloud&rsquo;s published requirements ask for an ARC bond or IATA certificate specifically from merchants selling flight tickets, and Soar Payments requires a current ARC bond for airfare sellers. If you sell tours, packages, hotels, or cruises without issuing air, accreditation is not a standard underwriting requirement, though supplier and reseller agreements are. Worth knowing: ARC accreditation changes your risk profile too, because ARC-settled tickets run on the airlines&rsquo; merchant accounts rather than yours, which shrinks the volume your own acquirer has to underwrite.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Can a large travel agency negotiate a lower reserve?</h3>
                  <p className="text-foreground">Yes, and large merchants have the most negotiating room, because reserves are priced on provable exposure, not on industry labels alone. The levers that move terms: twelve or more months of processing statements with a controlled dispute ratio, documentation showing how much of your volume settles on suppliers&rsquo; accounts as merchant of record, evidence of your real booking-to-delivery windows, and enforced cancellation terms accepted at checkout. The realistic negotiation targets are a capped reserve instead of an uncapped rolling one, scheduled reserve reviews at three and six months with written release conditions, and reserve percentage steps tied to dispute performance.</p>
                </div>
              </div>

              {/* CTA into the Sorting Hat */}
              <div className="mt-12 p-8 bg-primary/10 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Need a processor that approves travel?</h3>
                <p className="text-muted-foreground mb-6">Take our free 2-minute assessment to get matched with processors that underwrite future-delivery travel businesses and negotiate workable reserve terms.</p>
                <Link href="/quiz" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Start Free Assessment →
                </Link>
              </div>

              {/* Related Articles */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">Related Guides</h3>
                <div className="grid gap-4">
                  <Link href="/insights/high-risk-payment-processing-guide" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">High-Risk Merchant Accounts: The Operator&rsquo;s Guide</h4>
                    <p className="text-sm text-muted-foreground mt-1">How approval, reserves, and chargeback thresholds really work</p>
                  </Link>
                  <Link href="/insights/gaming-merchant-account" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Gaming Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">The legal line between iGaming and video games, and who approves each</p>
                  </Link>
                  <Link href="/insights/nutra-supplement-merchant-account" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Nutraceutical Merchant Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">Who underwrites supplements and how offer structure decides approval</p>
                  </Link>
                  <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Capped vs Rolling Reserves &amp; Frozen Funds</h4>
                    <p className="text-sm text-muted-foreground mt-1">How reserves work and how to get them reduced in writing</p>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
