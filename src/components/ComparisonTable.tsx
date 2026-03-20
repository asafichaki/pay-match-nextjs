"use client";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface Provider {
  id: string;
  name: string;
  transaction_fees: string;
  setup_speed: string;
  customer_support: string;
  payment_methods: string;
  countries: string;
  rating: number;
}

const ComparisonTable = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("id, name, transaction_fees, setup_speed, customer_support, payment_methods, countries, rating")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < fullStars ? "fill-warning text-warning" : "text-muted"}`}
          />
        ))}
        <span className="ml-1.5 font-semibold text-foreground">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="section-container text-center">
          <div className="animate-pulse bg-muted rounded-xl h-64"></div>
        </div>
      </section>
    );
  }

  if (providers.length === 0) return null;

  const currentProvider = providers[mobileIndex];

  return (
    <section className="section-padding bg-muted/30" aria-labelledby="comparison-heading">
      <div className="section-container">
        <div className="text-center mb-8 md:mb-12">
          <h2 id="comparison-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Detailed Feature Comparison
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare key features side-by-side to find the perfect fit for your business
          </p>
        </div>

        {/* Mobile: Card-based comparison with navigation */}
        <div className="md:hidden">
          {currentProvider && (
            <div className="bg-card rounded-xl border border-border shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileIndex(Math.max(0, mobileIndex - 1))}
                  disabled={mobileIndex === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-display font-bold text-lg">{currentProvider.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {mobileIndex + 1} of {providers.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileIndex(Math.min(providers.length - 1, mobileIndex + 1))}
                  disabled={mobileIndex === providers.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Transaction Fees", value: currentProvider.transaction_fees },
                  { label: "Setup Speed", value: currentProvider.setup_speed },
                  { label: "Customer Support", value: currentProvider.customer_support },
                  { label: "Payment Methods", value: currentProvider.payment_methods },
                  { label: "Countries", value: currentProvider.countries },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground font-medium">{row.label}</span>
                    <span className="text-sm text-foreground font-medium text-right max-w-[55%]">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground font-medium">Rating</span>
                  {renderStars(currentProvider.rating)}
                </div>
              </div>
            </div>
          )}

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {providers.map((_, i) => (
              <button
                key={i}
                onClick={() => setMobileIndex(i)}
                className={`h-2 rounded-full transition-all ${i === mobileIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                aria-label={`View provider ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Full table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-border shadow-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-foreground hover:bg-foreground">
                <TableHead className="text-background font-bold">Provider</TableHead>
                <TableHead className="text-background font-bold">Transaction Fees</TableHead>
                <TableHead className="text-background font-bold">Setup Speed</TableHead>
                <TableHead className="text-background font-bold">Customer Support</TableHead>
                <TableHead className="text-background font-bold">Payment Methods</TableHead>
                <TableHead className="text-background font-bold">Countries</TableHead>
                <TableHead className="text-background font-bold">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider, index) => (
                <TableRow
                  key={provider.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <TableCell className="font-semibold text-foreground">{provider.name}</TableCell>
                  <TableCell className="text-foreground font-medium">{provider.transaction_fees}</TableCell>
                  <TableCell className="text-foreground">{provider.setup_speed}</TableCell>
                  <TableCell className="text-foreground">{provider.customer_support}</TableCell>
                  <TableCell className="text-foreground font-medium">{provider.payment_methods}</TableCell>
                  <TableCell className="text-foreground">{provider.countries}</TableCell>
                  <TableCell>{renderStars(provider.rating)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
