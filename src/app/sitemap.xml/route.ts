export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage - Highest Priority -->
  <url>
    <loc>https://www.mypayadvisor.com/</loc>
    <lastmod>2025-12-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://www.mypayadvisor.com/og-logo.png</image:loc>
      <image:title>myPayAdvisor Logo</image:title>
      <image:caption>myPayAdvisor - Payment Processor Comparison Platform</image:caption>
    </image:image>
  </url>

  <!-- About Us Section -->
  <url>
    <loc>https://www.mypayadvisor.com/#about</loc>
    <lastmod>2025-12-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Quiz Page - High Priority Conversion Page -->
  <url>
    <loc>https://www.mypayadvisor.com/quiz</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Fee Calculator Tool -->
  <url>
    <loc>https://www.mypayadvisor.com/calculator</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- Insights Hub -->
  <url>
    <loc>https://www.mypayadvisor.com/insights</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Comparisons Hub -->
  <url>
    <loc>https://www.mypayadvisor.com/comparisons</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Comparison Articles -->
  <url>
    <loc>https://www.mypayadvisor.com/comparisons/square-vs-stripe</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/comparisons/paypal-vs-square</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/comparisons/stripe-vs-paypal</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/comparisons/helcim-vs-stripe</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/comparisons/best-payment-processors-2026</loc>
    <lastmod>2026-01-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.95</priority>
  </url>

  <!-- Insight Articles -->
  <url>
    <loc>https://www.mypayadvisor.com/insights/online-vs-instore-payments</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/helcim-review-2025</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/payment-processor-fees-guide</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/best-payment-gateway-ecommerce</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/credit-card-processing-fees-explained</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/high-risk-payment-processing-guide</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/small-business-credit-card-processing-guide</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/merchant-statement-audit-guide</loc>
    <lastmod>2025-12-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/how-to-read-merchant-statement</loc>
    <lastmod>2025-12-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/merchant-services-glossary</loc>
    <lastmod>2025-12-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/level-2-level-3-processing-guide</loc>
    <lastmod>2025-12-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/insights/merchant-contract-cancellation-guide</loc>
    <lastmod>2025-12-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>https://www.mypayadvisor.com/privacy</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://www.mypayadvisor.com/terms</loc>
    <lastmod>2025-12-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
