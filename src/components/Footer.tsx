import { CreditCard, Shield, Lock } from "lucide-react";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-foreground text-background py-10 sm:py-14"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Top section: Brand + Newsletter */}
        <div className="grid md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-background/15">
          {/* Brand + About */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3" aria-label="myPayAdvisor Home">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
              <span className="text-lg font-display font-bold">myPayAdvisor</span>
            </Link>
            <p className="text-sm text-background/70 max-w-md mb-4">
              We help businesses find the payment processor that fits their needs. Our independent comparison platform analyzes pricing, features, and support to match you with the right solution - completely free.
            </p>
            <div className="flex items-center gap-4 text-xs text-background/50">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Free & Unbiased</span>
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Bank-Level Security</span>
            </div>
          </div>

          {/* Footer Newsletter */}
          <div>
            <h3 className="font-display font-bold text-sm mb-3">Get Payment Processing Tips</h3>
            <p className="text-xs text-background/70 mb-4">
              Weekly insights on saving money, avoiding hidden fees, and choosing the right processor.
            </p>
            <NewsletterForm source="footer" variant="compact" />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-xs list-none p-0 m-0">
              <li>
                <Link href="/comparisons" className="text-background/70 hover:text-primary transition-colors">
                  Compare Processors
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-background/70 hover:text-primary transition-colors">
                  Find Your Match
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-background/70 hover:text-primary transition-colors">
                  Payment Insights
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-background/70 hover:text-primary transition-colors">
                  Fee Calculator
                </Link>
              </li>
            </ul>
          </nav>

          {/* Comparisons */}
          <nav aria-label="Comparison pages">
            <h3 className="font-semibold mb-3 text-sm">Comparisons</h3>
            <ul className="flex flex-col gap-2 text-xs list-none p-0 m-0">
              <li>
                <Link href="/comparisons/stripe-vs-paypal" className="text-background/70 hover:text-primary transition-colors">
                  Stripe vs PayPal
                </Link>
              </li>
              <li>
                <Link href="/comparisons/square-vs-stripe" className="text-background/70 hover:text-primary transition-colors">
                  Square vs Stripe
                </Link>
              </li>
              <li>
                <Link href="/comparisons/best-payment-processors-2026" className="text-background/70 hover:text-primary transition-colors">
                  Best Processors 2026
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold mb-3 text-sm">Legal</h3>
            <ul className="flex flex-col gap-2 text-xs list-none p-0 m-0">
              <li>
                <Link href="/terms" className="text-background/70 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-background/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <h3 className="font-semibold mb-3 text-sm">Contact</h3>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="mailto:info@mypayadvisor.com"
                className="text-background/70 hover:text-primary transition-colors"
              >
                info@mypayadvisor.com
              </a>
            </div>
          </address>
        </div>

        {/* Disclaimer */}
        <aside className="text-center border-t border-background/15 pt-6 mb-3">
          <p className="text-[10px] sm:text-xs text-background/40 max-w-5xl mx-auto">
            <strong>Affiliate Disclosure:</strong> myPayAdvisor may receive compensation from payment providers featured on this site. Compensation may affect where and how providers appear. We recommend confirming rates and terms directly with any provider before signing.
          </p>
        </aside>

        {/* Copyright */}
        <div className="text-center text-[10px] sm:text-xs text-background/50">
          <p>&copy; {currentYear} myPayAdvisor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
