import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
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
              <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </div>

            <div className="prose prose-slate max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  When you use myPayAdvisor, we may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                  <li><strong>Business Information:</strong> Business type, industry, payment processing volume</li>
                  <li><strong>Quiz Responses:</strong> Answers to questions about your payment processing needs</li>
                  <li><strong>Usage Data:</strong> How you interact with our website, pages visited, time spent</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide personalized payment provider recommendations</li>
                  <li>Connect you with suitable payment processing solutions</li>
                  <li>Improve our service and user experience</li>
                  <li>Send you information about payment providers (if you opt-in)</li>
                  <li>Analyze website usage and trends</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Third-Party Sharing</h3>
                  <p className="text-muted-foreground">
                    When you submit information through our quiz or contact forms, we may share your information with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Payment Providers:</strong> We share your information with payment providers you express interest in</li>
                    <li><strong>Service Providers:</strong> Third-party services that help us operate our website</li>
                    <li><strong>Marketing Partners:</strong> Companies that may contact you about relevant services</li>
                  </ul>
                  <p className="text-muted-foreground">
                    By using our service, you consent to this information sharing.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">4. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve our services and user experience</li>
                  <li>Track referrals and affiliate relationships</li>
                </ul>
                <p className="text-muted-foreground">
                  You can control cookies through your browser settings, but some features of our website may not function properly if cookies are disabled.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement reasonable security measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">6. Your Rights</h2>
                <p className="text-muted-foreground">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to opt-out of marketing communications</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-muted-foreground">
                  To exercise these rights, please contact us through our website.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">7. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our website contains links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">8. Children&apos;s Privacy</h2>
                <p className="text-muted-foreground">
                  Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">9. Changes to Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
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
