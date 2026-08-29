import Link from "next/link";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { providers } from "@/data/providers";
import { AffiliateLink } from "@/components/AffiliateLink";

interface RelatedArticle {
  title: string;
  href: string;
}

interface ArticleSidebarProps {
  currentSlug?: string;
}

const insightArticles: RelatedArticle[] = [
  { title: "Credit Card Processing Fees Explained", href: "/insights/credit-card-processing-fees-explained" },
  { title: "Payment Processor Fees Guide 2025", href: "/insights/payment-processor-fees-guide" },
  { title: "Best Payment Gateway for Ecommerce", href: "/insights/best-payment-gateway-ecommerce" },
  { title: "Helcim Review 2025", href: "/insights/helcim-review-2025" },
  { title: "Online vs In-Store Payments", href: "/insights/online-vs-instore-payments" },
];

const comparisonArticles: RelatedArticle[] = [
  { title: "Square vs Stripe", href: "/comparisons/square-vs-stripe" },
  { title: "PayPal vs Square", href: "/comparisons/paypal-vs-square" },
  { title: "Stripe vs PayPal", href: "/comparisons/stripe-vs-paypal" },
  { title: "Helcim vs Stripe", href: "/comparisons/helcim-vs-stripe" },
];

const ArticleSidebar = ({ currentSlug }: ArticleSidebarProps) => {
  const topProviders = providers.slice(0, 5);
  
  // Filter out current article from related articles
  const filteredInsights = insightArticles.filter(a => a.href !== currentSlug).slice(0, 3);
  const filteredComparisons = comparisonArticles.filter(a => a.href !== currentSlug).slice(0, 3);

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Top Providers */}
        <div className="border border-border rounded-xl p-6 bg-background shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Best Payment Processors
          </h3>
          
          <div className="divide-y divide-border">
            {topProviders.map((provider, index) => (
              <AffiliateLink
                key={provider.id}
                partner={provider.partnerSlug}
                from={currentSlug}
                title={`Visit ${provider.name}`}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-all duration-200"
              >
                <span className="text-lg font-bold text-muted-foreground/60 w-6">
                  {index + 1}.
                </span>
                {provider.logo ? (
                  <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center p-1.5 group-hover:bg-muted/50 transition-colors">
                    <img 
                      src={provider.logo} 
                      alt={provider.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold group-hover:bg-primary/20 transition-colors">
                    {provider.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {provider.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">{provider.rating}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </AffiliateLink>
            ))}
          </div>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 mt-6 py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
          >
            Compare All Processors
          </Link>
        </div>

        {/* Related Articles */}
        <div className="border border-border rounded-lg p-5 bg-background">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Must Read
          </h3>
          
          <div className="space-y-4">
            {filteredInsights.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="block group"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </p>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 mt-1">
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
          
          {filteredComparisons.length > 0 && (
            <>
              <div className="border-t border-border my-4" />
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Comparisons
              </h4>
              <div className="space-y-3">
                {filteredComparisons.map((article) => (
                  <Link
                    key={article.href}
                    href={article.href}
                    className="block group"
                  >
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
          
          <Link 
            href="/insights"
            className="flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
          >
            See all articles <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
