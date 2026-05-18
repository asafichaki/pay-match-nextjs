import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cershztbhyjnelcitszy.supabase.co",
      },
      {
        protocol: "https",
        hostname: "wwalwybnlztzdklowish.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      // Old /updates URLs -> new /pulse (rebrand 2026-05-07)
      { source: "/updates", destination: "/pulse", permanent: true },
      { source: "/updates/:slug*", destination: "/pulse/:slug*", permanent: true },

      // SEO consolidation 2026-05-15 — kill cannibalizing AI-autopilot long slugs
      // 5 long slugs semantically duplicating /comparisons hub
      { source: "/insights/payment-platform-comparison-2026-fees-features-and-best-fit-for-your-business", destination: "/comparisons", permanent: true },
      { source: "/insights/top-payment-platforms-compared-pricing-benchmarks-risk-factors-and-best-fit-scen", destination: "/comparisons", permanent: true },
      { source: "/insights/online-payment-processing-fees-comparison-2026-navigating-the-evolving-landscape", destination: "/comparisons", permanent: true },
      { source: "/insights/payment-processor-fees-conversion-rates-2026-merchant-evaluation", destination: "/comparisons", permanent: true },
      { source: "/insights/stripe-vs-square-vs-paypal-vs-helcim-vs-payment-depot-a-2026-merchant-fee-deep", destination: "/comparisons", permanent: true },

      // 2 long slugs duplicating /insights/payment-processor-negotiation-playbook
      { source: "/insights/lowering-merchant-account-fees-2026-pricing-cost-reduction-strategies", destination: "/insights/payment-processor-negotiation-playbook", permanent: true },
      { source: "/insights/reduce-merchant-account-fees-expert-strategies-pricing-insights-for-2026", destination: "/insights/payment-processor-negotiation-playbook", permanent: true },

      // 1 long slug duplicating /insights/high-risk-payment-processing-guide
      { source: "/insights/high-risk-merchant-processing-account-a-2026-guide-to-lowering-fees-thriving", destination: "/insights/high-risk-payment-processing-guide", permanent: true },

      // Chargeback duplicates — keep "solutions" (broader), 301 "software"
      { source: "/insights/chargeback-management-software-optimizing-merchant-profitability-in-2026", destination: "/insights/chargeback-management-solutions-a-merchant-s-guide-to-prevention-recovery", permanent: true },

      // 404 paths surfaced by QA sweep 2026-05-18 (rage-click hotspots in Clarity)
      { source: "/effective-rate-database", destination: "/data/effective-rates-2026", permanent: true },
      { source: "/tools", destination: "/calculator", permanent: true },

      // 6 frequently-typed-or-cited routes that 404 — point each at its closest live equivalent
      { source: "/about", destination: "/about/barak", permanent: true },
      { source: "/contact", destination: "/#brief-heading", permanent: true },
      { source: "/pricing", destination: "/comparisons", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/feed", destination: "/pulse/feed.xml", permanent: true },
      { source: "/rss", destination: "/pulse/feed.xml", permanent: true },
      { source: "/feed.xml", destination: "/pulse/feed.xml", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https://*.supabase.co blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
