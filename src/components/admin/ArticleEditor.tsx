"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Globe, Search, FileText } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface ArticleData { title: string; slug: string; description: string; content: string; author: string; tags: string[]; meta_title: string; meta_description: string; meta_keywords: string[]; og_title: string; og_description: string; og_image: string; canonical_url: string; focus_keyword: string; published: boolean; }

export default function ArticleEditor({ id }: { id?: string }) {
  const router = useRouter();
  const { hasAccess, loading: permissionLoading } = usePermissions("articles");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<ArticleData>({ title: "", slug: "", description: "", content: "", author: "", tags: [], meta_title: "", meta_description: "", meta_keywords: [], og_title: "", og_description: "", og_image: "", canonical_url: "", focus_keyword: "", published: false });

  useEffect(() => { if (!permissionLoading && !hasAccess) { toast.error("You don't have permission"); router.push("/admin/dashboard"); } }, [hasAccess, permissionLoading, router]);
  useEffect(() => { if (id && hasAccess) loadArticle(); }, [id, hasAccess]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("blog_articles").select("*").eq("id", id!).single();
      if (error) throw error;
      if (data) setArticle({ title: data.title || "", slug: data.slug || "", description: data.description || "", content: data.content || "", author: data.author || "", tags: data.tags || [], meta_title: data.meta_title || "", meta_description: data.meta_description || "", meta_keywords: data.meta_keywords || [], og_title: data.og_title || "", og_description: data.og_description || "", og_image: data.og_image || "", canonical_url: data.canonical_url || "", focus_keyword: data.focus_keyword || "", published: data.published || false });
    } catch { toast.error("Failed to load article"); } finally { setLoading(false); }
  };

  const calculateSEOScore = (): number => {
    let score = 0;
    if (article.meta_title.length >= 30 && article.meta_title.length <= 60) score += 15;
    if (article.meta_description.length >= 120 && article.meta_description.length <= 160) score += 15;
    if (article.focus_keyword && article.title.toLowerCase().includes(article.focus_keyword.toLowerCase())) score += 15;
    if (article.focus_keyword && article.meta_description.toLowerCase().includes(article.focus_keyword.toLowerCase())) score += 10;
    if (article.meta_keywords.length >= 3 && article.meta_keywords.length <= 10) score += 10;
    if (article.og_title?.length > 0) score += 10;
    if (article.og_description?.length > 0) score += 10;
    if (article.og_image?.length > 0) score += 10;
    if (article.canonical_url?.length > 0) score += 5;
    return score;
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      const dataToSave = { ...article, published: publish, published_at: publish ? new Date().toISOString() : null };
      if (id) { const { error } = await supabase.from("blog_articles").update(dataToSave).eq("id", id); if (error) throw error; toast.success(publish ? "Published" : "Saved as draft"); }
      else { const { error } = await supabase.from("blog_articles").insert(dataToSave); if (error) throw error; toast.success("Created"); router.push("/admin/articles"); }
    } catch (error: any) { toast.error(error.message || "Failed to save"); } finally { setSaving(false); }
  };

  const seoScore = calculateSEOScore();
  const seoLevel = seoScore >= 80 ? "excellent" : seoScore >= 60 ? "good" : seoScore >= 40 ? "fair" : "poor";

  if (permissionLoading || loading) return <div className="flex items-center justify-center min-h-screen"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div>;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/articles")}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h1 className="text-3xl font-bold">{id ? "Edit Article" : "New Article"}</h1><p className="text-muted-foreground">Create and optimize your blog content</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
          <Button onClick={() => handleSave(true)} disabled={saving}><Eye className="h-4 w-4 mr-2" />Publish</Button>
        </div>
      </div>

      <Card>
        <CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />SEO Score</CardTitle></div><div className="text-right"><div className="text-4xl font-bold">{seoScore}/100</div><Badge variant={seoLevel === "excellent" ? "default" : "secondary"}>{seoLevel}</Badge></div></div></CardHeader>
        <CardContent><Progress value={seoScore} className="h-3" /></CardContent>
      </Card>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2" />Content</TabsTrigger>
          <TabsTrigger value="seo"><Search className="h-4 w-4 mr-2" />SEO</TabsTrigger>
          <TabsTrigger value="social"><Globe className="h-4 w-4 mr-2" />Social</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-2" />Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-6">
          <Card><CardHeader><CardTitle>Article Content</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={article.title} onChange={(e) => { setArticle({ ...article, title: e.target.value, ...(!article.slug ? { slug: e.target.value.toLowerCase().replace(/\s+/g, "-") } : {}) }); }} required /></div>
            <div className="space-y-2"><Label>Slug *</Label><Input value={article.slug} onChange={(e) => setArticle({ ...article, slug: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea value={article.description} onChange={(e) => setArticle({ ...article, description: e.target.value })} rows={3} required /></div>
            <div className="space-y-2"><Label>Content *</Label><Textarea value={article.content} onChange={(e) => setArticle({ ...article, content: e.target.value })} rows={15} required /></div>
            <div className="space-y-2"><Label>Author *</Label><Input value={article.author} onChange={(e) => setArticle({ ...article, author: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={article.tags.join(", ")} onChange={(e) => setArticle({ ...article, tags: e.target.value.split(",").map(t => t.trim()) })} /></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="seo" className="space-y-6">
          <Card><CardHeader><CardTitle>SEO Optimization</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><Label>Focus Keyword</Label><Input value={article.focus_keyword} onChange={(e) => setArticle({ ...article, focus_keyword: e.target.value })} /></div>
            <div className="space-y-2"><Label>Meta Title ({article.meta_title.length}/60)</Label><Input value={article.meta_title} onChange={(e) => setArticle({ ...article, meta_title: e.target.value })} maxLength={60} /></div>
            <div className="space-y-2"><Label>Meta Description ({article.meta_description.length}/160)</Label><Textarea value={article.meta_description} onChange={(e) => setArticle({ ...article, meta_description: e.target.value })} rows={3} maxLength={160} /></div>
            <div className="space-y-2"><Label>Meta Keywords</Label><Input value={article.meta_keywords.join(", ")} onChange={(e) => setArticle({ ...article, meta_keywords: e.target.value.split(",").map(k => k.trim()) })} /></div>
            <div className="space-y-2"><Label>Canonical URL</Label><Input value={article.canonical_url} onChange={(e) => setArticle({ ...article, canonical_url: e.target.value })} /></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="social"><Card><CardHeader><CardTitle>Social Media & Open Graph</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="space-y-2"><Label>OG Title</Label><Input value={article.og_title} onChange={(e) => setArticle({ ...article, og_title: e.target.value })} /></div>
          <div className="space-y-2"><Label>OG Description</Label><Textarea value={article.og_description} onChange={(e) => setArticle({ ...article, og_description: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>OG Image URL</Label><Input value={article.og_image} onChange={(e) => setArticle({ ...article, og_image: e.target.value })} /></div>
        </CardContent></Card></TabsContent>
        <TabsContent value="preview"><Card><CardHeader><CardTitle>Search Result Preview</CardTitle></CardHeader><CardContent>
          <div className="border rounded-lg p-6 bg-white"><div className="text-xs text-gray-600 mb-1">{article.canonical_url || "https://yourdomain.com/" + article.slug}</div><div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">{article.meta_title || article.title || "Article Title"}</div><div className="text-sm text-gray-700">{article.meta_description || article.description || "Article description..."}</div></div>
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
