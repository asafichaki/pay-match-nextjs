"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isPast } from "date-fns";

interface Lead {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  follow_up_date: string | null;
  deal_value: number | null;
  priority: string | null;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  created_at: string;
  lead_id: string;
  quiz_leads?: { full_name: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  contacted: { label: "Contacted", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  qualified: { label: "Qualified", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  converted: { label: "Converted", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  lost: { label: "Lost", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-amber-500" />,
  message: <MessageSquare className="h-4 w-4 text-purple-500" />,
  meeting: <Calendar className="h-4 w-4 text-green-500" />,
  status_change: <CheckCircle2 className="h-4 w-4 text-teal-500" />,
  note: <MessageSquare className="h-4 w-4 text-gray-500" />,
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg} border ${config.border}`}
    >
      {config.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-8 bg-muted rounded w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 py-3">
      <div className="h-4 bg-muted rounded w-1/4" />
      <div className="h-4 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-16" />
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pipelineCounts, setPipelineCounts] = useState<Record<string, number>>({
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  });
  const [totalLeads, setTotalLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [totalDealValue, setTotalDealValue] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    const todayStr = new Date().toISOString().split("T")[0];

    const [
      pipelineRes,
      recentRes,
      followUpRes,
      dealValueRes,
      weekRes,
      activitiesRes,
    ] = await Promise.all([
      supabase.from("quiz_leads").select("status"),
      supabase
        .from("quiz_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("quiz_leads")
        .select("*")
        .not("follow_up_date", "is", null)
        .lte("follow_up_date", todayStr)
        .order("follow_up_date"),
      supabase.from("quiz_leads").select("deal_value").eq("status", "converted"),
      supabase
        .from("quiz_leads")
        .select("id", { count: "exact" })
        .gte("created_at", sevenDaysAgoISO),
      supabase
        .from("lead_activities")
        .select("*, quiz_leads(full_name)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Pipeline counts
    if (pipelineRes.data) {
      const counts: Record<string, number> = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
      const total = pipelineRes.data.length;
      pipelineRes.data.forEach((row: { status: string }) => {
        const s = row.status?.toLowerCase() || "new";
        if (counts[s] !== undefined) counts[s]++;
      });
      setPipelineCounts(counts);
      setTotalLeads(total);
      setConversionRate(total > 0 ? Math.round((counts.converted / total) * 100) : 0);
    }

    // Recent leads
    if (recentRes.data) {
      setRecentLeads(recentRes.data as Lead[]);
    }

    // Follow-ups
    if (followUpRes.data) {
      setFollowUps(followUpRes.data as Lead[]);
    }

    // Deal value
    if (dealValueRes.data) {
      const sum = dealValueRes.data.reduce(
        (acc: number, row: { deal_value: number | null }) => acc + (row.deal_value || 0),
        0
      );
      setTotalDealValue(sum);
    }

    // New this week
    setNewThisWeek(weekRes.count || 0);

    // Activities - handle potential join failure
    if (activitiesRes.data) {
      setActivities(activitiesRes.data as unknown as Activity[]);
    } else {
      // Retry without the join if it failed
      const fallbackRes = await supabase
        .from("lead_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (fallbackRes.data) {
        setActivities(fallbackRes.data as unknown as Activity[]);
      }
    }

    setLoading(false);
  };

  const getDaysOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followDate = new Date(dateStr);
    followDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - followDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s your lead pipeline at a glance.
          </p>
        </div>

        {/* Lead Pipeline Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground uppercase tracking-wide text-sm">
            Lead Pipeline
          </h2>
          {loading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {(["new", "contacted", "qualified", "converted", "lost"] as const).map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <Card
                    key={status}
                    className={`border-2 ${config.border} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => router.push(`/admin/leads?status=${status}`)}
                  >
                    <CardContent className="p-4 text-center">
                      <StatusBadge status={status} />
                      <div className="text-3xl font-bold mt-2">{pipelineCounts[status]}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">Converted / Total</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deal Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {totalDealValue.toLocaleString("en-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-muted-foreground">From converted leads</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{newThisWeek}</div>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Two-Column Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <Link
                href="/admin/leads"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-1 divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No leads yet.</p>
              ) : (
                <div className="space-y-0 divide-y">
                  {recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-4 px-4 rounded transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{lead.full_name || "Unnamed"}</p>
                        <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <StatusBadge status={lead.status} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(lead.created_at), "MMM d")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Follow-ups Due
              </CardTitle>
              <Badge variant="secondary">{followUps.length}</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-1 divide-y">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : followUps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">All caught up! No overdue follow-ups.</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y">
                  {followUps.map((lead) => {
                    const daysOverdue = getDaysOverdue(lead.follow_up_date!);
                    const isOverdue = daysOverdue > 0;
                    const isDueToday = daysOverdue === 0;
                    return (
                      <Link
                        key={lead.id}
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-4 px-4 rounded transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{lead.full_name || "Unnamed"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(lead.follow_up_date!), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="ml-4 shrink-0">
                          {isDueToday ? (
                            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                              Today
                            </Badge>
                          ) : isOverdue ? (
                            <span className="text-sm font-semibold text-red-600">
                              {daysOverdue}d overdue
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-1 divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No activities recorded yet.</p>
            ) : (
              <div className="space-y-0 divide-y">
                {activities.map((activity) => {
                  const icon = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.note;
                  const leadName =
                    activity.quiz_leads?.full_name || null;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 py-3">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {leadName && (
                          <p className="text-xs text-muted-foreground">{leadName}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
