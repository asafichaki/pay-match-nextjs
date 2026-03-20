"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { faqs } from "@/data/faqs";
import PaymentQuiz from "./PaymentQuiz";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQ = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <section
      id="faq"
      className="section-padding bg-muted/30"
      aria-labelledby="faq-heading"
    >
      <div className="section-container">
        <header className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3"
          >
            Common Questions About Payment Processors
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to the most common questions about choosing, switching, and optimizing your payment processing.
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

          {/* Inline quiz CTA */}
          <div className="mt-8 text-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-base font-medium text-foreground mb-3">
              Still comparing? Let us match you in 90 seconds.
            </p>
            <Button onClick={() => setQuizOpen(true)} className="font-semibold">
              Find My Perfect Match
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </section>
  );
};

export default FAQ;
