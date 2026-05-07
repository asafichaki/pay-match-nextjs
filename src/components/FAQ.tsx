"use client";

import { ArrowRight, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { faqs } from "@/data/faqs";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";
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
      className="relative bg-background border-y border-border scroll-mt-20 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Decorative gradient orb */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[0.9fr_1.4fr] gap-7 sm:gap-10 lg:gap-16">
          {/* Left rail — sticky on desktop */}
          <aside className="lg:sticky lg:top-24 lg:self-start text-center lg:text-left">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] font-bold text-primary mb-3 sm:mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              Frequently asked
            </p>
            <h2
              id="faq-heading"
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] sm:leading-[1.05] mb-3 sm:mb-5"
            >
              Quick answers,{" "}
              <span className="text-primary">straight from the desk.</span>
            </h2>
            <p className="text-sm sm:text-base text-foreground/70 leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
              Pricing models, switching costs, hidden fees, what the shortlist covers.
            </p>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Don&rsquo;t see your question?
                  </p>
                  <p className="text-xs text-foreground/65 leading-relaxed">
                    Start the four-step intake. The reply usually addresses it
                    in the first email.
                  </p>
                </div>
              </div>
              <Button
                variant="cta"
                size="sm"
                onClick={() => openSortingHat()}
                className="w-full font-semibold"
              >
                Start the intake
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </aside>

          {/* Right column — accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={`item-${faq.id}`}
                  className="group border border-border rounded-2xl bg-card overflow-hidden transition-colors hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:bg-background data-[state=open]:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]"
                >
                  <AccordionTrigger
                    className="px-5 sm:px-6 py-5 text-left hover:no-underline data-[state=open]:pb-3"
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-start gap-4 pr-2">
                      <span className="hidden sm:inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold tabular-nums mt-0.5 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        itemProp="name"
                        className="text-base sm:text-lg font-semibold text-foreground leading-snug"
                      >
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent
                    id={`faq-answer-${faq.id}`}
                    className="px-5 sm:px-6 pb-6 sm:pl-[60px]"
                  >
                    <span
                      itemProp="text"
                      className="block text-base text-foreground/80 leading-relaxed"
                    >
                      {faq.answer}
                    </span>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
