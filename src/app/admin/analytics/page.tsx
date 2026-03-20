"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, MousePointerClick, Users, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsStats { totalPageViews: number; totalClicks: number; uniqueVisitors: number; quizCompletions: number; }
interface PageView { page: string; count: number; }
interface ReferrerData { referrer: string; count: number; }
interface TimeSeriesData { date: string; views: number; clicks: number; }
interface ProviderClick { provider_name: string; clicks: number; percentage: number; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "#8884d8", "#82ca9d"];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats>({ totalPageViews: 0, totalClicks: 0, uniqueVisitors: 0, quizCompletions: 0 });
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [providerClicks, setProviderClicks] = useState<ProviderClick[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: allEvents } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (allEvents) {
        const pageViewCount = allEvents.filter((e) => e.event_type === "page_view").length;
        const clickCount = allEvents.filter((e) => e.event_type === "click").length;
        const uniqueSessions = new Set(allEvents.map((e) => e.session_id)).size;
        const quizCount = allEvents.filter((e) => e.event_type === "quiz_completed").length;
        setStats({ totalPageViews: pageViewCount, totalClicks: clickCount, uniqueVisitors: uniqueSessions, quizCompletions: quizCount });

        const pageViewMap = new Map<string, number>();
        allEvents.filter((e) => e.event_type === "page_view" && e.page_path).forEach((e) => { pageViewMap.set(e.page_path!, (pageViewMap.get(e.page_path!) || 0) + 1); });
        setPageViews(Array.from(pageViewMap.entries()).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count).slice(0, 10));

        const referrerMap = new Map<string, number>();
        allEvents.filter((e) => e.referrer && e.referrer !== "").forEach((e) => { try { const domain = new URL(e.referrer!).hostname; referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1); } catch { referrerMap.set("Direct", (referrerMap.get("Direct") || 0) + 1); } });
        setReferrers(Array.from(referrerMap.entries()).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 6));

        const dateMap = new Map<string, { views: number; clicks: number }>();
        allEvents.forEach((e) => { const date = new Date(e.created_at).toLocaleDateString(); const current = dateMap.get(date) || { views: 0, clicks: 0 }; if (e.event_type === "page_view") current.views++; if (e.event_type === "click") current.clicks++; dateMap.set(date, current); });
        setTimeSeriesData(Array.from(dateMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

        const providerClickEvents = allEvents.filter((e) => e.event_type === "provider_click");
        const providerClickMap = new Map<string, number>();
        providerClickEvents.forEach((e) => { const metadata = e.metadata as any; const name = metadata?.provider_name || "Unknown"; providerClickMap.set(name, (providerClickMap.get(name) || 0) + 1); });
        const totalProviderClicks = providerClickEvents.length;
        setProviderClicks(Array.from(providerClickMap.entries()).map(([provider_name, clicks]) => ({ provider_name, clicks, percentage: totalProviderClicks > 0 ? (clicks / totalProviderClicks) * 100 : 0 })).sort((a, b) => b.clicks - a.clicks));
      }
    } catch (error) { console.error("Error loading analytics:", error); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading analytics...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track visitor behavior and engagement</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Page Views", icon: Eye, value: stats.totalPageViews, label: "Pages visited" },
          { title: "Total Clicks", icon: MousePointerClick, value: stats.totalClicks, label: "User interactions" },
          { title: "Unique Visitors", icon: Users, value: stats.uniqueVisitors, label: "Unique sessions" },
          { title: "Quiz Completions", icon: FileText, value: stats.quizCompletions, label: "Completed quizzes" },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="providers">Provider Clicks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Activity Over Time</CardTitle><CardDescription>Page views and clicks trend</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Page Views" />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--secondary))" strokeWidth={2} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pageViews} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="page" type="category" width={150} /><Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Traffic Sources</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={referrers} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} outerRadius={120} fill="hsl(var(--primary))" dataKey="count">
                    {referrers.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Provider Clicks</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerClicks}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="provider_name" angle={-45} textAnchor="end" height={100} /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
