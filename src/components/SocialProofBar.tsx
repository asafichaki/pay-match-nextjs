"use client";

import { Shield, Users, DollarSign, Globe } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { icon: Users, value: 2500, suffix: "+", label: "Businesses Matched" },
  { icon: DollarSign, prefix: "$", value: 125, suffix: "T+", label: "Processed Annually" },
  { icon: Globe, value: 4, suffix: ".4B+", label: "Users Worldwide" },
  { icon: Shield, value: 100, suffix: "%", label: "Free & Unbiased" },
];

export default function SocialProofBar() {
  return (
    <section className="py-8 md:py-12 bg-muted/30 border-y border-border/50" aria-label="Platform statistics">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                <AnimatedCounter
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
