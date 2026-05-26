"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, RefreshCw, CheckCircle2, Eye, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { retryFailedCapture, markFailureResolved } from "./actions";

interface FailureRow {
  id: string;
  source: string;
  payload: Record<string, any> | null;
  error_code: string | null;
  error_message: string | null;
  page_url: string | null;
  user_agent: string | null;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_note: string | null;
  retry_count: number;
}

const SOURCE_COLORS: Record<string, string> = {
  subscribeNewsletter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  submitQuizLead: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  submitSortingHatLead:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
};

const SOURCE_LABELS: Record<string, string> = {
  subscribeNewsletter: "Newsletter",
  submitQuizLead: "Quiz",
  submitSortingHatLead: "Sorting-Hat",
};

function dateHeIL(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function emailFromPayload(payload: Record<string, any> | null): string {
  if (!payload) return "—";
  return (
    payload.email ||
    payload.full_name ||
    payload.fullName ||
    "—"
  );
}

export default function FailedLeadsPage() {
  const [rows, setRows] = useState<FailureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [viewPayload, setViewPayload] = useState<FailureRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    // Cast: lead_capture_failures is not in the generated types.ts yet
    const { data, error } = await (supabase as any)
      .from("lead_capture_failures")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Error loading failures", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as FailureRow[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((r) => (showResolved ? true : !r.resolved));

  const pendingCount = rows.filter((r) => !r.resolved).length;
  const resolvedCount = rows.filter((r) => r.resolved).length;

  const handleRetry = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await retryFailedCapture(id);
      if (result.success) {
        toast({
          title: "Retry succeeded",
          description: `Lead moved to ${result.movedTo}`,
        });
      } else {
        toast({
          title: "Retry failed",
          description: result.error,
          variant: "destructive",
        });
      }
      setBusyId(null);
      await load();
    });
  };

  const handleMarkResolved = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await markFailureResolved(id, "manual-resolved");
      if (result.success) {
        toast({ title: "Marked resolved" });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      setBusyId(null);
      await load();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-7 w-7 text-amber-500" />
                Failed Lead Captures
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Lead capture failures across all forms, retry or mark resolved
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowResolved((v) => !v)}>
              {showResolved ? "Hide resolved" : "Show resolved"}
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{rows.length}</div>
            <div className="text-xs text-muted-foreground">Total (last 500)</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        <span>No {showResolved ? "" : "pending "}failures. The capture pipeline is healthy.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id} className={row.resolved ? "opacity-60" : ""}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {dateHeIL(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={SOURCE_COLORS[row.source] || ""}
                        >
                          {SOURCE_LABELS[row.source] || row.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{emailFromPayload(row.payload)}</TableCell>
                      <TableCell className="text-sm max-w-[280px]">
                        <div className="font-mono text-xs">{row.error_code || "—"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {row.error_message || ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{row.retry_count}</TableCell>
                      <TableCell>
                        {row.resolved ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewPayload(row)}
                            title="View full payload"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!row.resolved && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(row.id)}
                                disabled={isPending && busyId === row.id}
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 mr-1 ${
                                    isPending && busyId === row.id ? "animate-spin" : ""
                                  }`}
                                />
                                Retry
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkResolved(row.id)}
                                disabled={isPending && busyId === row.id}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Payload Dialog */}
      <Dialog open={!!viewPayload} onOpenChange={(o) => !o && setViewPayload(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Failure Payload</DialogTitle>
            <DialogDescription>
              Full request payload + metadata from this failed capture
            </DialogDescription>
          </DialogHeader>
          {viewPayload && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Source</div>
                  <div>{viewPayload.source}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Created</div>
                  <div>{dateHeIL(viewPayload.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Error Code</div>
                  <div className="font-mono">{viewPayload.error_code || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Retries</div>
                  <div>{viewPayload.retry_count}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground uppercase">Error Message</div>
                  <div className="text-xs break-words">{viewPayload.error_message || "—"}</div>
                </div>
                {viewPayload.page_url && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground uppercase">Page URL</div>
                    <div className="text-xs break-words">{viewPayload.page_url}</div>
                  </div>
                )}
                {viewPayload.resolved && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground uppercase">
                      Resolved
                    </div>
                    <div className="text-xs">
                      {viewPayload.resolved_at ? dateHeIL(viewPayload.resolved_at) : ""} —{" "}
                      {viewPayload.resolved_note || ""}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Payload JSON</div>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-[300px]">
                  {JSON.stringify(viewPayload.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
