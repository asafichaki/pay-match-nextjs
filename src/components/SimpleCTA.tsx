"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import PaymentQuiz from "./PaymentQuiz";

const SimpleCTA = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <section className="py-10 sm:py-14 px-4">
      <div className="flex justify-center">
        <Button 
          onClick={() => setQuizOpen(true)}
          size="lg" 
          className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Start Free Assessment
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
      
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </section>
  );
};

export default SimpleCTA;
