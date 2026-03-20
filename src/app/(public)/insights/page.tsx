import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import InsightsContent from "./InsightsContent";

export const metadata: Metadata = {
  title: "Payment Processing Insights & Expert Guides 2026",
  description: "Expert insights on payment processing, payment gateways, merchant services, and choosing the right payment provider in 2026. In-depth guides to optimize your business payments and reduce processing costs.",
  keywords: "payment processing guides 2026, payment gateway tutorials, merchant services advice, credit card processing tips, payment processor comparison, fintech insights",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights",
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/insights",
    title: "Payment Processing Insights & Expert Guides 2026",
    description: "Expert insights on payment processing, payment gateways, and choosing the right payment provider in 2026.",
    images: [
      {
        url: "https://www.mypayadvisor.com/og-logo.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Processing Insights & Expert Guides 2026",
    description: "Expert guides on payment processing and choosing the right payment provider.",
  },
};

const articles = [
  {
    id: "merchant-contract-cancellation-guide",
    title: "How to Cancel Your Merchant Processing Contract Without Paying a Fortune",
    description: "Complete guide to escaping costly merchant processing agreements. Learn about Early Termination Fees, liquidated damages, and legal strategies to minimize cancellation costs.",
    category: "Contract Guide",
    readTime: "18 min",
    date: "Dec. 30, 2025",
    slug: "/insights/merchant-contract-cancellation-guide",
    keywords: ["merchant contract cancellation", "early termination fee", "liquidated damages", "processing agreement cancellation"]
  },
  {
    id: "level-2-level-3-processing-guide",
    title: "B2B Merchants: How Level 2 & 3 Processing Can Slash Your Fees by Up to 1.5%",
    description: "Learn how Level 2 and Level 3 credit card processing can reduce B2B merchant fees by up to 1.5% per transaction. Complete guide to implementation, requirements, and savings calculations.",
    category: "B2B Payments",
    readTime: "15 min",
    date: "Dec. 30, 2025",
    slug: "/insights/level-2-level-3-processing-guide",
    keywords: ["level 2 processing", "level 3 processing", "B2B payment processing", "corporate card processing"]
  },
  {
    id: "merchant-services-glossary",
    title: "The Complete Merchant Services Glossary: Decode Your Processing Fees",
    description: "Master essential payment processing terminology. Learn key terms like Interchange, Effective Rate, Acquirer, and more to negotiate better rates and reduce merchant fees.",
    category: "Financial Education",
    readTime: "8 min",
    date: "Dec. 30, 2025",
    slug: "/insights/merchant-services-glossary",
    keywords: ["merchant services glossary", "payment processing terms", "interchange fee", "effective rate", "acquirer", "payment gateway"]
  },
  {
    id: "how-to-read-merchant-statement",
    title: "How to Read Your Merchant Statement: The Ultimate 2026 Guide to Decoding Processing Fees",
    description: "78% of merchants just pay the bill without understanding it. Learn to decode acronyms like MTOT and NQUAL, calculate your effective rate, and identify junk fees costing you thousands.",
    category: "Financial Education",
    readTime: "14 min",
    date: "Dec. 26, 2025",
    slug: "/insights/how-to-read-merchant-statement",
    keywords: ["how to read merchant statement", "merchant statement explained", "effective rate calculation", "processing fee acronyms"]
  },
  {
    id: "merchant-statement-audit-guide",
    title: "How to Reduce Credit Card Processing Fees: The Ultimate 2026 Guide to Merchant Statement Audits",
    description: "Over 90% of merchants are overpaying for processing. Learn how to audit your merchant statement, identify hidden junk fees, and reduce costs by 20-30% through transparent pricing strategies.",
    category: "Financial Advisory",
    readTime: "12 min",
    date: "Dec. 26, 2025",
    slug: "/insights/merchant-statement-audit-guide",
    keywords: ["merchant statement audit", "reduce credit card processing fees", "interchange-plus pricing", "hidden processing fees", "effective rate"]
  },
  {
    id: "small-business-credit-card-processing-guide",
    title: "Stop Overpaying: A Small Business Guide to Credit Card Processing Fees",
    description: "Most small businesses overpay 20-40% on credit card processing fees. Learn exactly how to cut costs and reclaim thousands of dollars annually through smarter payment processing strategies.",
    category: "Guest Expert",
    readTime: "12 min",
    date: "Jan. 15, 2025",
    slug: "/insights/small-business-credit-card-processing-guide",
    keywords: ["credit card processing fees small business", "reduce processing fees", "interchange-plus pricing", "merchant account fees"]
  },
  {
    id: "high-risk-payment-processing-guide",
    title: "High-Risk Payment Processing: Complete Guide to Chargeback Management & Fraud Prevention (2026)",
    description: "Proven strategies to reduce chargebacks by 60%, navigate VAMP compliance, and secure reliable merchant accounts for CBD, gaming, subscription, and e-commerce businesses.",
    category: "Complete Guide",
    readTime: "35 min",
    date: "Dec. 9, 2025",
    slug: "/insights/high-risk-payment-processing-guide",
    keywords: ["high-risk payment processing", "chargeback management", "fraud prevention", "VAMP compliance"]
  },
  {
    id: "credit-card-processing-fees-explained",
    title: "Credit Card Processing Fees Explained: Complete Guide to Understanding & Reducing Costs (2026)",
    description: "The definitive guide to understanding every dollar you pay in credit card fees - interchange, assessments, processor markup, hidden fees, and proven strategies to save thousands annually.",
    category: "Complete Guide",
    readTime: "25 min",
    date: "Jan. 15, 2025",
    slug: "/insights/credit-card-processing-fees-explained",
    keywords: ["credit card processing fees", "interchange fees", "reduce processing fees", "effective rate"]
  },
  {
    id: "payment-processor-fees-guide",
    title: "Payment Processor Fees: Complete 2026 Guide to Understanding & Reducing Costs",
    description: "Everything you need to know about payment processor fees, pricing models, and strategies to reduce credit card processing costs. Compare providers and save thousands annually.",
    category: "Complete Guide",
    readTime: "30 min",
    date: "Dec. 7, 2025",
    slug: "/insights/payment-processor-fees-guide",
    keywords: ["payment processor fees", "credit card processing fees", "interchange plus pricing"]
  },
  {
    id: "best-payment-gateway-ecommerce",
    title: "Best Payment Gateway for Ecommerce: Complete Guide (2026)",
    description: "Complete guide to choosing the best payment gateway for your online store. Compare Stripe, PayPal, Square, Shopify Payments features, fees, and boost conversions by 10-30%.",
    category: "Ecommerce Guide",
    readTime: "28 min",
    date: "Dec. 7, 2025",
    slug: "/insights/best-payment-gateway-ecommerce",
    keywords: ["best payment gateway ecommerce", "Stripe vs PayPal", "Shopify Payments"]
  },
  {
    id: "helcim-review-2025",
    title: "Helcim Review 2026: Is This the Best Low-Fee Payment Processor?",
    description: "Complete Helcim review with interchange-plus pricing analysis, automatic volume discounts, and real cost comparisons showing potential savings of $3,000-$8,000 annually.",
    category: "Expert Review",
    readTime: "22 min",
    date: "Dec. 1, 2025",
    slug: "/insights/helcim-review-2025",
    keywords: ["Helcim review", "interchange-plus pricing", "low-fee payment processor"]
  },
  {
    id: "online-vs-instore-payments",
    title: "Online vs. In-Store Payments: Understanding the Key Differences",
    description: "The mechanics, risks, security requirements, and associated costs for online and in-store payments are fundamentally different. Learn how to optimize both.",
    category: "Payment Processing",
    readTime: "14 min",
    date: "Nov. 18, 2025",
    slug: "/insights/online-vs-instore-payments",
    keywords: ["card-present", "card-not-present", "interchange fees"]
  },
];

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Payment Processing Insights & Expert Guides 2026",
  "description": "Expert insights on payment processing, payment gateways, and choosing the right payment provider for your business in 2026.",
  "url": "https://www.mypayadvisor.com/insights",
  "dateModified": "2025-11-28",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Payment Processing Articles",
    "numberOfItems": articles.length,
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "url": `https://www.mypayadvisor.com${article.slug}`,
        "keywords": article.keywords.join(", "),
        "datePublished": "2025-11-01",
        "dateModified": "2025-11-28",
        "author": {
          "@type": "Organization",
          "name": "myPayAdvisor"
        },
        "publisher": {
          "@type": "Organization",
          "name": "myPayAdvisor",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.mypayadvisor.com/og-logo.png"
          }
        }
      }
    }))
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.mypayadvisor.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Insights",
      "item": "https://www.mypayadvisor.com/insights"
    }
  ]
};

export default function InsightsPage() {
  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <InsightsContent articles={articles} />
    </>
  );
}
