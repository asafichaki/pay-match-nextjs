import { Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="section-padding bg-muted/50" aria-labelledby="newsletter-heading">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <h2 id="newsletter-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Stay Ahead on Payment Processing
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join smart business owners who save on processing fees. Get weekly rate updates, industry insights, and exclusive deals.
          </p>

          <NewsletterForm source="homepage" />
        </div>
      </div>
    </section>
  );
}
