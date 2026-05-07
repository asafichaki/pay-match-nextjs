"use client";

import { CreditCard, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasHighSeverity, setHasHighSeverity] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data } = await (supabase as any)
        .from("updates_feed")
        .select("id")
        .eq("status", "published")
        .eq("severity", "high")
        .gte("published_at", since)
        .limit(1);
      if (!cancelled) setHasHighSeverity(Array.isArray(data) && data.length > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGetOffers = () => {
    openSortingHat();
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
            <span className="text-2xl font-display font-bold text-foreground tracking-tight">myPayAdvisor</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 ml-auto mr-6" role="menubar">
            <Link
              href="/"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Go to homepage"
            >
              Home
            </Link>
            <Link
              href="/comparisons"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Payment processor comparisons"
            >
              Comparisons
            </Link>
            <Link
              href="/insights"
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Read payment processing insights and guides"
            >
              Insights
            </Link>
            <Link
              href="/pulse"
              className="relative text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              role="menuitem"
              aria-label="Live payments pulse — rate moves and industry updates"
            >
              Pulse
              {hasHighSeverity && (
                <span
                  className="absolute -top-1 -right-2 inline-block h-2 w-2 rounded-full bg-rose-500"
                  aria-label="High-severity update in last 48 hours"
                />
              )}
            </Link>
            <button
              onClick={() => handleScrollToSection('faq')}
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
              role="menuitem"
              aria-label="Frequently asked questions"
            >
              FAQ
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="cta"
              className="font-semibold flex-shrink-0"
              onClick={handleGetOffers}
              aria-label="Find your perfect payment processor match"
            >
              Find My Match
            </Button>
          </div>

          {/* Mobile Quiz Button + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="cta"
              size="sm"
              className="font-semibold text-sm"
              onClick={handleGetOffers}
            >
              Find Match
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
                <Link
                  href="/pulse"
                  className="relative inline-flex items-center gap-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pulse
                  {hasHighSeverity && (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-rose-500"
                      aria-label="High-severity update in last 48 hours"
                    />
                  )}
                </Link>
                <button
                  onClick={() => handleScrollToSection('faq')}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left bg-transparent border-none cursor-pointer"
                >
                  FAQ
                </button>
                <Button variant="cta" className="font-semibold w-full mt-4" onClick={handleGetOffers}>
                  Find My Match
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
