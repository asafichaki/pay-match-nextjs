import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Card, CardContent } from "./ui/card";

const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="section-padding bg-accent"
      aria-labelledby="testimonials-heading"
    >
      <div className="section-container">
        <header className="text-center mb-8 md:mb-12">
          <h2
            id="testimonials-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3"
          >
            Trusted by Business Owners Like You
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            See how businesses found their perfect payment match and started saving.
          </p>
        </header>

        <div 
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          role="list"
          aria-label="Customer testimonials"
        >
          {testimonials.map((testimonial) => (
            <article 
              key={testimonial.id} 
              role="listitem"
              itemScope 
              itemType="https://schema.org/Review"
            >
              <Card className="bg-card hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 text-center md:text-left">
                  <div 
                    className="flex gap-1 mb-4 justify-center md:justify-start"
                    role="img"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" aria-hidden="true" />
                    ))}
                    <meta itemProp="reviewRating" content={String(testimonial.rating)} />
                  </div>
                  
                  <blockquote 
                    className="text-foreground mb-6 italic leading-relaxed text-center md:text-left"
                    itemProp="reviewBody"
                  >
                    "{testimonial.quote}"
                  </blockquote>

                  <footer className="border-t pt-4">
                    <cite className="not-italic">
                      <p className="font-semibold text-foreground" itemProp="author">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </cite>
                  </footer>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
