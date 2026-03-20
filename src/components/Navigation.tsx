"use client";

import { CreditCard, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentQuiz from "./PaymentQuiz";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navigation = () => {
  const router = useRouter();
  const [quizOpen, setQuizOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetOffers = () => {
    setQuizOpen(true);
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    router.push('/');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <nav 
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="myPayAdvisor - Home"
          >
            <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-foreground">myPayAdvisor</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 ml-auto mr-6" role="menubar">
            <Link 
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Go to homepage"
            >
              Home
            </Link>
            <button 
              onClick={() => handleScrollToSection('testimonials')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
              role="menuitem"
              aria-label="View customer testimonials"
            >
              Testimonials
            </button>
            <button 
              onClick={() => handleScrollToSection('faq')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
              role="menuitem"
              aria-label="Frequently asked questions"
            >
              FAQ
            </button>
            <Link 
              href="/comparisons" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Payment processor comparisons"
            >
              Comparisons
            </Link>
            <Link 
              href="/insights" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Read payment processing insights and guides"
            >
              Insights
            </Link>
            <button 
              onClick={() => handleScrollToSection('about')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
              role="menuitem"
              aria-label="About myPayAdvisor"
            >
              About Us
            </button>
          </div>

          <Button 
            className="hidden md:block font-semibold flex-shrink-0" 
            onClick={handleGetOffers}
            aria-label="Get custom payment processor offers"
          >
            Get Custom Offers
          </Button>

          {/* Mobile Quiz Button + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              size="sm"
              className="font-semibold text-sm"
              onClick={handleGetOffers}
              aria-label="Get custom payment processor offers"
            >
              Get Offers
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]" aria-label="Mobile navigation">
              <nav className="flex flex-col gap-6 mt-8" role="navigation" aria-label="Mobile menu">
                <Link 
                  href="/"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <button 
                  onClick={() => handleScrollToSection('testimonials')}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left bg-transparent border-none cursor-pointer"
                >
                  Testimonials
                </button>
                <button 
                  onClick={() => handleScrollToSection('faq')}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left bg-transparent border-none cursor-pointer"
                >
                  FAQ
                </button>
                <Link 
                  href="/comparisons" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Comparisons
                </Link>
                <Link 
                  href="/insights" 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Insights
                </Link>
                <button 
                  onClick={() => handleScrollToSection('about')}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left bg-transparent border-none cursor-pointer"
                >
                  About Us
                </button>
                <Button className="font-semibold w-full mt-4" onClick={handleGetOffers}>
                  Get Custom Offers
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </nav>
      
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </header>
  );
};

export default Navigation;
