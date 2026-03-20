"use client";

import { Check, ArrowRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";

const lmsLogo = "/images/lms-logo-official.png";
const paysafeLogo = "/images/paysafe-logo.png";
const worldpayLogo = "/images/worldpay-logo.png";
const cloverLogo = "/images/clover-logo.png";
const staxLogo = "/images/stax-logo.png";
const paymentDepotLogo = "/images/payment-depot-logo.png";
const cardxLogo = "/images/cardx-logo.png";
interface Provider {
  id: string | number;
  name: string;
  tagline: string;
  logo?: string | null;
  logoUrl?: string | null;
  logoPlaceholder: string;
  features: string[];
  rating: number;
  ratingLabel: string;
  url: string;
  isTopPick?: boolean;
}

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const { trackEvent } = useAnalytics();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent("provider_click", {
      provider_name: provider.name,
      provider_id: provider.id,
      provider_url: provider.url,
    });
    window.open(provider.url, '_blank', 'noopener,noreferrer');
  };

  const getLogoPlaceholder = (logoPlaceholder: string) => {
    const colors: Record<string, string> = {
      lms: "bg-accent border border-border",
      paysafe: "bg-muted border border-border",
      worldpay: "bg-success/10 border border-success/20",
      clover: "bg-success/10 border border-success/20",
      stax: "bg-muted border border-border",
      paymentdepot: "bg-blue-50 border border-blue-200",
      cardx: "bg-purple-50 border border-purple-200",
    };
    return colors[logoPlaceholder] || "bg-muted border border-border";
  };

  const getLogoText = (name: string, logoPlaceholder: string) => {
    const textColors: Record<string, string> = {
      lms: "text-primary",
      paysafe: "text-foreground",
      worldpay: "text-success",
      clover: "text-success",
      stax: "text-foreground",
      paymentdepot: "text-blue-700",
      cardx: "text-purple-700",
    };
    const textColor = textColors[logoPlaceholder] || "text-muted-foreground";
    return { text: name.split(" ").map((w) => w[0]).join("").slice(0, 3), color: textColor };
  };

  const logoConfig = getLogoText(provider.name, provider.logoPlaceholder);
  
  // Use logoUrl from CMS if available, otherwise fall back to local assets
  const logoMap: Record<string, string> = {
    lms: lmsLogo,
    paysafe: paysafeLogo,
    worldpay: worldpayLogo,
    clover: cloverLogo,
    stax: staxLogo,
    paymentdepot: paymentDepotLogo,
    cardx: cardxLogo,
  };
  
  // Prefer CMS logo URL, then local logoMap, then null
  const logoSrc = provider.logoUrl || logoMap[provider.logoPlaceholder] || null;

  return (
    <Card 
      className="relative overflow-hidden border border-border/50 border-t border-t-border/70 bg-card shadow-md hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
        {/* Number badge - top-left with solid primary background */}
        <div className="absolute top-0 left-0 bg-primary text-primary-foreground rounded-br-xl px-2.5 py-1.5 md:px-4 md:py-2.5 font-bold text-sm md:text-lg shadow-md">
          {provider.id}
        </div>

        <CardContent className="p-3 md:p-5 lg:p-6">
          {/* Mobile Layout */}
          <div className="md:hidden pt-4">
            
            {/* Logo + Rating Row */}
            <div className="flex items-center justify-between mb-3">
              {/* Logo */}
              <div className="flex-shrink-0">
              {logoSrc ? (
                  <img 
                    src={logoSrc} 
                    alt={provider.name} 
                    className={`h-16 object-contain ${provider.logoPlaceholder === 'paymentdepot' ? 'w-28' : 'w-16'}`}
                    loading={provider.id === 1 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-base ${getLogoPlaceholder(provider.logoPlaceholder)} ${logoConfig.color}`}>
                    {logoConfig.text}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex-shrink-0 flex items-center gap-1 bg-warning/10 rounded-full px-3 py-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-base font-bold text-foreground">{provider.rating}</span>
              </div>
            </div>

            {/* Tagline - Full width below logo */}
            <p className="text-base text-foreground font-medium leading-snug mb-4 text-center">{provider.tagline}</p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              {provider.features.slice(0, 2).map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-base text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button size="lg" className="w-full font-semibold text-base h-11">
              Visit Site
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-[140px_1fr] lg:grid-cols-[140px_1fr_260px] items-start gap-6 lg:gap-10">
            {/* Left: Logo */}
            <div className="flex flex-col items-center justify-center md:pt-4">
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt={provider.name} 
                  className={`h-32 object-contain ${provider.logoPlaceholder === 'paymentdepot' ? 'w-44' : 'w-32'}`}
                  loading={provider.id === 1 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <div className={`w-32 h-32 rounded-md flex items-center justify-center font-bold text-3xl ${getLogoPlaceholder(provider.logoPlaceholder)} ${logoConfig.color}`}>
                  {logoConfig.text}
                </div>
              )}
            </div>

            {/* Middle: Title + bullets */}
            <div className="space-y-5 text-left">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{provider.name}</h3>
                <p className="mt-1.5 text-lg font-semibold text-foreground/80">
                  {provider.tagline}
                </p>
              </div>
              <div className="space-y-3">
                {provider.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-left">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-base text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Rating + button */}
            <div className="flex flex-col items-center justify-between w-full pt-2 gap-0">
              <div className="text-center space-y-3 mb-8">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 fill-warning text-warning" />
                  <span className="text-3xl font-extrabold text-foreground">
                    {provider.rating} Rating
                  </span>
                </div>
                <div className="text-base text-foreground/60">{provider.ratingLabel}</div>
              </div>

              <div className="w-full space-y-3">
                <Button size="lg" className="w-full font-semibold text-lg py-6 shadow-md">
                  Visit Site
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full font-semibold text-base py-5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                >
                  Get a free quote
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default ProviderCard;
