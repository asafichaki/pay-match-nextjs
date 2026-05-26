"use client";

import { useEffect, useMemo, useState } from "react";
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
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  created_at: string;
  published_at: string | null;
  title: string;
  slug: string;
  description: string;
  author: string;
  published: boolean;
}

const PAGE_SIZE = 20;

function articleStatus(a: Article): "published" | "scheduled" | "draft" {
  if (a.published) return "published";
  if (a.published_at && new Date(a.published_at) > new Date()) return "scheduled";
  return "draft";
}

const STATUS_STYLES: Record<string, string> = {
  published: "border-green-500/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  scheduled: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  draft: "border-zinc-400/30 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/20",
};

export default function ArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pageViews, setPageViews] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"published" | "all">("published");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("id, created_at, published_at, title, slug, description, author, published")
        .order("published_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      const rows = (data || []) as Article[];
      setArticles(rows);
      await loadPageViews(rows);
    } catch (error: any) {
      toast({ title: "Error loading articles", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPageViews = async (rows: Article[]) => {
    try {
      const slugs = rows.map((a) => a.slug).filter(Boolean);
      if (slugs.length === 0) return;
      // Match common public article paths for these slugs.
      const paths = slugs.flatMap((s) => [`/insights/${s}`, `/blog/${s}`, `/articles/${s}`, `/comparisons/${s}`]);
      const { data, error } = await supabase
        .from("analytics_events")
        .select("page_path")
        .eq("event_type", "page_view")
        .in("page_path", paths);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        const slug = row.page_path?.split("/").filter(Boolean).pop();
        if (slug) counts[slug] = (counts[slug] || 0) + 1;
      });
      setPageViews(counts);
    } catch {
      // Silent; page views are non-critical
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

  const publishedArticles = useMemo(
    () =>
      articles
        .filter((a) => articleStatus(a) === "published")
        .sort((a, b) => {
          const at = a.published_at ? new Date(a.published_at).getTime() : 0;
          const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
          return bt - at;
        }),
    [articles]
  );

  const matches = (a: Article) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase());

  const filteredPublished = publishedArticles.filter(matches);
  const filteredAll = articles.filter(matches);

  const totalPages = Math.max(1, Math.ceil(filteredPublished.length / PAGE_SIZE));
  const pagedPublished = filteredPublished.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                {articles.length} article{articles.length === 1 ? "" : "s"} in CMS, {publishedArticles.length} published
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "published" | "all")}>
            <TabsList>
              <TabsTrigger value="published" className="gap-2">
                <FileText className="h-4 w-4" />
                Published ({publishedArticles.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="h-4 w-4" />
                All CMS ({articles.length})
              </TabsTrigger>
            </TabsList>

            {/* Published tab, real-time from blog_articles */}
            <TabsContent value="published" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {pagedPublished.map((article) => {
                      const status = articleStatus(article);
                      const views = pageViews[article.slug] || 0;
                      const publicUrl = `/insights/${article.slug}`;
                      return (
                        <Card key={article.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="shrink-0 h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-sm truncate">{article.title}</h3>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{article.slug}</p>
                                  {article.published_at && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Published {format(new Date(article.published_at), "MMM d, yyyy")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground" title="Page views (last period)">
                                  <BarChart3 className="h-4 w-4" />
                                  <span>{views.toLocaleString()}</span>
                                </div>
                                <Badge variant="outline" className={STATUS_STYLES[status]}>
                                  {status[0].toUpperCase() + status.slice(1)}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5"
                                  onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                                <a
                                  href={publicUrl}
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
                        {publishedArticles.length === 0
                          ? "No published articles yet."
                          : "No published articles match your search."}
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}, {filteredPublished.length} total
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Prev
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className="gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* All CMS (drafts + scheduled + published) */}
            <TabsContent value="all" className="mt-6 space-y-4">
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
                  {filteredAll.map((article) => {
                    const status = articleStatus(article);
                    return (
                      <Card key={article.id} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-tight line-clamp-2">
                              {article.title}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`shrink-0 cursor-pointer ${STATUS_STYLES[status]}`}
                              onClick={() => togglePublished(article.id, article.published)}
                            >
                              {article.published ? (
                                <><Eye className="h-3 w-3 mr-1" />Published</>
                              ) : (
                                <><EyeOff className="h-3 w-3 mr-1" />{status === "scheduled" ? "Scheduled" : "Draft"}</>
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
                    );
                  })}
                  {filteredAll.length === 0 && (
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
