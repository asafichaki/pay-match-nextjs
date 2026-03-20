"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, LogOut, Search, Star, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Provider { id: string; name: string; tagline: string; rating: number; is_top_pick: boolean; transaction_fees: string; display_order: number; features: string[]; }

export default function ProvidersDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase.from("providers").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      setProviders((data || []).map((p: any) => ({ ...p, features: Array.isArray(p.features) ? p.features.filter((f: any): f is string => typeof f === 'string') : [] })));
    } catch (error: any) { toast({ title: "Error loading data", description: error.message, variant: "destructive" }); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("providers").delete().eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Provider deleted successfully" });
      loadProviders();
    } catch (error: any) { toast({ title: "Error deleting provider", description: error.message, variant: "destructive" }); } finally { setDeleteId(null); }
  };

  const filteredProviders = providers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.tagline.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Payment Providers</h1>
              <p className="text-muted-foreground mt-2">Manage your payment provider listings</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => router.push("/admin/providers/new")} className="gap-2"><Plus className="h-4 w-4" />Add New Provider</Button>
          </div>
          {loading ? (
            <div className="text-center py-12"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /><p className="mt-4 text-muted-foreground">Loading providers...</p></div>
          ) : (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="hidden lg:table-cell max-w-md">Features</TableHead><TableHead className="text-center">Rating</TableHead><TableHead className="hidden sm:table-cell">Fees</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider, index) => (
                    <TableRow key={provider.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><div className="font-semibold">{provider.name}</div>{provider.is_top_pick && <Award className="h-4 w-4 text-primary" />}</div></TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs"><span className="text-sm text-muted-foreground line-clamp-2">{provider.tagline}</span></TableCell>
                      <TableCell className="hidden lg:table-cell max-w-md">
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-auto">
                          {provider.features.slice(0, 3).map((feature, i) => (<Badge key={i} variant="secondary" className="text-xs">{feature.length > 30 ? feature.substring(0, 30) + '...' : feature}</Badge>))}
                          {provider.features.length > 3 && <Badge variant="outline" className="text-xs">+{provider.features.length - 3} more</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><div className="flex items-center justify-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-semibold">{provider.rating}</span></div></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{provider.transaction_fees}</TableCell>
                      <TableCell className="text-center">{provider.is_top_pick ? <Badge className="bg-primary">Top Pick</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/providers/${provider.id}/edit`)} className="hover:bg-primary/10"><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(provider.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProviders.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No providers found matching your search.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete this provider and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
