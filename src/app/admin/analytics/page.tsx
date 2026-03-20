"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Download,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  format,
  subDays,
  startOfDay,
  subMinutes,
  isToday,
  isYesterday,
} from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────

interface TodayStats {
  pageViews: number;
  clicks: number;
  ctr: number;
  ctrChange: number; // vs yesterday
  activeSessions: number;
}

interface PeriodStats {
  totalPageViews: number;
  totalProviderClicks: number;
  overallCTR: number;
  uniqueVisitors: number;
  quizCompletions: number;
}

interface ProviderClickData {
  provider_name: string;
  clicks: number;
  percentage: number;
  ctr: number;
}

interface PageViewData {
  page: string;
  count: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface TimeSeriesPoint {
  date: string;
  views: number;
  clicks: number;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────

const PROVIDER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#eab308",
  "#f43f5e",
];

// ─── Component ───────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([]);
  const [todayEvents, setTodayEvents] = useState<AnalyticsEvent[]>([]);
  const [yesterdayEvents, setYesterdayEvents] = useState<AnalyticsEvent[]>([]);
  const [recentSessions, setRecentSessions] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);
  const [exportDateRange, setExportDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // ─── Data Fetching ─────────────────────────────────────────────────

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);
      const todayStart = startOfDay(new Date());
      const yesterdayStart = startOfDay(subDays(new Date(), 1));
      const thirtyMinutesAgo = subMinutes(new Date(), 30);

      // Fetch period events
      const { data: periodEvents } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", startDate.toISOString());

      // Fetch today's events
      const { data: todayData } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", todayStart.toISOString());

      // Fetch yesterday's events
      const { data: yesterdayData } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", yesterdayStart.toISOString())
        .lt("created_at", todayStart.toISOString());

      // Fetch active sessions (last 30 minutes)
      const { data: recentEvents } = await supabase
        .from("analytics_events")
        .select("session_id")
        .gte("created_at", thirtyMinutesAgo.toISOString());

      setAllEvents((periodEvents as AnalyticsEvent[]) || []);
      setTodayEvents((todayData as AnalyticsEvent[]) || []);
      setYesterdayEvents((yesterdayData as AnalyticsEvent[]) || []);

      const uniqueRecentSessions = new Set(
        (recentEvents || []).map((e) => e.session_id).filter(Boolean)
      );
      setRecentSessions(uniqueRecentSessions.size);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // ─── Computed: Today Stats ─────────────────────────────────────────

  const todayStats: TodayStats = useMemo(() => {
    const todayViews = todayEvents.filter((e) => e.event_type === "page_view").length;
    const todayClicks = todayEvents.filter((e) => e.event_type === "provider_click").length;
    const todayCTR = todayViews > 0 ? (todayClicks / todayViews) * 100 : 0;

    const yesterdayViews = yesterdayEvents.filter((e) => e.event_type === "page_view").length;
    const yesterdayClicks = yesterdayEvents.filter((e) => e.event_type === "provider_click").length;
    const yesterdayCTR = yesterdayViews > 0 ? (yesterdayClicks / yesterdayViews) * 100 : 0;

    const ctrChange = todayCTR - yesterdayCTR;

    return {
      pageViews: todayViews,
      clicks: todayClicks,
      ctr: todayCTR,
      ctrChange,
      activeSessions: recentSessions,
    };
  }, [todayEvents, yesterdayEvents, recentSessions]);

  // ─── Computed: Period Stats ────────────────────────────────────────

  const periodStats: PeriodStats = useMemo(() => {
    const totalPageViews = allEvents.filter((e) => e.event_type === "page_view").length;
    const totalProviderClicks = allEvents.filter((e) => e.event_type === "provider_click").length;
    const homepageViews = allEvents.filter(
      (e) => e.event_type === "page_view" && (e.page_path === "/" || e.page_path === "")
    ).length;
    const overallCTR = homepageViews > 0 ? (totalProviderClicks / homepageViews) * 100 : 0;
    const uniqueVisitors = new Set(allEvents.map((e) => e.session_id).filter(Boolean)).size;
    const quizCompletions = allEvents.filter((e) => e.event_type === "quiz_completed").length;

    return { totalPageViews, totalProviderClicks, overallCTR, uniqueVisitors, quizCompletions };
  }, [allEvents]);

  // ─── Computed: Provider Click Data ─────────────────────────────────

  const providerClicks: ProviderClickData[] = useMemo(() => {
    const clickEvents = allEvents.filter((e) => e.event_type === "provider_click");
    const homepageViews = allEvents.filter(
      (e) => e.event_type === "page_view" && (e.page_path === "/" || e.page_path === "")
    ).length;

    const providerMap = new Map<string, number>();
    clickEvents.forEach((e) => {
      const meta = e.metadata as Record<string, unknown> | null;
      const name = (meta?.name as string) || (meta?.provider_name as string) || "Unknown";
      providerMap.set(name, (providerMap.get(name) || 0) + 1);
    });

    const totalClicks = clickEvents.length;
    return Array.from(providerMap.entries())
      .map(([provider_name, clicks]) => ({
        provider_name,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0,
        ctr: homepageViews > 0 ? (clicks / homepageViews) * 100 : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [allEvents]);

  // ─── Computed: Top Pages ───────────────────────────────────────────

  const topPages: PageViewData[] = useMemo(() => {
    const pageMap = new Map<string, number>();
    allEvents
      .filter((e) => e.event_type === "page_view" && e.page_path)
      .forEach((e) => {
        pageMap.set(e.page_path!, (pageMap.get(e.page_path!) || 0) + 1);
      });
    return Array.from(pageMap.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [allEvents]);

  // ─── Computed: Referrers ───────────────────────────────────────────

  const referrers: ReferrerData[] = useMemo(() => {
    const referrerMap = new Map<string, number>();
    allEvents
      .filter((e) => e.referrer && e.referrer !== "")
      .forEach((e) => {
        try {
          const domain = new URL(e.referrer!).hostname || "Direct";
          referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
        } catch {
          referrerMap.set("Direct", (referrerMap.get("Direct") || 0) + 1);
        }
      });

    // Add direct traffic (no referrer)
    const directCount = allEvents.filter((e) => !e.referrer || e.referrer === "").length;
    if (directCount > 0) {
      referrerMap.set("Direct", (referrerMap.get("Direct") || 0) + directCount);
    }

    return Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [allEvents]);

  // ─── Computed: Time Series ─────────────────────────────────────────

  const timeSeriesData: TimeSeriesPoint[] = useMemo(() => {
    const dateMap = new Map<string, { views: number; clicks: number }>();
    allEvents.forEach((e) => {
      const date = format(new Date(e.created_at), "MM/dd");
      const current = dateMap.get(date) || { views: 0, clicks: 0 };
      if (e.event_type === "page_view") current.views++;
      if (e.event_type === "provider_click") current.clicks++;
      dateMap.set(date, current);
    });
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allEvents]);

  // ─── Export Handler ────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      let query = supabase.from("analytics_events").select("*");
      if (exportDateRange !== "all") {
        const days = exportDateRange === "7d" ? 7 : exportDateRange === "30d" ? 30 : 90;
        const start = subDays(new Date(), days);
        query = query.gte("created_at", start.toISOString());
      }
      const { data } = await query.order("created_at", { ascending: false });
      if (!data || data.length === 0) return;

      const headers = ["id", "event_type", "page_path", "referrer", "session_id", "metadata", "created_at"];
      const csvRows = [
        headers.join(","),
        ...data.map((row: Record<string, unknown>) =>
          headers
            .map((h) => {
              const val = row[h];
              if (val === null || val === undefined) return "";
              if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // ─── Loading State ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────

  const maxProviderClicks = providerClicks.length > 0 ? providerClicks[0].clicks : 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track visitor behavior, partner performance, and engagement
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Today's Stats (Real-time feel) ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-green-500" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Today - Live
          </h2>
          <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
            Real-time
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views Today</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.pageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total views since midnight</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks Today</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.clicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Provider clicks since midnight</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CTR Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{todayStats.ctr.toFixed(1)}%</span>
                {todayStats.ctrChange !== 0 && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      todayStats.ctrChange > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {todayStats.ctrChange > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(todayStats.ctrChange).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{todayStats.activeSessions}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unique sessions in last 30 min</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Period Stats ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Period Stats - {timeRange === "7d" ? "Last 7 Days" : timeRange === "30d" ? "Last 30 Days" : "Last 90 Days"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodStats.totalPageViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodStats.totalProviderClicks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall CTR</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodStats.overallCTR.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodStats.uniqueVisitors.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Completions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodStats.quizCompletions.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Partner Click Share (Most Important) ─────────────────────── */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Partner Click Share</CardTitle>
          </div>
          <CardDescription>
            Click distribution across providers - {periodStats.totalProviderClicks} total clicks in period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {providerClicks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No provider click data yet</p>
          ) : (
            <>
              {/* Horizontal Bar Chart */}
              <ResponsiveContainer width="100%" height={Math.max(200, providerClicks.length * 45)}>
                <BarChart data={providerClicks} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="provider_name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 13 }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} clicks`, "Clicks"]}
                  />
                  <Bar dataKey="clicks" radius={[0, 4, 4, 0]}>
                    {providerClicks.map((_, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={PROVIDER_COLORS[index % PROVIDER_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Provider</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="w-[200px]">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providerClicks.map((provider, index) => (
                    <TableRow key={provider.provider_name}>
                      <TableCell className="font-medium">{provider.provider_name}</TableCell>
                      <TableCell className="text-right">{provider.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{provider.percentage.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">{provider.ctr.toFixed(2)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all"
                            style={{
                              width: `${(provider.clicks / maxProviderClicks) * 100}%`,
                              backgroundColor: PROVIDER_COLORS[index % PROVIDER_COLORS.length],
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Tabs ─────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partner-clicks">Partner Clicks</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>Page views and provider clicks trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Page Views"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Provider Clicks"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Clicks Tab (detailed) */}
        <TabsContent value="partner-clicks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Click Trends</CardTitle>
              <CardDescription>
                Detailed click performance per provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              {providerClicks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No provider click data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={providerClicks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider_name" angle={-35} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        if (name === "Clicks") return [value, "Clicks"];
                        return [`${Number(value).toFixed(2)}%`, "CTR"];
                      }}
                    />
                    <Bar dataKey="clicks" fill="#6366f1" name="Clicks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Click Share Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={providerClicks}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      dataKey="clicks"
                      nameKey="provider_name"
                      label={({ name, percent }: any) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {providerClicks.map((_, index) => (
                        <Cell key={`pie-${index}`} fill={PROVIDER_COLORS[index % PROVIDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {providerClicks.map((provider, index) => (
                    <div key={provider.provider_name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PROVIDER_COLORS[index % PROVIDER_COLORS.length] }}
                      />
                      <span className="flex-1 text-sm font-medium truncate">
                        {provider.provider_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {provider.clicks} ({provider.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {topPages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No page view data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(250, topPages.length * 40)}>
                  <BarChart data={topPages} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="page"
                      type="category"
                      width={180}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" name="Views" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors come from</CardDescription>
            </CardHeader>
            <CardContent>
              {referrers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No referrer data yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={referrers}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="count"
                        nameKey="referrer"
                        label={({ name, percent }: any) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {referrers.map((_, index) => (
                          <Cell key={`ref-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {referrers.map((ref, index) => {
                      const total = referrers.reduce((sum, r) => sum + r.count, 0);
                      const pct = total > 0 ? ((ref.count / total) * 100).toFixed(1) : "0";
                      return (
                        <div key={ref.referrer} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="flex-1 text-sm font-medium truncate">{ref.referrer}</span>
                          <span className="text-sm text-muted-foreground">
                            {ref.count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Analytics Data
              </CardTitle>
              <CardDescription>
                Download raw analytics events as CSV for external analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date Range</label>
                  <Select
                    value={exportDateRange}
                    onValueChange={(v: "7d" | "30d" | "90d" | "all") => setExportDateRange(v)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-5">
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4 bg-muted/50">
                <h4 className="text-sm font-semibold mb-2">Export Preview</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The CSV will include the following columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["id", "event_type", "page_path", "referrer", "session_id", "metadata", "created_at"].map(
                    (col) => (
                      <Badge key={col} variant="secondary">
                        {col}
                      </Badge>
                    )
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Event types included: page_view, provider_click, quiz_completed, and any others recorded.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
