"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Select from "react-select";

const BUSINESS_TYPES_OPTIONS = [
  { value: "retail", label: "Retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "restaurant", label: "Restaurant" },
  { value: "services", label: "Services" },
];

const MARKETS_OPTIONS = [
  { value: "us", label: "US" },
  { value: "global", label: "Global" },
  { value: "eu", label: "EU" },
];

export default function ProviderForm({ id }: { id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    name: "", tagline: "", logo: "", logo_placeholder: "", rating: 8.0, rating_label: "Very Good",
    url: "", is_top_pick: false, transaction_fees: "", setup_speed: "", customer_support: "",
    payment_methods: "", countries: "", business_types: [] as string[], markets: [] as string[],
    funding_speed: 1, fee_score: 1, display_order: 0,
  });

  useEffect(() => { if (id) loadProvider(); }, [id]);

  const loadProvider = async () => {
    try {
      const { data, error } = await supabase.from("providers").select("*").eq("id", id!).single();
      if (error) throw error;
      setFormData({
        name: data.name, tagline: data.tagline, logo: data.logo || "", logo_placeholder: data.logo_placeholder,
        rating: data.rating, rating_label: data.rating_label, url: data.url, is_top_pick: data.is_top_pick,
        transaction_fees: data.transaction_fees, setup_speed: data.setup_speed, customer_support: data.customer_support,
        payment_methods: data.payment_methods, countries: data.countries,
        business_types: Array.isArray(data.business_types) ? data.business_types.filter((t: any): t is string => typeof t === 'string') : [],
        markets: Array.isArray(data.markets) ? data.markets.filter((m: any): m is string => typeof m === 'string') : [],
        funding_speed: data.funding_speed, fee_score: data.fee_score, display_order: data.display_order,
      });
      setFeatures(Array.isArray(data.features) ? data.features.filter((f: any): f is string => typeof f === 'string') : [""]);
    } catch (error: any) { toast({ title: "Error loading data", description: error.message, variant: "destructive" }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const providerData = { ...formData, features: features.filter(f => f.trim() !== "") };
      if (id) {
        const { error } = await supabase.from("providers").update(providerData).eq("id", id);
        if (error) throw error;
        toast({ title: "Provider updated successfully" });
      } else {
        const { error } = await supabase.from("providers").insert([providerData]);
        if (error) throw error;
        toast({ title: "Provider added successfully" });
      }
      router.push("/admin/providers");
    } catch (error: any) { toast({ title: "Error saving provider", description: error.message, variant: "destructive" }); } finally { setLoading(false); }
  };

  const customSelectStyles = {
    control: (base: any) => ({ ...base, borderColor: 'hsl(var(--border))', '&:hover': { borderColor: 'hsl(var(--ring))' } }),
    menu: (base: any) => ({ ...base, backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }),
    option: (base: any, state: any) => ({ ...base, backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent', color: 'hsl(var(--popover-foreground))' }),
    multiValue: (base: any) => ({ ...base, backgroundColor: 'hsl(var(--primary))' }),
    multiValueLabel: (base: any) => ({ ...base, color: 'hsl(var(--primary-foreground))' }),
    multiValueRemove: (base: any) => ({ ...base, color: 'hsl(var(--primary-foreground))' }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/admin/providers")} className="mb-4 gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-3xl">{id ? "Edit Provider" : "Add New Provider"}</CardTitle>
            <CardDescription>{id ? "Update provider information and settings" : "Create a new payment provider listing"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Provider Name *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="logo_placeholder">Logo Placeholder *</Label><Input id="logo_placeholder" value={formData.logo_placeholder} onChange={(e) => setFormData({ ...formData, logo_placeholder: e.target.value })} required /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="tagline">Short Description *</Label><Input id="tagline" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="url">Website URL *</Label><Input id="url" type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required /></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Features</h3>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={feature} onChange={(e) => { const n = [...features]; n[index] = e.target.value; setFeatures(n); }} placeholder="Enter a feature..." className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => features.length > 1 && setFeatures(features.filter((_, i) => i !== index))} disabled={features.length === 1}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setFeatures([...features, ""])} className="w-full gap-2"><Plus className="h-4 w-4" />Add Feature</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Rating & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Rating (0-10) *</Label><Input type="number" step="0.1" min="0" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required /></div>
                  <div className="space-y-2"><Label>Rating Label *</Label><Input value={formData.rating_label} onChange={(e) => setFormData({ ...formData, rating_label: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Transaction Fees *</Label><Input value={formData.transaction_fees} onChange={(e) => setFormData({ ...formData, transaction_fees: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Setup Speed *</Label><Input value={formData.setup_speed} onChange={(e) => setFormData({ ...formData, setup_speed: e.target.value })} required /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Filter & Display Options</h3>
                <div className="space-y-2">
                  <Label>Business Types</Label>
                  <Select isMulti options={BUSINESS_TYPES_OPTIONS} value={BUSINESS_TYPES_OPTIONS.filter(opt => formData.business_types.includes(opt.value))} onChange={(selected) => setFormData({ ...formData, business_types: selected.map(s => s.value) })} styles={customSelectStyles} />
                </div>
                <div className="space-y-2">
                  <Label>Markets</Label>
                  <Select isMulti options={MARKETS_OPTIONS} value={MARKETS_OPTIONS.filter(opt => formData.markets.includes(opt.value))} onChange={(selected) => setFormData({ ...formData, markets: selected.map(s => s.value) })} styles={customSelectStyles} />
                </div>
                <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                  <Checkbox id="is_top_pick" checked={formData.is_top_pick} onCheckedChange={(checked) => setFormData({ ...formData, is_top_pick: checked as boolean })} />
                  <Label htmlFor="is_top_pick" className="cursor-pointer font-medium">Mark as Top Pick</Label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : id ? "Update Provider" : "Add Provider"}</Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin/providers")} className="flex-1">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
