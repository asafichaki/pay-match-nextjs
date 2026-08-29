export interface Provider {
  id: number;
  name: string;
  tagline: string;
  logo?: string;
  logoPlaceholder: string;
  features: string[];
  rating: number;
  ratingLabel: string;
  /**
   * Kept for reference and for anything that needs the bare domain. It is NOT
   * what the UI links to any more: this list is a ranked commercial list shown
   * in the sidebar of every article, so it goes out through /go/<partnerSlug>
   * to carry rel="sponsored nofollow" and to be counted.
   */
  url: string;
  /** `partners.slug`. The link target is resolved from the database. */
  partnerSlug: string;
  /**
   * Keep this provider out of the sidebar's ranked list.
   *
   * Set on Leaders Merchant Services 2026-08-29. It held slot 1 on every
   * article on the site, and it is the one provider here with nothing to pay:
   * what it calls a referral program is a $250 statement credit available only
   * to an existing Leaders merchant, not an affiliate program. Giving the most
   * valuable slot on the site to the only partner that pays nothing was the
   * cheapest mistake in the whole funnel. The row is kept rather than deleted
   * so restoring it is one flag, and because the provider is still referenced
   * by the best-of index, which needs the same decision made deliberately.
   */
  sidebarExclude?: boolean;
  isTopPick?: boolean;
  transactionFees: string;
  setupSpeed: string;
  customerSupport: string;
  paymentMethods: string;
  countries: string;
  businessTypes: string[];
  markets: string[];
  fundingSpeed: number;
  feeScore: number;
}

export const providers: Provider[] = [
  {
    id: 1,
    name: "Leaders Merchant Services",
    tagline: "Best overall payment solution for growing businesses",
    logo: "/images/lms-logo.png",
    logoPlaceholder: "lms",
    features: [
      "Zero monthly fees for qualifying businesses",
      "Next-day funding with no holds",
      "24/7 dedicated support team",
      "Accept 150+ payment methods globally",
    ],
    rating: 9.1,
    ratingLabel: "Excellent",
    url: "https://www.leadersmerchantservices.com/",
    partnerSlug: "leaders-merchant-services",
    sidebarExclude: true,
    isTopPick: true,
    transactionFees: "1.5% - 2.9%",
    setupSpeed: "Same day",
    customerSupport: "24/7 Phone & Chat",
    paymentMethods: "150+",
    countries: "Global",
    businessTypes: ["retail", "ecommerce", "restaurant", "services"],
    markets: ["us", "global", "eu"],
    fundingSpeed: 1,
    feeScore: 1,
  },
  {
    id: 2,
    name: "Paysafe",
    tagline: "Simpler payments with next-day funding",
    logo: "/images/paysafe-logo.png",
    logoPlaceholder: "paysafe",
    features: [
      "260+ payment methods supported",
      "Smart security to protect your business",
      "Dedicated customer support",
      "No setup fees or hidden costs",
    ],
    rating: 8.8,
    ratingLabel: "Very Good",
    url: "https://www.paysafe.com/en/",
    partnerSlug: "paysafe",
    transactionFees: "2.29% - 2.9%",
    setupSpeed: "1-2 days",
    customerSupport: "24/7 Phone",
    paymentMethods: "260+",
    countries: "150+",
    businessTypes: ["ecommerce", "retail", "services"],
    markets: ["global", "eu"],
    fundingSpeed: 1.5,
    feeScore: 2,
  },
  {
    id: 3,
    name: "Worldpay",
    tagline: "Trusted by over 1 million merchants globally",
    logo: "/images/worldpay-logo.png",
    logoPlaceholder: "worldpay",
    features: [
      "Payment solutions for every size of business",
      "Available in 174+ countries",
      "99.89% payout success rate",
      "Advanced fraud protection included",
    ],
    rating: 8.6,
    ratingLabel: "Very Good",
    url: "https://www.worldpay.com/en",
    partnerSlug: "worldpay",
    transactionFees: "2.4% - 3.5%",
    setupSpeed: "2-3 days",
    customerSupport: "Business hours",
    paymentMethods: "120+",
    countries: "174+",
    businessTypes: ["retail", "ecommerce", "restaurant", "services"],
    markets: ["global", "us", "eu"],
    fundingSpeed: 2.5,
    feeScore: 3,
  },
  {
    id: 4,
    name: "Clover",
    tagline: "All-in-one payment system solution",
    logo: "/images/clover-logo.png",
    logoPlaceholder: "clover",
    features: [
      "Accept any payments - swipe, chip or tap",
      "60-day risk-free hardware trial",
      "Built-in inventory management",
      "Real-time sales analytics dashboard",
    ],
    rating: 8.8,
    ratingLabel: "Very Good",
    url: "https://www.clover.com/pos-systems/accept-payments",
    partnerSlug: "clover",
    transactionFees: "2.3% - 3.5%",
    setupSpeed: "Same day",
    customerSupport: "24/7 Chat",
    paymentMethods: "100+",
    countries: "USA only",
    businessTypes: ["retail", "restaurant"],
    markets: ["us"],
    fundingSpeed: 1,
    feeScore: 2,
  },
  {
    id: 5,
    name: "Stax",
    tagline: "Best for high-volume businesses",
    logo: "/images/stax-logo.png",
    logoPlaceholder: "stax",
    features: [
      "0% markup payment processing",
      "Subscription-based pricing built for savings",
      "Trusted by 30,000+ business owners",
      "All-in-one platform with reporting & invoicing",
    ],
    rating: 9.0,
    ratingLabel: "Excellent",
    url: "https://www.staxpayments.com/",
    partnerSlug: "stax",
    isTopPick: false,
    transactionFees: "Subscription + Interchange",
    setupSpeed: "1-2 days",
    customerSupport: "Phone, Online & Knowledge Base",
    paymentMethods: "All major types",
    countries: "USA, Canada",
    businessTypes: ["retail", "ecommerce", "restaurant", "services"],
    markets: ["us"],
    fundingSpeed: 1.5,
    feeScore: 1,
  },
];
