"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
      <section id="compare" className="hidden md:block py-6 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse bg-muted rounded-xl h-64"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="compare" className="hidden md:block py-6 sm:py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Detailed Feature Comparison
          </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center">
              Compare key features side-by-side to find the perfect fit for your business
            </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border shadow-lg bg-card -mx-4 sm:mx-0">
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
                  <TableCell className="font-semibold text-foreground">
                    {provider.name}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {provider.transaction_fees}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {provider.setup_speed}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {provider.customer_support}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {provider.payment_methods}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {provider.countries}
                  </TableCell>
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
