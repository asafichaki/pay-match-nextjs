import { ClipboardList, Sparkles, CreditCard, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    number: "1",
    title: "Take the 90-Second Quiz",
    description: "Answer a few quick questions about your business, volume, and priorities.",
  },
  {
    icon: Sparkles,
    number: "2",
    title: "See Your Top Matches",
    description: "Our algorithm analyzes 50+ data points to find processors that fit your needs.",
  },
  {
    icon: CreditCard,
    number: "3",
    title: "Get Your Free Quote",
    description: "Connect directly with your matched processors and start saving immediately.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-muted/30" aria-labelledby="how-it-works-heading">
      <div className="section-container">
        <div className="text-center mb-10 md:mb-14">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Finding your perfect payment processor is simple, free, and takes less than 2 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connector arrow (desktop only, not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-4 z-10">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
                <step.icon className="h-8 w-8 text-primary" />
              </div>

              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Step {step.number}
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
