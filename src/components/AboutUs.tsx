import { Users, TrendingUp, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            About Us
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            myPayAdvisor helps you find the payment processor that best fits your business needs. 
            We simplify the comparison process so you can make an informed decision and choose the right solution for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Business-Focused</h3>
            <p className="text-sm text-muted-foreground">
              Our recommendations are tailored to your specific business type, volume, and requirements.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Data-Driven Analysis</h3>
            <p className="text-sm text-muted-foreground">
              We continuously analyze pricing, features, and user feedback to keep our comparisons accurate.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Expert Knowledge</h3>
            <p className="text-sm text-muted-foreground">
              Our team has years of experience in fintech and payment processing industry.
            </p>
          </div>
        </div>

        <article className="max-w-3xl mx-auto">
          <div className="bg-background rounded-xl p-8 shadow-sm border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground mb-4">
              At myPayAdvisor, we believe that every business deserves access to fair, transparent payment processing. 
              The payment processing industry can be confusing with hidden fees, complex pricing structures, and aggressive sales tactics.
            </p>
            <p className="text-muted-foreground mb-4">
              Our mission is to cut through the noise and provide clear, actionable guidance that helps businesses of all sizes, from 
              startups and small businesses to enterprise organizations, find payment solutions that truly fit their needs and budget.
            </p>
            <p className="text-muted-foreground">
              Whether you're looking for the lowest transaction fees, the best e-commerce integration, or specialized 
              high-risk merchant accounts, we're here to guide you every step of the way.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default AboutUs;
