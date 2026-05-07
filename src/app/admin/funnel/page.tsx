"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Mail,
  Calendar,
  CheckCircle2,
  Search,
  ExternalLink,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FunnelLead {
  id: string;
  full_name: string | null;
  email: string;
  track: string | null;
  track_variant: string | null;
  pain_point: string | null;
  volume_tier: string | null;
  business_type: string | null;
  funnel_state: string | null;
  email_state: Record<string, Record<string, unknown>> | null;
  calendly_booked_at: string | null;
  calendly_booking_id: string | null;
  status: string | null;
  created_at: string;
  integration_needs: string | null;
}

const TRACK_LABEL: Record<string, string> = {
  A: "Track A · Online",
  B: "Track B · In-Person",
  C: "Track C · Complex",
  MANUAL: "Manual review",
};

const STATE_LABEL: Record<string, string> = {
  day0: "Day 0 — confirmation sent",
  day1: "Day 1 — shortlist sent",
  day4: "Day 4 — pain-point sent",
  day9: "Day 9 — demo questions sent",
  day13: "Day 13 — follow-up",
  day17: "Day 17 — decision frame",
  complete: "Complete",
  booked: "Booked Calendly",
  unsubscribed: "Unsubscribed",
};

function trackBadgeClass(track: string | null) {
  if (track === "A") return "bg-blue-100 text-blue-700 border-blue-200";
  if (track === "B") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (track === "C") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function tally(events: Record<string, Record<string, unknown>> | null) {
  let sent = 0,
    opened = 0,
    clicked = 0;
  if (!events) return { sent, opened, clicked };
  for (const v of Object.values(events)) {
    if (v?.sent_at) sent++;
    if (v?.opened) opened++;
    if (v?.clicked) clicked++;
  }
  return { sent, opened, clicked };
}

export default function FunnelDashboard() {
  const [leads, setLeads] = useState<FunnelLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("quiz_leads")
        .select(
          "id, full_name, email, status, created_at, integration_needs, track, track_variant, pain_point, volume_tier, business_type, funnel_state, email_state, calendly_booked_at, calendly_booking_id"
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (mounted) {
        setLeads((data || []) as unknown as FunnelLead[]);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive metrics
  const metrics = useMemo(() => {
    const now = Date.now();
    const last28 = now - 28 * 86400_000;
    const recent = leads.filter((l) => new Date(l.created_at).getTime() >= last28);

    return {
      total: recent.length,
      booked: recent.filter((l) => l.calendly_booked_at).length,
      trackA: recent.filter((l) => l.track === "A").length,
      trackB: recent.filter((l) => l.track === "B").length,
      trackC: recent.filter((l) => l.track === "C").length,
      sent: recent.reduce((acc, l) => acc + tally(l.email_state).sent, 0),
      opened: recent.reduce((acc, l) => acc + tally(l.email_state).opened, 0),
      clicked: recent.reduce((acc, l) => acc + tally(l.email_state).clicked, 0),
    };
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (trackFilter && l.track !== trackFilter) return false;
      if (stateFilter && l.funnel_state !== stateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(l.full_name || "").toLowerCase().includes(q) &&
          !(l.email || "").toLowerCase().includes(q) &&
          !(l.pain_point || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [leads, trackFilter, stateFilter, search]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funnel</h1>
          <p className="text-sm text-muted-foreground">
            Sorting Hat leads, Funnel v4.1 state, and Calendly bookings · last 28 days
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/funnel/distribution">
            <Button variant="default" size="sm">Lead distribution</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">Classic dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Total leads" value={metrics.total} icon={Users} />
        <MetricCard label="Calendly booked" value={metrics.booked} icon={Calendar} accent />
        <MetricCard label="Emails sent" value={metrics.sent} icon={Mail} />
        <MetricCard label="Opened" value={metrics.opened} icon={Activity} />
        <MetricCard label="Clicked" value={metrics.clicked} icon={Activity} />
        <MetricCard label="Track A" value={metrics.trackA} />
        <MetricCard label="Track B / C" value={metrics.trackB + metrics.trackC} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, pain point..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["A", "B", "C"].map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={trackFilter === t ? "default" : "outline"}
                  onClick={() => setTrackFilter(trackFilter === t ? null : t)}
                >
                  Track {t}
                </Button>
              ))}
              {["day0", "day1", "day4", "day9", "day13", "day17", "booked"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={stateFilter === s ? "default" : "outline"}
                  onClick={() => setStateFilter(stateFilter === s ? null : s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads match the filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Lead</th>
                    <th className="py-2 pr-4">Track</th>
                    <th className="py-2 pr-4">State</th>
                    <th className="py-2 pr-4">Pain</th>
                    <th className="py-2 pr-4">Volume</th>
                    <th className="py-2 pr-4">Engagement</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const t = tally(l.email_state);
                    return (
                      <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-foreground">{l.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{l.email}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={trackBadgeClass(l.track) + " border"} variant="outline">
                            {l.track ? TRACK_LABEL[l.track] || `Track ${l.track}` : "—"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-foreground">
                            {l.calendly_booked_at ? "📅 Booked" : STATE_LABEL[l.funnel_state || ""] || l.funnel_state}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground max-w-[160px] truncate">
                          {l.pain_point || "—"}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{l.volume_tier || "—"}</td>
                        <td className="py-3 pr-4 text-xs">
                          <span className="text-muted-foreground">
                            sent {t.sent} · opened {t.opened} · clicked {t.clicked}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/leads/${l.id}`}
                            className="inline-flex items-center text-xs text-primary hover:underline"
                          >
                            Open <ExternalLink className="h-3 w-3 ml-0.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funnel waterfall by track */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["A", "B", "C"] as const).map((track) => (
          <FunnelWaterfall key={track} track={track} leads={leads} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon?: typeof Users;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-primary/40 bg-primary/5" : ""}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function FunnelWaterfall({ track, leads }: { track: "A" | "B" | "C"; leads: FunnelLead[] }) {
  const trackLeads = leads.filter((l) => l.track === track);
  const states = ["day0", "day1", "day4", "day9", "day13", "day17", "booked"];
  const counts: Record<string, number> = {};
  for (const s of states) counts[s] = 0;
  for (const l of trackLeads) {
    if (l.calendly_booked_at) counts.booked++;
    else if (l.funnel_state && counts[l.funnel_state] !== undefined) counts[l.funnel_state]++;
  }
  const max = Math.max(1, ...Object.values(counts));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{TRACK_LABEL[track]}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          {states.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">{s}</span>
              <div className="flex-1 bg-muted rounded-sm h-5 overflow-hidden">
                <div
                  className={`h-full ${s === "booked" ? "bg-primary" : "bg-foreground/60"}`}
                  style={{ width: `${(counts[s] / max) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">{counts[s]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
