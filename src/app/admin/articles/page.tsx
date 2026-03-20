"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  BookOpen,
  GitCompare,
  Star,
  Tag,
  BarChart3,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  published: boolean;
}

interface PublishedArticle {
  title: string;
  slug: string;
  type: "Article" | "Guide" | "Comparison" | "Review" | "Reference";
  path: string;
}

const publishedArticles: PublishedArticle[] = [
  { title: "Online vs In-Store Payments: Key Differences Explained", slug: "online-vs-instore-payments", type: "Article", path: "/insights/online-vs-instore-payments" },
  { title: "Helcim Review 2026", slug: "helcim-review-2025", type: "Review", path: "/insights/helcim-review-2025" },
  { title: "Payment Processor Fees Guide", slug: "payment-processor-fees-guide", type: "Guide", path: "/insights/payment-processor-fees-guide" },
  { title: "Best Payment Gateway for Ecommerce", slug: "best-payment-gateway-ecommerce", type: "Guide", path: "/insights/best-payment-gateway-ecommerce" },
  { title: "Credit Card Processing Fees Explained", slug: "credit-card-processing-fees-explained", type: "Guide", path: "/insights/credit-card-processing-fees-explained" },
  { title: "High-Risk Payment Processing Guide", slug: "high-risk-payment-processing-guide", type: "Guide", path: "/insights/high-risk-payment-processing-guide" },
  { title: "Small Business Credit Card Processing", slug: "small-business-credit-card-processing-guide", type: "Guide", path: "/insights/small-business-credit-card-processing-guide" },
  { title: "Merchant Statement Audit Guide", slug: "merchant-statement-audit-guide", type: "Guide", path: "/insights/merchant-statement-audit-guide" },
  { title: "How to Read Your Merchant Statement", slug: "how-to-read-merchant-statement", type: "Guide", path: "/insights/how-to-read-merchant-statement" },
  { title: "Merchant Services Glossary", slug: "merchant-services-glossary", type: "Reference", path: "/insights/merchant-services-glossary" },
  { title: "Level 2 & 3 Processing Guide", slug: "level-2-level-3-processing-guide", type: "Guide", path: "/insights/level-2-level-3-processing-guide" },
  { title: "Merchant Contract Cancellation Guide", slug: "merchant-contract-cancellation-guide", type: "Guide", path: "/insights/merchant-contract-cancellation-guide" },
  { title: "Square vs Stripe", slug: "square-vs-stripe", type: "Comparison", path: "/comparisons/square-vs-stripe" },
  { title: "PayPal vs Square", slug: "paypal-vs-square", type: "Comparison", path: "/comparisons/paypal-vs-square" },
  { title: "Stripe vs PayPal", slug: "stripe-vs-paypal", type: "Comparison", path: "/comparisons/stripe-vs-paypal" },
  { title: "Helcim vs Stripe", slug: "helcim-vs-stripe", type: "Comparison", path: "/comparisons/helcim-vs-stripe" },
  { title: "Best Payment Processors 2026", slug: "best-payment-processors-2026", type: "Comparison", path: "/comparisons/best-payment-processors-2026" },
];

const typeBadgeStyles: Record<PublishedArticle["type"], string> = {
  Article: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Guide: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Comparison: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Reference: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const typeIcons: Record<PublishedArticle["type"], typeof FileText> = {
  Article: FileText,
  Guide: BookOpen,
  Comparison: GitCompare,
  Review: Star,
  Reference: Tag,
};

export default function ArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pageViews, setPageViews] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("published");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadArticles();
    loadPageViews();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("id, created_at, title, slug, description, author, published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({ title: "Error loading articles", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPageViews = async () => {
    try {
      const paths = publishedArticles.map((a) => a.path);
      const { data, error } = await supabase
        .from("analytics_events")
        .select("page_path")
        .eq("event_type", "page_view")
        .in("page_path", paths);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row) => {
        if (row.page_path) {
          counts[row.page_path] = (counts[row.page_path] || 0) + 1;
        }
      });
      setPageViews(counts);
    } catch {
      // Silently fail - page views are non-critical
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("blog_articles").delete().eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Article deleted" });
      loadArticles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("blog_articles")
        .update({ published: !current, published_at: !current ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
      toast({ title: !current ? "Article published" : "Article unpublished" });
      loadArticles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredPublished = publishedArticles.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCMS = articles.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalCount = publishedArticles.length + articles.length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Content Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalCount} total pieces of content across your site
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search all content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="published" className="gap-2">
                <FileText className="h-4 w-4" />
                Published Content ({publishedArticles.length})
              </TabsTrigger>
              <TabsTrigger value="cms" className="gap-2">
                <BookOpen className="h-4 w-4" />
                CMS Articles ({articles.length})
              </TabsTrigger>
            </TabsList>

            {/* Published Content Tab */}
            <TabsContent value="published" className="mt-6">
              <div className="grid gap-3">
                {filteredPublished.map((article) => {
                  const Icon = typeIcons[article.type];
                  const views = pageViews[article.path] || 0;
                  return (
                    <Card key={article.slug} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="shrink-0 h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-sm truncate">{article.title}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyles[article.type]}`}>
                                  {article.type}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{article.path}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground" title="Page views">
                              <BarChart3 className="h-4 w-4" />
                              <span>{views.toLocaleString()}</span>
                            </div>
                            <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                              Published
                            </Badge>
                            <a
                              href={article.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="View on site"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredPublished.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No published content matches your search.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* CMS Articles Tab */}
            <TabsContent value="cms" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => router.push("/admin/articles/new")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Article
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCMS.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-tight line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <Badge
                            variant={article.published ? "default" : "secondary"}
                            className="shrink-0 cursor-pointer"
                            onClick={() => togglePublished(article.id, article.published)}
                          >
                            {article.published ? (
                              <><Eye className="h-3 w-3 mr-1" />Published</>
                            ) : (
                              <><EyeOff className="h-3 w-3 mr-1" />Draft</>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-mono">/{article.slug}</p>
                          {article.author && (
                            <p className="text-sm text-muted-foreground">By {article.author}</p>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(article.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5"
                            onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            onClick={() => setDeleteId(article.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCMS.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      {articles.length === 0
                        ? "No CMS articles yet. Create your first one!"
                        : "No articles match your search."}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
