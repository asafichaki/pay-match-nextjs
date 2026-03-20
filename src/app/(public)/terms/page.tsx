import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <article className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </div>

            <div className="prose prose-slate max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using myPayAdvisor, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use our service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. Use of Service</h2>
                <p className="text-muted-foreground">
                  myPayAdvisor provides information and recommendations about payment processing solutions. Our service is designed to help businesses make informed decisions about payment providers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Affiliate Disclosure</h2>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Important Disclosure</h3>
                  <p className="text-muted-foreground">
                    myPayAdvisor may receive compensation from payment providers featured on our website. This compensation may influence:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>The order in which providers appear on our website</li>
                    <li>The prominence given to certain providers</li>
                    <li>The recommendations made through our quiz and comparison tools</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We strive to provide accurate and unbiased information, but our commercial relationships may affect our content. We recommend that you conduct your own research and due diligence before selecting a payment provider.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Information Accuracy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    While we make every effort to ensure the information on myPayAdvisor is accurate and up-to-date, payment processing fees, terms, and conditions can change frequently. The information provided on our website:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>May not reflect the most current pricing or terms</li>
                    <li>Is subject to change without notice</li>
                    <li>May vary based on your specific business circumstances</li>
                    <li>Should be verified directly with the payment provider</li>
                  </ul>
                  <p>
                    We are not responsible for any discrepancies between information on our site and actual provider terms.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. No Guarantee of Results</h2>
                <p className="text-muted-foreground">
                  The recommendations and information provided on myPayAdvisor are for informational purposes only. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>That any particular payment provider will accept your application</li>
                  <li>Specific pricing or terms for your business</li>
                  <li>That our recommendations will be suitable for your specific needs</li>
                  <li>Any particular outcome from using recommended services</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  When you click on links to payment providers or submit information through our forms, you may be directed to third-party websites. These third-party sites have their own terms and conditions and privacy policies. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>The content or practices of third-party websites</li>
                  <li>How third parties use your information</li>
                  <li>The terms and conditions of third-party services</li>
                  <li>Any disputes between you and third-party providers</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the fullest extent permitted by law, myPayAdvisor shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Your use or inability to use our service</li>
                  <li>Any inaccuracy or incompleteness of information on our website</li>
                  <li>Your interactions with third-party payment providers</li>
                  <li>Any decisions made based on information from our website</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms and Conditions on this page. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  <a href="mailto:info@mypayadvisor.com" className="text-primary hover:underline">
                    info@mypayadvisor.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
