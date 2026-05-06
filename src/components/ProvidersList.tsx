"use client";
import { useMemo } from "react";
import ProviderCard from "./ProviderCard";
import { useCmsProviders } from "@/hooks/useCmsProviders";

export default function ProvidersList() {
  const { providers, loading, error } = useCmsProviders();

  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      if (a.is_top_pick && !b.is_top_pick) return -1;
      if (!a.is_top_pick && b.is_top_pick) return 1;
      return a.display_order - b.display_order;
    });
  }, [providers]);

  // Generate ItemList schema for providers
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Payment Processors 2026",
    description: "Curated list of top-rated payment processors for businesses",
    numberOfItems: sortedProviders.length,
    itemListElement: sortedProviders.map((provider, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: provider.name,
        description: provider.tagline,
        brand: {
          "@type": "Brand",
          name: provider.name,
        },
        offers: {
          "@type": "Offer",
          description: provider.transaction_fees,
          priceCurrency: "USD",
        },
      },
    })),
  };

  if (loading) {
    return (
      <section
        id="compare"
        className="py-6 sm:py-12 md:py-16 bg-background"
        aria-labelledby="providers-heading"
        aria-busy="true"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 id="providers-heading" className="sr-only">
            Loading Payment Processors
          </h2>
          <div className="space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse" role="status">
                <div className="bg-muted rounded-lg h-40 md:h-48"></div>
                <span className="sr-only">Loading provider {i}...</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="compare" className="py-6 sm:py-12 md:py-16 bg-muted/50" aria-labelledby="providers-heading">
      {/* Inject ItemList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center mb-8 md:mb-12">
          <h2 id="providers-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Compare Top Payment Processors
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked and independently reviewed. Find the processor that fits your business.
          </p>
        </header>

        <div
          className="space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl mx-auto"
          role="list"
          aria-label="Payment processor comparison list"
        >
          {sortedProviders.length > 0 ? (
            sortedProviders.map((provider, index) => (
              <article key={provider.id} role="listitem" itemScope itemType="https://schema.org/Product">
                <meta itemProp="position" content={String(index + 1)} />
                <ProviderCard
                  provider={{
                    id: index + 1,
                    name: provider.name,
                    tagline: provider.tagline,
                    logo: provider.logo,
                    logoUrl: provider.logo_url,
                    logoPlaceholder: provider.logo_placeholder,
                    features: provider.features,
                    rating: provider.rating,
                    ratingLabel: provider.rating_label,
                    url: provider.url,
                    isTopPick: provider.is_top_pick,
                  }}
                />
              </article>
            ))
          ) : (
            <div className="text-center py-12" role="status">
              <p className="text-muted-foreground text-base sm:text-lg px-4">
                No providers available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
