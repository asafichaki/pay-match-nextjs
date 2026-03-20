import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const FeaturedArticles = () => {
  const articles = [
    {
      title: "Complete Guide to Choosing a Payment Gateway",
      description: "Master the art of selecting the perfect payment gateway with our comprehensive guide.",
      link: "/insights/best-payment-gateway-ecommerce",
    },
    {
      title: "How Credit Card Processing Fees Work",
      description: "Demystify the complex world of credit card processing with our detailed breakdown.",
      link: "/insights/credit-card-processing-fees-explained",
    },
    {
      title: "Best Payment Processors for 2026",
      description: "Compare the leading payment processors and find the best fit for your business.",
      link: "/comparisons/best-payment-processors-2026",
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Payment Processing Insights
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Learn from industry experts and make informed decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          {articles.map((article, index) => (
            <Link
              key={index}
              href={article.link}
              className="group block p-6 sm:p-7 md:p-8 rounded-2xl border border-border/50 bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center md:text-left"
            >
              <div className="mb-4 sm:mb-5 md:mb-6 flex justify-center md:justify-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                {article.description}
              </p>
              
              <div className="flex items-center justify-center md:justify-start text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors">
                Read More
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="group"
          >
            <Link href="/quiz">
              Find Your Perfect Processor
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
