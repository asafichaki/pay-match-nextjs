"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Users, FileText, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ providers: 0, leads: 0, articles: 0, contacts: 0 });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [providersData, leadsData, articlesData, contactsData] = await Promise.all([
        supabase.from("providers").select("id", { count: "exact" }),
        supabase.from("quiz_leads").select("id", { count: "exact" }),
        supabase.from("blog_articles").select("id", { count: "exact" }),
        supabase.from("contact_submissions").select("id", { count: "exact" }),
      ]);
      setStats({
        providers: providersData.count || 0,
        leads: leadsData.count || 0,
        articles: articlesData.count || 0,
        contacts: contactsData.count || 0,
      });
    } catch (error: any) {
      toast({ title: "Error loading stats", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Payment Providers", icon: CreditCard, value: stats.providers, label: "Active providers" },
            { title: "Quiz Leads", icon: Users, value: stats.leads, label: "Total submissions" },
            { title: "Blog Articles", icon: FileText, value: stats.articles, label: "Published articles" },
            { title: "Contact Submissions", icon: MessageSquare, value: stats.contacts, label: "Total contacts" },
          ].map((card) => (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Providers", desc: "Manage payment providers", icon: CreditCard, href: "/admin/providers", label: "Manage" },
              { title: "Quiz Leads", desc: "View quiz submissions", icon: Users, href: "/admin/leads", label: "View Leads" },
              { title: "Blog Articles", desc: "Manage blog content", icon: FileText, href: "/admin/articles", label: "Manage" },
              { title: "Contact Forms", desc: "View submissions", icon: MessageSquare, href: "/admin/contacts", label: "View" },
            ].map((action) => (
              <Card key={action.title} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push(action.href)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                    <action.icon className="h-5 w-5" />
                    {action.title}
                  </CardTitle>
                  <CardDescription>{action.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {action.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
