"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Activity, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveLocal, rejectLocal, unpublishFeedItem } from "./actions";

interface CronHealthRow {
  id: string;
  job_name: string;
  status: string;
  items_processed: number | null;
  items_published: number | null;
  items_rejected: number | null;
  errors: string | null;
  ran_at: string;
  cost_usd_estimate: number | null;
}

interface PendingRow {
  id: string;
  kind: string;
  reason: string | null;
  payload: Record<string, unknown>;
  expires_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface FeedRow {
  id: string;
  type: string;
  title: string;
  slug: string;
  status: string;
  related_processor: string | null;
  voice_score: number | null;
  published_at: string;
}

function statusBadge(s: string) {
  if (s === "ok" || s === "success")
    return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">OK</Badge>;
  if (s === "partial")
    return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Partial</Badge>;
  if (s === "fail" || s === "error")
    return <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">Fail</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

function HealthTab() {
  const [rows, setRows] = useState<CronHealthRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("cron_health")
        .select("*")
        .order("ran_at", { ascending: false })
        .limit(30);
      setRows((data as CronHealthRow[]) || []);
    })();
  }, []);

  const summary = useMemo(() => {
    if (!rows) return null;
    const byJob: Record<string, CronHealthRow[]> = {};
    for (const r of rows) {
      (byJob[r.job_name] ||= []).push(r);
    }
    const today = new Date().toISOString().slice(0, 10);
    const todaySpend = rows
      .filter((r) => r.ran_at.startsWith(today))
      .reduce((sum, r) => sum + (Number(r.cost_usd_estimate) || 0), 0);
    return { byJob, todaySpend };
  }, [rows]);

  if (!rows) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No cron runs logged yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&rsquo;s Claude spend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            ${(summary?.todaySpend || 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sum of cost_usd_estimate across all jobs that ran today.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {summary &&
          Object.entries(summary.byJob).map(([jobName, runs]) => {
            const last = runs[0];
            const successCount = runs.filter(
              (r) => r.status === "ok" || r.status === "success"
            ).length;
            const successRate = runs.length > 0 ? Math.round((successCount / runs.length) * 100) : 0;
            return (
              <Card key={jobName}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{jobName}</CardTitle>
                    {statusBadge(last.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last run</span>
                    <span className="tabular-nums">
                      {formatDistanceToNow(new Date(last.ran_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success rate (last {runs.length})</span>
                    <span className="tabular-nums">{successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last processed</span>
                    <span className="tabular-nums">{last.items_processed ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last published</span>
                    <span className="tabular-nums">{last.items_published ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last rejected</span>
                    <span className="tabular-nums">{last.items_rejected ?? 0}</span>
                  </div>
                  {last.errors && (
                    <div className="mt-2 p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {last.errors.slice(0, 200)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function PendingTab() {
  const [rows, setRows] = useState<PendingRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = async () => {
    const { data } = await (supabase as any)
      .from("pending_review")
      .select("*")
      .is("resolved_at", null)
      .order("created_at", { ascending: false });
    setRows((data as PendingRow[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = (id: string) => {
    setBusy(id);
    startTransition(async () => {
      const r = await approveLocal(id);
      setBusy(null);
      if (!r.success) alert(`Approve failed: ${r.error}`);
      else load();
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("Reject reason (optional):") || "";
    setBusy(id);
    startTransition(async () => {
      const r = await rejectLocal(id, reason);
      setBusy(null);
      if (!r.success) alert(`Reject failed: ${r.error}`);
      else load();
    });
  };

  if (!rows) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
          Queue is clear. Nothing pending review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <Card key={row.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{row.kind}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  disabled={busy === row.id}
                  onClick={() => handleApprove(row.id)}
                >
                  {busy === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === row.id}
                  onClick={() => handleReject(row.id)}
                >
                  Reject
                </Button>
              </div>
            </div>
            {row.reason && (
              <CardTitle className="text-sm font-medium mt-2 text-muted-foreground">
                {row.reason}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(row.payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FeedTab() {
  const [rows, setRows] = useState<FeedRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = async () => {
    const { data } = await (supabase as any)
      .from("updates_feed")
      .select("id,type,title,slug,status,related_processor,voice_score,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    setRows((data as FeedRow[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnpublish = (id: string) => {
    if (!confirm("Unpublish this item?")) return;
    setBusy(id);
    startTransition(async () => {
      const r = await unpublishFeedItem(id);
      setBusy(null);
      if (!r.success) alert(`Unpublish failed: ${r.error}`);
      else load();
    });
  };

  if (!rows) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No published items yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <Card key={row.id}>
          <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{row.type}</Badge>
                {row.related_processor && (
                  <Badge variant="outline" className="text-xs">{row.related_processor}</Badge>
                )}
                {typeof row.voice_score === "number" && (
                  <span className="text-xs text-muted-foreground">voice: {row.voice_score}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(row.published_at), { addSuffix: true })}
                </span>
              </div>
              <a
                href={`/updates/${row.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:text-primary truncate block"
              >
                {row.title}
              </a>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={busy === row.id}
              onClick={() => handleUnpublish(row.id)}
            >
              {busy === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                <><XCircle className="h-3 w-3 mr-1" />Unpublish</>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminUpdatesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Live Updates
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cron health, pending review queue, published feed.
        </p>
      </div>

      <Tabs defaultValue="health">
        <TabsList className="mb-6">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="health"><HealthTab /></TabsContent>
        <TabsContent value="pending"><PendingTab /></TabsContent>
        <TabsContent value="feed"><FeedTab /></TabsContent>
      </Tabs>
    </div>
  );
}
