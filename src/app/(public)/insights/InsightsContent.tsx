import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  keywords: string[];
}

function ArticleItem({ article }: { article: Article }) {
  return (
    <Link href={article.slug} className="group block py-8 first:pt-4">
      <article className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{article.date}</span>
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            Read article
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function InsightsContent({ articles }: { articles: Article[] }) {
  return (
    <>
      {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-background border-b border-border/50"
          aria-labelledby="insights-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 items-center">
              {/* Text content - left side */}
              <div className="relative py-8 md:py-10 lg:py-12 pr-4 lg:pr-8">
                {/* Gray extension under text area */}
                <div
                  className="absolute -bottom-4 -left-20 right-0 h-24 bg-gradient-to-t from-muted/40 via-muted/20 to-transparent lg:block hidden"
                  aria-hidden="true"
                />
                <header className="space-y-2 sm:space-y-3 relative z-10 text-center md:text-left">
                  <h1
                    id="insights-heading"
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight"
                  >
                    Payment Processing{" "}
                    <span className="text-primary">Insights</span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl hidden md:block">
                    In-depth guides and expert analysis to help you optimize payment
                    processing, reduce costs, and choose the right provider for your business.
                  </p>

                  <div className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span>Expert Guides & Analysis</span>
                  </div>
                </header>
              </div>

              {/* Image - right side */}
              <div className="relative hidden lg:block h-full min-h-[300px]">
                {/* Image container */}
                <div
                  className="absolute inset-0 bg-cover bg-center brightness-105"
                  style={{
                    backgroundImage: `url(/images/insights-hero-new.png)`,
                    backgroundPosition: 'center center'
                  }}
                  aria-hidden="true"
                />
                {/* Gradient fade on left edge */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-background via-background/40 via-10% to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Articles List */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="divide-y divide-border">
              {articles.map((article) => (
                <ArticleItem key={article.id} article={article} />
              ))}
            </div>

            {/* Quiz CTA */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Not Sure Which Processor to Choose?
                    </h3>
                    <p className="text-muted-foreground">
                      Take our free 2-minute assessment to get a personalized recommendation based on your business needs.
                    </p>
                  </div>

                  <Link href="/quiz" className="shrink-0">
                    <button className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Start Free Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
