import { faqs } from "@/data/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQ = () => {
  return (
    <section 
      id="faq" 
      className="py-6 sm:py-12 md:py-16 bg-muted/30"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 
            id="faq-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Quick answers to common questions about payment processing, fees, and choosing the right provider for your business.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <Accordion 
            type="single" 
            collapsible 
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={`item-${faq.id}`}
                className="border-0 rounded-2xl px-5 sm:px-6 bg-background shadow-sm"
              >
                <AccordionTrigger 
                  className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-5"
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span itemProp="name">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent 
                  id={`faq-answer-${faq.id}`}
                  className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-5"
                >
                  <span itemProp="text">{faq.answer}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
