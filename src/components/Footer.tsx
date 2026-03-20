import { CreditCard } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="bg-foreground text-background py-6 sm:py-8"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand - Mobile Centered */}
        <div className="text-center mb-6 md:hidden">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 justify-center" aria-label="myPayAdvisor Home">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            <span className="text-lg font-bold">myPayAdvisor</span>
          </Link>
          <p className="text-xs text-background/70 max-w-xs mx-auto">
            Helping businesses find the perfect payment processing solution.
          </p>
        </div>

        {/* Main Footer Content - Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 mb-6">
          {/* Brand - Desktop */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2" aria-label="myPayAdvisor Home">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
              <span className="text-lg font-bold">myPayAdvisor</span>
            </Link>
            <p className="text-xs text-background/70">
              Helping businesses find the perfect payment processing solution.
            </p>
          </div>
          
          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="flex flex-col gap-1.5 text-xs list-none p-0 m-0">
              <li>
                <a href="#compare" className="hover:text-primary transition-colors">
                  Compare Processors
                </a>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-primary transition-colors">
                  Find Your Match
                </Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-primary transition-colors">
                  Payment Insights
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-primary transition-colors">
                  Fee Calculator
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold mb-3 text-sm">Legal</h3>
            <ul className="flex flex-col gap-1.5 text-xs list-none p-0 m-0">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <h3 className="font-semibold mb-3 text-sm">Contact</h3>
            <div className="flex flex-col gap-1.5 text-xs">
              <a 
                href="mailto:info@mypayadvisor.com" 
                className="hover:text-primary transition-colors"
                aria-label="Email us at info@mypayadvisor.com"
              >
                info@mypayadvisor.com
              </a>
            </div>
          </address>
        </div>

        {/* Mobile Links - Centered Single Column */}
        <nav className="md:hidden flex flex-col items-center gap-3 mb-6 text-xs" aria-label="Footer navigation">
          <a href="#compare" className="hover:text-primary transition-colors">
            Compare Processors
          </a>
          <Link href="/quiz" className="hover:text-primary transition-colors">
            Find Your Match
          </Link>
          <Link href="/insights" className="hover:text-primary transition-colors">
            Payment Insights
          </Link>
          <Link href="/calculator" className="hover:text-primary transition-colors">
            Fee Calculator
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <a 
            href="mailto:info@mypayadvisor.com" 
            className="hover:text-primary transition-colors"
            aria-label="Email us"
          >
            info@mypayadvisor.com
          </a>
        </nav>

        {/* Disclaimer */}
        <aside className="text-center border-t border-background/20 pt-3 sm:pt-4 mb-2 sm:mb-3">
          <p className="text-[10px] sm:text-xs text-background/50 max-w-5xl mx-auto px-2">
            <strong>Affiliate Disclosure:</strong> myPayAdvisor may receive compensation from payment providers featured on this site. This does not influence our rankings or recommendations.
          </p>
        </aside>

        {/* Copyright */}
        <div className="text-center text-[10px] sm:text-xs text-background/70">
          <p>© {currentYear} myPayAdvisor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
