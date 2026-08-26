import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { JsonLd } from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["700", "800"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mypayadvisor.com"),
  title: {
    default:
      "myPayAdvisor - Find the Perfect Payment Processor for Your Business",
    template: "%s | myPayAdvisor",
  },
  description:
    "Compare leading payment processors trusted by thousands of businesses. Find the best payment solution with transparent pricing, next-day funding, and 24/7 support. Save up to 40% on processing fees.",
  keywords: [
    "payment processor comparison",
    "payment gateway",
    "credit card processing",
    "merchant services",
    "payment solutions",
    "transaction fees",
    "payment processing rates",
    "best payment processor 2026",
    "merchant account",
    "POS system",
  ],
  authors: [{ name: "myPayAdvisor" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // No global alternates.canonical here: a root default made every route that
  // did not override it (e.g. /privacy, /terms) canonicalize to the homepage.
  // Each page sets its own canonical; the homepage does in (public)/page.tsx.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/",
    title:
      "myPayAdvisor - Find the Perfect Payment Processor for Your Business",
    description:
      "Compare leading payment processors and find the best solution for your business. Save up to 40% on processing fees with transparent pricing and expert analysis.",
    images: [
      {
        url: "/og-logo.png",
        width: 1200,
        height: 630,
        alt: "myPayAdvisor - Payment Processor Comparison Platform",
      },
    ],
    siteName: "myPayAdvisor",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "myPayAdvisor - Find the Perfect Payment Processor",
    description:
      "Compare payment processors and save up to 40% on processing fees. Transparent pricing, expert reviews.",
    images: ["/og-logo.png"],
    creator: "@mypayadvisor",
    site: "@mypayadvisor",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "myPayAdvisor",
    "application-name": "myPayAdvisor",
    "msapplication-TileColor": "#2D8C8C",
    language: "English",
    "geo.region": "US",
    "geo.placename": "United States",
    "content-language": "en-US",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D8C8C",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "myPayAdvisor",
  alternateName: ["my Pay Advisor", "MyPayAdvisor"],
  url: "https://www.mypayadvisor.com",
  description:
    "Independent payment processor comparison and advisory service helping businesses find the best payment solutions",
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.mypayadvisor.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.mypayadvisor.com/#organization",
  name: "myPayAdvisor",
  url: "https://www.mypayadvisor.com",
  logo: {
    "@type": "ImageObject",
    "@id": "https://www.mypayadvisor.com/#logo",
    url: "https://www.mypayadvisor.com/og-logo.png",
    width: 512,
    height: 512,
  },
  description:
    "Expert payment processing advisory and comparison platform helping businesses find the best payment solutions",
  foundingDate: "2024",
  sameAs: [
    "https://www.linkedin.com/company/mypayadvisor",
    "https://www.crunchbase.com/organization/mypayadvisor",
    "https://www.wikidata.org/wiki/Q139731888",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@mypayadvisor.com",
    contactType: "customer service",
    availableLanguage: "English",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  knowsAbout: [
    "Payment Processing",
    "Credit Card Processing",
    "Merchant Services",
    "Payment Gateways",
    "POS Systems",
  ],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.mypayadvisor.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "myPayAdvisor",
  url: "https://www.mypayadvisor.com",
  description:
    "Free payment processor comparison and recommendation service",
  priceRange: "Free",
  image: "https://www.mypayadvisor.com/og-logo.png",
  serviceType: "Payment Processing Advisory",
  areaServed: "United States",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${sourceSerif.variable} ${inter.className}`}>
      <head>
        <JsonLd data={websiteSchema} />
        <JsonLd data={organizationSchema} />
        <JsonLd data={professionalServiceSchema} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-[100]"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <Toaster />
        <Sonner />
        {/* Third-party analytics deferred to lazyOnload (after LCP/onload) — saves ~800ms TBT on mobile */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MDTFETTH7E"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MDTFETTH7E');`}
        </Script>
        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wsoc2oyogw");`}
        </Script>
        {/* GTM container GTM-KWVVGK29 removed 2026-05-30: it only duplicated the
            GA4 property G-MDTFETTH7E (loaded directly above) and hosted no other
            tags or dataLayer events, causing double-counted pageviews/events.
            Single GA4 path now; funnel events fire via gtag() (see lib/analytics/track). */}
      </body>
    </html>
  );
}
