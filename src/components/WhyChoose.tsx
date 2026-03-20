import { Globe, Shield, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const WhyChoose = () => {
  const benefits = [
    {
      icon: Globe,
      title: "Global Payment Acceptance",
      description: "Accept payments from customers worldwide in 135+ currencies with local payment methods"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "PCI DSS Level 1 compliant with advanced fraud protection and 3D Secure authentication"
    },
    {
      icon: TrendingUp,
      title: "Scale Your Business",
      description: "Grow seamlessly from startup to enterprise with flexible pricing and volume discounts"
    },
    {
      icon: Zap,
      title: "Fast Setup & Funding",
      description: "Get up and running in 24-48 hours with next-day funding and expert onboarding support"
    }
  ];

  return (
    <section 
      className="py-8 sm:py-10 md:py-12 px-4"
      aria-labelledby="why-choose-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8 sm:mb-10">
          <h2 
            id="why-choose-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 sm:mb-4"
          >
            Why Choose Our Recommended Payment Processors
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Every payment processor in our network is carefully vetted to ensure they meet the highest standards for security, reliability, and value
          </p>
        </header>

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto"
          role="list"
          aria-label="Key benefits of our recommended payment processors"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article 
                key={benefit.title} 
                role="listitem"
                className="h-full"
              >
                <Card className="border-border shadow-md h-full bg-card">
                  <CardContent className="pt-6 pb-5 px-5 text-center">
                    <div 
                      className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                      aria-hidden="true"
                    >
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
