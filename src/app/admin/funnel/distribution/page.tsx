"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  ExternalLink,
  ArrowLeft,
  Send,
  Download,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string | null;
  webhook_url: string | null;
  active: boolean;
  criteria_track: string[] | null;
  criteria_volume_tier: string[] | null;
  criteria_industry: string[] | null;
  price_per_lead: number | null;
}

interface Distribution {
  id: string;
  lead_id: string;
  agent_name: string;
  delivery_method: string;
  delivery_status: string;
  delivered_at: string | null;
  agent_outcome: string | null;
  outcome_notes: string | null;
  price: number | null;
  created_at: string;
}

const TRACK_OPTIONS = ["A", "B", "C"];
const VOLUME_OPTIONS = ["under_50k", "50k_to_250k", "250k_to_1m", "over_1m", "pre_launch"];

export default function DistributionPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for new/edit agent
  const [draft, setDraft] = useState<Partial<Agent>>({
    name: "",
    email: "",
    webhook_url: "",
    active: true,
    criteria_track: [],
    criteria_volume_tier: [],
    price_per_lead: 50,
  });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    const [agentsRes, distRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("funnel_agents").select("*").order("created_at", { ascending: false }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("lead_distributions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (agentsRes.error && !/relation .* does not exist/i.test(agentsRes.error.message)) {
      setError(agentsRes.error.message);
    }
    setAgents((agentsRes.data || []) as Agent[]);
    setDistributions((distRes.data || []) as Distribution[]);
    setLoading(false);
  }

  async function saveAgent() {
    if (!draft.name?.trim()) {
      setError("Agent name is required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: draft.name.trim(),
      email: draft.email?.trim() || null,
      webhook_url: draft.webhook_url?.trim() || null,
      active: draft.active ?? true,
      criteria_track: draft.criteria_track && draft.criteria_track.length > 0 ? draft.criteria_track : null,
      criteria_volume_tier:
        draft.criteria_volume_tier && draft.criteria_volume_tier.length > 0 ? draft.criteria_volume_tier : null,
      price_per_lead: draft.price_per_lead || null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertErr } = await (supabase as any).from("funnel_agents").insert(payload);
    setSaving(false);
    if (insertErr) {
      if (/relation .* does not exist/i.test(insertErr.message)) {
        setError(
          "The funnel_agents table does not exist yet. Run the SQL migration first (supabase/migrations/20260507_funnel_v41_extensions.sql)."
        );
      } else {
        setError(insertErr.message);
      }
      return;
    }
    setDraft({ name: "", email: "", webhook_url: "", active: true, criteria_track: [], criteria_volume_tier: [], price_per_lead: 50 });
    refresh();
  }

  async function deleteAgent(id: string) {
    if (!confirm("Delete this agent? Past distributions are kept.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("funnel_agents").delete().eq("id", id);
    refresh();
  }

  async function toggleActive(agent: Agent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("funnel_agents").update({ active: !agent.active }).eq("id", agent.id);
    refresh();
  }

  const distByAgent = useMemo(() => {
    const map = new Map<string, { count: number; sold: number; revenue: number }>();
    for (const d of distributions) {
      const cur = map.get(d.agent_name) || { count: 0, sold: 0, revenue: 0 };
      cur.count++;
      if (d.agent_outcome === "closed" || d.delivery_status === "delivered") {
        cur.sold++;
        cur.revenue += Number(d.price || 0);
      }
      map.set(d.agent_name, cur);
    }
    return map;
  }, [distributions]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/funnel" className="hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Funnel
            </Link>
            <span>·</span>
            <span>Distribution</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Lead Distribution</h1>
          <p className="text-sm text-muted-foreground">
            Sell qualified leads to agents via webhook or daily CSV digest, filtered by track and volume tier.
          </p>
        </div>
      </header>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Agent name</Label>
              <Input
                value={draft.name || ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Barak / Dean / Crown Coins"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email (for CSV digest)</Label>
              <Input
                type="email"
                value={draft.email || ""}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="agent@example.com"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Webhook URL (POST per lead)</Label>
              <Input
                type="url"
                value={draft.webhook_url || ""}
                onChange={(e) => setDraft({ ...draft, webhook_url: e.target.value })}
                placeholder="https://hooks.example.com/leads"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Track filter</Label>
              <div className="flex gap-2 mt-1.5">
                {TRACK_OPTIONS.map((t) => {
                  const selected = (draft.criteria_track || []).includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        const cur = draft.criteria_track || [];
                        setDraft({
                          ...draft,
                          criteria_track: selected ? cur.filter((x) => x !== t) : [...cur, t],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs ${
                        selected ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                      }`}
                    >
                      Track {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Volume tier filter</Label>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {VOLUME_OPTIONS.map((v) => {
                  const selected = (draft.criteria_volume_tier || []).includes(v);
                  return (
                    <button
                      type="button"
                      key={v}
                      onClick={() => {
                        const cur = draft.criteria_volume_tier || [];
                        setDraft({
                          ...draft,
                          criteria_volume_tier: selected ? cur.filter((x) => x !== v) : [...cur, v],
                        });
                      }}
                      className={`px-2.5 py-1 rounded-md border text-xs ${
                        selected ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Price per lead (USD)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={draft.price_per_lead ?? 0}
                onChange={(e) => setDraft({ ...draft, price_per_lead: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={saveAgent} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Save agent"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active agents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No agents yet. Add one above. (If you see an error about missing tables, run the
              funnel SQL migration first.)
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">Agent</th>
                    <th className="py-2 pr-4">Filters</th>
                    <th className="py-2 pr-4">Delivery</th>
                    <th className="py-2 pr-4">Performance</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a) => {
                    const stats = distByAgent.get(a.name) || { count: 0, sold: 0, revenue: 0 };
                    return (
                      <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-foreground">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.email || "no email"}</div>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {a.criteria_track?.length ? (
                            <Badge variant="outline" className="mr-1">
                              {a.criteria_track.map((t) => `Track ${t}`).join(", ")}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">all tracks</span>
                          )}
                          <br />
                          {a.criteria_volume_tier?.length ? (
                            <span className="text-muted-foreground">{a.criteria_volume_tier.join(", ")}</span>
                          ) : (
                            <span className="text-muted-foreground">all volumes</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {a.webhook_url ? (
                            <span className="inline-flex items-center gap-1">
                              <Send className="h-3 w-3" />
                              webhook
                            </span>
                          ) : a.email ? (
                            <span className="inline-flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              CSV digest
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {stats.count} sent · {stats.sold} closed · ${stats.revenue.toFixed(0)}
                        </td>
                        <td className="py-3 pr-4 text-xs">${Number(a.price_per_lead || 0).toFixed(0)}</td>
                        <td className="py-3 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => toggleActive(a)}>
                            {a.active ? "Pause" : "Resume"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteAgent(a.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent distributions</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deliveries logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Agent</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Outcome</th>
                    <th className="py-2 pr-4">$</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((d) => (
                    <tr key={d.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">{d.agent_name}</td>
                      <td className="py-2 pr-4 text-xs">{d.delivery_method}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{d.delivery_status}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {d.agent_outcome || "—"}
                      </td>
                      <td className="py-2 pr-4">${Number(d.price || 0).toFixed(0)}</td>
                      <td className="py-2">
                        <Link
                          href={`/admin/leads/${d.lead_id}`}
                          className="text-xs text-primary inline-flex items-center hover:underline"
                        >
                          Lead <ExternalLink className="h-3 w-3 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
