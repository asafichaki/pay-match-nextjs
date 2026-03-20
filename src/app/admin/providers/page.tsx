"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  Search,
  LayoutGrid,
  TableIcon,
  Eye,
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  is_top_pick: boolean;
  transaction_fees: string;
  display_order: number;
  features: string[];
}

// Generate a consistent color from provider name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating / 2);
  const hasHalf = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalf && (
          <div className="relative">
            <Star className="h-4 w-4 text-muted-foreground/30" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="h-4 w-4 text-muted-foreground/30"
          />
        ))}
      </div>
      <span className="font-semibold text-sm">{rating}/10</span>
    </div>
  );
}

export default function ProvidersDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [reordering, setReordering] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
    loadClickStats();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setProviders(
        (data || []).map((p: any) => ({
          ...p,
          features: Array.isArray(p.features)
            ? p.features.filter((f: any): f is string => typeof f === "string")
            : [],
        }))
      );
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClickStats = async () => {
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("metadata")
        .eq("event_type", "provider_click");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((event: any) => {
        const name = event.metadata?.name;
        if (name) {
          counts[name] = (counts[name] || 0) + 1;
        }
      });
      setClickCounts(counts);
    } catch {
      // Silently fail - click stats are non-critical
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from("providers")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Provider deleted successfully" });
      loadProviders();
    } catch (error: any) {
      toast({
        title: "Error deleting provider",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleTopPickToggle = async (provider: Provider) => {
    const newValue = !provider.is_top_pick;
    // Optimistic update
    setProviders((prev) =>
      prev.map((p) =>
        p.id === provider.id ? { ...p, is_top_pick: newValue } : p
      )
    );
    try {
      const { error } = await supabase
        .from("providers")
        .update({ is_top_pick: newValue })
        .eq("id", provider.id);
      if (error) throw error;
      toast({
        title: newValue
          ? `${provider.name} marked as Top Pick`
          : `${provider.name} removed from Top Pick`,
      });
    } catch (error: any) {
      // Revert on failure
      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, is_top_pick: !newValue } : p
        )
      );
      toast({
        title: "Error updating provider",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (
    provider: Provider,
    direction: "up" | "down"
  ) => {
    if (reordering) return;
    setReordering(true);

    const sorted = [...providers].sort(
      (a, b) => a.display_order - b.display_order
    );
    const currentIndex = sorted.findIndex((p) => p.id === provider.id);
    const swapIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= sorted.length) {
      setReordering(false);
      return;
    }

    const neighbor = sorted[swapIndex];
    const currentOrder = provider.display_order;
    const neighborOrder = neighbor.display_order;

    // Optimistic update
    setProviders((prev) =>
      prev
        .map((p) => {
          if (p.id === provider.id)
            return { ...p, display_order: neighborOrder };
          if (p.id === neighbor.id)
            return { ...p, display_order: currentOrder };
          return p;
        })
        .sort((a, b) => a.display_order - b.display_order)
    );

    try {
      const { error: err1 } = await supabase
        .from("providers")
        .update({ display_order: neighborOrder })
        .eq("id", provider.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from("providers")
        .update({ display_order: currentOrder })
        .eq("id", neighbor.id);
      if (err2) throw err2;
    } catch (error: any) {
      toast({
        title: "Error reordering",
        description: error.message,
        variant: "destructive",
      });
      loadProviders();
    } finally {
      setReordering(false);
    }
  };

  const filteredProviders = useMemo(
    () =>
      providers.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.tagline.toLowerCase().includes(search.toLowerCase())
      ),
    [providers, search]
  );

  const deleteName = deleteId
    ? providers.find((p) => p.id === deleteId)?.name
    : "";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Payment Providers
              </h1>
              <p className="text-muted-foreground mt-1">
                {providers.length} provider{providers.length !== 1 ? "s" : ""}{" "}
                total
              </p>
            </div>
            <Link href="/admin/providers/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </Link>
          </div>

          {/* Search + View Toggle */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="rounded-none gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none gap-1.5"
              >
                <TableIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">
                Loading providers...
              </p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {search
                ? "No providers found matching your search."
                : "No providers yet. Add your first provider."}
            </div>
          ) : viewMode === "card" ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProviders.map((provider, index) => {
                const sorted = [...providers].sort(
                  (a, b) => a.display_order - b.display_order
                );
                const sortedIndex = sorted.findIndex(
                  (p) => p.id === provider.id
                );
                const isFirst = sortedIndex === 0;
                const isLast = sortedIndex === sorted.length - 1;

                return (
                  <Card
                    key={provider.id}
                    className="relative overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Display order badge */}
                    <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {provider.display_order}
                      </span>
                    </div>

                    {/* Top Pick badge */}
                    {provider.is_top_pick && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white font-semibold shadow-md">
                          Top Pick
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-5 pt-12 space-y-4">
                      {/* Provider identity */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-full ${getAvatarColor(provider.name)} flex items-center justify-center text-white font-bold text-lg shrink-0`}
                        >
                          {provider.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold truncate">
                            {provider.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {provider.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <StarRating rating={provider.rating} />

                      {/* Info row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {provider.transaction_fees}
                        </Badge>
                        {provider.features.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {provider.features.length} feature
                            {provider.features.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {clickCounts[provider.name] || 0} clicks
                        </Badge>
                      </div>

                      {/* Top Pick toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Top Pick
                        </span>
                        <Switch
                          checked={provider.is_top_pick}
                          onCheckedChange={() => handleTopPickToggle(provider)}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isFirst || reordering}
                            onClick={() => handleReorder(provider, "up")}
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isLast || reordering}
                            onClick={() => handleReorder(provider, "down")}
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.push(
                                `/admin/providers/${provider.id}/edit`
                              )
                            }
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(provider.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead className="text-center">Top Pick</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => {
                    const sorted = [...providers].sort(
                      (a, b) => a.display_order - b.display_order
                    );
                    const sortedIndex = sorted.findIndex(
                      (p) => p.id === provider.id
                    );
                    const isFirst = sortedIndex === 0;
                    const isLast = sortedIndex === sorted.length - 1;

                    return (
                      <TableRow
                        key={provider.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-muted-foreground w-6">
                              {provider.display_order}
                            </span>
                            <div className="flex flex-col">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                disabled={isFirst || reordering}
                                onClick={() => handleReorder(provider, "up")}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                disabled={isLast || reordering}
                                onClick={() => handleReorder(provider, "down")}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-full ${getAvatarColor(provider.name)} flex items-center justify-center text-white font-semibold text-xs shrink-0`}
                            >
                              {provider.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {provider.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {provider.tagline}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {provider.rating}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {provider.transaction_fees}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={provider.is_top_pick}
                            onCheckedChange={() =>
                              handleTopPickToggle(provider)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {clickCounts[provider.name] || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                router.push(
                                  `/admin/providers/${provider.id}/edit`
                                )
                              }
                              className="hover:bg-primary/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(provider.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this provider and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
