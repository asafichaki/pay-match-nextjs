"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Article { id: string; created_at: string; title: string; slug: string; description: string; author: string; published: boolean; }

export default function ArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    try { const { data, error } = await supabase.from("blog_articles").select("id, created_at, title, slug, description, author, published").order("created_at", { ascending: false }); if (error) throw error; setArticles(data || []); } catch (error: any) { toast({ title: "Error loading articles", description: error.message, variant: "destructive" }); } finally { setLoading(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { const { error } = await supabase.from("blog_articles").delete().eq("id", deleteId); if (error) throw error; toast({ title: "Article deleted" }); loadArticles(); } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } finally { setDeleteId(null); } };

  const togglePublished = async (id: string, current: boolean) => {
    try { const { error } = await supabase.from("blog_articles").update({ published: !current, published_at: !current ? new Date().toISOString() : null }).eq("id", id); if (error) throw error; toast({ title: !current ? "Article published" : "Article unpublished" }); loadArticles(); } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div><h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Blog Articles</h1><p className="text-muted-foreground mt-2">Create and manage blog content</p></div>
            <Button onClick={() => router.push("/admin/articles/new")} className="gap-2"><Plus className="h-4 w-4" />New Article</Button>
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          {loading ? <div className="text-center py-12"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="hidden sm:table-cell">Author</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-muted/30">
                      <TableCell><div className="font-semibold">{article.title}</div><div className="text-xs text-muted-foreground">/{article.slug}</div></TableCell>
                      <TableCell className="hidden md:table-cell max-w-md"><span className="text-sm text-muted-foreground line-clamp-2">{article.description}</span></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{article.author}</TableCell>
                      <TableCell><Badge variant={article.published ? "default" : "secondary"} className="cursor-pointer" onClick={() => togglePublished(article.id, article.published)}>{article.published ? <><Eye className="h-3 w-3 mr-1" />Published</> : <><EyeOff className="h-3 w-3 mr-1" />Draft</>}</Badge></TableCell>
                      <TableCell className="text-right"><div className="flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => router.push(`/admin/articles/${article.id}/edit`)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" onClick={() => setDeleteId(article.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                  {filteredArticles.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No articles found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this article.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
