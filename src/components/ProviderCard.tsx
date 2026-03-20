"use client";

import { Check, ArrowRight, Star, Shield, Clock, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";

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
    window.open(provider.url, "_blank", "noopener,noreferrer");
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
    return {
      text: name.split(" ").map((w) => w[0]).join("").slice(0, 3),
      color: textColor,
    };
  };

  const logoConfig = getLogoText(provider.name, provider.logoPlaceholder);

  const logoMap: Record<string, string> = {
    lms: "/images/lms-logo-official.png",
    paysafe: "/images/paysafe-logo.png",
    worldpay: "/images/worldpay-logo.png",
    clover: "/images/clover-logo.png",
    stax: "/images/stax-logo.png",
    paymentdepot: "/images/payment-depot-logo.png",
    cardx: "/images/cardx-logo.png",
  };

  const logoSrc = provider.logoUrl || logoMap[provider.logoPlaceholder] || null;

  return (
    <Card
      className="relative overflow-hidden border border-border/50 bg-card shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Top Pick Badge */}
      {provider.isTopPick && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1.5 tracking-wide">
          EDITOR'S CHOICE
        </div>
      )}

      {/* Number badge */}
      <div className={`absolute ${provider.isTopPick ? "top-8" : "top-0"} left-0 bg-primary text-primary-foreground rounded-br-xl px-2.5 py-1.5 md:px-4 md:py-2 font-bold text-sm md:text-lg shadow-md`}>
        {provider.id}
      </div>

      <CardContent className={`p-4 md:p-6 ${provider.isTopPick ? "pt-10" : "pt-4 md:pt-6"}`}>
        {/* Mobile Layout */}
        <div className="md:hidden pt-4">
          {/* Logo + Rating Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-shrink-0">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={provider.name}
                  className={`h-14 object-contain ${provider.logoPlaceholder === "paymentdepot" ? "w-28" : "w-14"}`}
                  loading={provider.id === 1 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-base ${getLogoPlaceholder(provider.logoPlaceholder)} ${logoConfig.color}`}>
                  {logoConfig.text}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-warning/10 rounded-full px-3 py-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-base font-bold text-foreground">{provider.rating}</span>
            </div>
          </div>

          {/* Name + Tagline */}
          <h3 className="text-lg font-display font-bold text-foreground">{provider.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{provider.tagline}</p>

          {/* Metrics Ribbon (mobile) */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
              <Clock className="h-3 w-3 mr-1" />
              Fast Setup
            </Badge>
          </div>

          {/* Features (2 only on mobile) */}
          <div className="space-y-2 mb-4">
            {provider.features.slice(0, 2).map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button size="lg" className="w-full font-semibold text-base h-12">
            Get My Free Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Affiliate disclosure */}
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2 flex items-center justify-center gap-1">
            <Info className="h-2.5 w-2.5" />
            Sponsored
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[140px_1fr_240px] items-start gap-6 lg:gap-10">
          {/* Left: Logo */}
          <div className="flex flex-col items-center justify-center pt-2">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={provider.name}
                className={`h-28 object-contain ${provider.logoPlaceholder === "paymentdepot" ? "w-40" : "w-28"}`}
                loading={provider.id === 1 ? "eager" : "lazy"}
                decoding="async"
              />
            ) : (
              <div className={`w-28 h-28 rounded-md flex items-center justify-center font-bold text-2xl ${getLogoPlaceholder(provider.logoPlaceholder)} ${logoConfig.color}`}>
                {logoConfig.text}
              </div>
            )}
            {/* Trust signal under logo */}
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-primary" />
              Verified by myPayAdvisor
            </div>
          </div>

          {/* Middle: Title + Features */}
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">{provider.name}</h3>
              <p className="mt-1 text-base text-muted-foreground">{provider.tagline}</p>
            </div>

            {/* Features */}
            <div className="space-y-2.5">
              {provider.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-left">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Rating + CTA */}
          <div className="flex flex-col items-center justify-between w-full pt-1 gap-0">
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="text-2xl font-display font-extrabold text-foreground">
                  {provider.rating}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <div className="text-sm text-muted-foreground">{provider.ratingLabel}</div>
            </div>

            <div className="w-full space-y-2.5">
              <Button size="lg" className="w-full font-semibold text-base py-5 shadow-sm">
                Get My Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full font-semibold text-sm py-4 border-primary/30 text-primary hover:bg-primary/5"
              >
                Compare Details
              </Button>
            </div>

            {/* Affiliate disclosure */}
            <p className="text-[10px] text-muted-foreground/50 mt-3 flex items-center gap-1">
              <Info className="h-2.5 w-2.5" />
              Sponsored listing
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
