import { AlertTriangle, TrendingDown, Clock, Ban } from "lucide-react";

const problems = [
  {
    icon: TrendingDown,
    title: "Hidden Fees",
    description: "The average business overpays $2,400/year in unnecessary processing fees they don't even know about.",
  },
  {
    icon: Clock,
    title: "Wasted Time",
    description: "Researching and comparing processors manually takes 15+ hours. Most businesses give up and pick the first one.",
  },
  {
    icon: Ban,
    title: "Lock-in Contracts",
    description: "67% of businesses are stuck in contracts with early termination fees, paying more than they should.",
  },
];

export default function ProblemSection() {
  return (
    <section className="section-padding bg-background" aria-labelledby="problem-heading">
      <div className="section-container">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-warning bg-warning/10 px-4 py-1.5 rounded-full mb-4">
            <AlertTriangle className="h-4 w-4" />
            The Hidden Cost of Choosing Wrong
          </div>
          <h2 id="problem-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            Is Your Payment Processor Costing You Thousands?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {problems.map((problem) => (
            <div key={problem.title} className="text-center p-6 md:p-8 rounded-2xl bg-muted/50 border border-border/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
