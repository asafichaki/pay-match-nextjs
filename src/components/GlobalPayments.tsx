import { TrendingUp, Globe } from "lucide-react";

const globalPaymentsImage = "/images/global-payments.png";

const GlobalPayments = () => {
  return (
    <section className="py-6 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              The Future of Global Payments
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              The payment landscape is evolving faster than ever. Businesses that adapt to new technologies gain a significant competitive edge, from reaching global customers to improving cash flow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4 max-w-2xl mx-auto lg:mx-0">
              <div className="space-y-3 text-center sm:text-left">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">$125T+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Global Digital Payments by 2026</div>
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">4.4B+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Digital Wallet Users Worldwide</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative max-w-lg mx-auto" style={{ contain: 'layout' }}>
              <img 
                src={globalPaymentsImage} 
                alt="Global payments network illustration" 
                className="w-full h-auto rounded-2xl"
                width="1024"
                height="640"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPayments;
