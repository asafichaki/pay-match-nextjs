"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Download,
  Search,
  Trash2,
  Eye,
  LayoutGrid,
  TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  GripVertical,
  AlertTriangle,
  Inbox,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

interface QuizLead {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  monthly_volume: string | null;
  business_type: string | null;
  industry: string | null;
  recommended_provider: string | null;
  status: string;
  priority: string | null;
  deal_value: number | null;
  follow_up_date: string | null;
  last_contacted: string | null;
  tags: string[] | null;
  notes: string | null;
  source: string | null;
  // Unified-inbox fields
  lead_source: string | null;
  funnel_state: string | null;
  volume_tier: string | null;
  track: string | null;
  // Discriminator: which underlying table did this row come from?
  // "quiz_leads" (default — quiz + sorting-hat) or "newsletter_subscribers"
  origin_table: "quiz_leads" | "newsletter_subscribers";
}

type ViewMode = "table" | "kanban";
type SortField =
  | "full_name"
  | "email"
  | "business_type"
  | "monthly_volume"
  | "status"
  | "priority"
  | "last_contacted"
  | "follow_up_date"
  | "deal_value"
  | "created_at";
type SortDirection = "asc" | "desc";

const STATUSES = ["new", "contacted", "qualified", "proposal", "converted", "lost"] as const;
const KANBAN_COLUMNS = ["new", "contacted", "qualified", "proposal", "converted"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  proposal: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function getLastContactStyle(lastContacted: string | null): {
  text: string;
  className: string;
} {
  if (!lastContacted) {
    return { text: "Never", className: "text-red-500 font-medium" };
  }
  const days = differenceInDays(new Date(), new Date(lastContacted));
  const text = formatDistanceToNow(new Date(lastContacted), { addSuffix: true });
  if (days <= 7) return { text, className: "text-green-600 dark:text-green-400" };
  if (days <= 14) return { text, className: "text-orange-500" };
  return { text, className: "text-red-500 font-medium" };
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showLost, setShowLost] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [funnelFilter, setFunnelFilter] = useState<string>("all");
  const [failedCount, setFailedCount] = useState<number>(0);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
    loadFailedCount();
  }, []);

  const loadFailedCount = async () => {
    const { count } = await (supabase as any)
      .from("lead_capture_failures")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false);
    setFailedCount(count || 0);
  };

  const loadLeads = async () => {
    try {
      // Unified inbox: union quiz_leads + newsletter_subscribers.
      // sorting-hat lives inside quiz_leads (lead_source='sorting_hat')
      // so we only need two table reads, merged client-side and sorted.
      const [quizRes, newsRes] = await Promise.all([
        supabase
          .from("quiz_leads")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("newsletter_subscribers")
          .select("*")
          .order("subscribed_at", { ascending: false }),
      ]);

      if (quizRes.error) throw quizRes.error;
      if (newsRes.error) throw newsRes.error;

      const quizLeads: QuizLead[] = (quizRes.data || []).map((l: any) => ({
        ...l,
        origin_table: "quiz_leads" as const,
      }));

      // Adapt newsletter_subscribers into the QuizLead shape so they render in
      // the same table. Most fields are null — newsletter rows only have email,
      // source, subscribed_at, active. They get a "Newsletter" source badge.
      const newsletterLeads: QuizLead[] = (newsRes.data || []).map((n: any) => ({
        id: n.id,
        created_at: n.subscribed_at || new Date().toISOString(),
        full_name: "",
        email: n.email,
        phone: null,
        monthly_volume: null,
        business_type: null,
        industry: null,
        recommended_provider: null,
        status: n.active === false ? "lost" : "new",
        priority: null,
        deal_value: null,
        follow_up_date: null,
        last_contacted: null,
        tags: null,
        notes: null,
        source: n.source || "newsletter",
        lead_source: "newsletter",
        funnel_state: null,
        volume_tier: null,
        track: null,
        origin_table: "newsletter_subscribers" as const,
      }));

      const merged = [...quizLeads, ...newsletterLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLeads(merged);
    } catch (error: any) {
      toast({
        title: "Error loading leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      // Route delete to the correct origin table
      const target = leads.find((l) => l.id === deleteId);
      const table =
        target?.origin_table === "newsletter_subscribers"
          ? "newsletter_subscribers"
          : "quiz_leads";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Lead deleted successfully" });
      loadLeads();
    } catch (error: any) {
      toast({
        title: "Error deleting lead",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const updateLeadStatus = useCallback(
    async (leadId: string, newStatus: string) => {
      try {
        // Newsletter rows don't have a status column — status edits are
        // silently no-op'd on those rows (UI keeps the synthetic value).
        const target = leads.find((l) => l.id === leadId);
        if (target?.origin_table === "newsletter_subscribers") {
          setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
          );
          toast({ title: "Status (newsletter only — local)" });
          return;
        }
        const { error } = await supabase
          .from("quiz_leads")
          .update({ status: newStatus })
          .eq("id", leadId);
        if (error) throw error;
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        toast({ title: "Status updated", description: `Changed to ${newStatus}` });
      } catch (error: any) {
        toast({
          title: "Error updating status",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [toast, leads]
  );

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    try {
      // Only quiz_leads rows have a status column — filter newsletter ids out.
      const ids = Array.from(selectedIds).filter((id) => {
        const target = leads.find((l) => l.id === id);
        return target?.origin_table !== "newsletter_subscribers";
      });
      if (ids.length === 0) {
        toast({ title: "No applicable rows (newsletter rows skipped)" });
        return;
      }
      const { error } = await supabase
        .from("quiz_leads")
        .update({ status: newStatus })
        .in("id", ids);
      if (error) throw error;
      setLeads((prev) =>
        prev.map((l) => (selectedIds.has(l.id) ? { ...l, status: newStatus } : l))
      );
      setSelectedIds(new Set());
      toast({
        title: "Bulk update complete",
        description: `${ids.length} leads updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating leads",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredLeads = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 : null;
    return leads.filter((lead) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (lead.full_name || "").toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.business_type || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || lead.priority === priorityFilter;
      const effectiveSource =
        lead.origin_table === "newsletter_subscribers"
          ? "newsletter"
          : lead.lead_source === "sorting_hat"
            ? "sorting_hat"
            : "quiz";
      const matchesSource = sourceFilter === "all" || effectiveSource === sourceFilter;
      const created = new Date(lead.created_at).getTime();
      const matchesFrom = !fromTs || created >= fromTs;
      const matchesTo = !toTs || created <= toTs;
      const matchesFunnel =
        funnelFilter === "all" || (lead.funnel_state || "—") === funnelFilter;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSource &&
        matchesFrom &&
        matchesTo &&
        matchesFunnel
      );
    });
  }, [leads, search, statusFilter, priorityFilter, sourceFilter, dateFrom, dateTo, funnelFilter]);

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "priority") {
        aVal = PRIORITY_ORDER[aVal || "low"] ?? 4;
        bVal = PRIORITY_ORDER[bVal || "low"] ?? 4;
      }

      if (sortField === "deal_value") {
        aVal = aVal ?? 0;
        bVal = bVal ?? 0;
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredLeads, sortField, sortDirection]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUSES.forEach((s) => (counts[s] = 0));
    filteredLeads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [filteredLeads]);

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Email",
      "Phone",
      "Monthly Volume",
      "Business Type",
      "Industry",
      "Status",
      "Priority",
      "Deal Value",
      "Follow-up Date",
      "Last Contacted",
    ];
    const csvData = filteredLeads.map((lead) => [
      new Date(lead.created_at).toLocaleDateString(),
      lead.full_name,
      lead.email,
      lead.phone || "",
      lead.monthly_volume || "",
      lead.business_type || "",
      lead.industry || "",
      lead.status,
      lead.priority || "",
      lead.deal_value?.toString() || "",
      lead.follow_up_date || "",
      lead.last_contacted || "",
    ]);
    const csv = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: "Export successful",
      description: `Exported ${filteredLeads.length} leads to CSV`,
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedLeads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const StatusBadge = ({ lead }: { lead: QuizLead }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Badge
            className={`${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-800"} cursor-pointer hover:opacity-80 transition-opacity capitalize`}
          >
            {lead.status}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              if (s !== lead.status) updateLeadStatus(lead.id, s);
            }}
            className="capitalize"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  STATUS_COLORS[s]?.split(" ")[0] || "bg-gray-300"
                }`}
              />
              {s}
              {s === lead.status && (
                <span className="ml-auto text-xs text-muted-foreground">current</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
    quiz: {
      label: "Quiz",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    newsletter: {
      label: "Newsletter",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    sorting_hat: {
      label: "Sorting-Hat",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
  };

  const sourceKey = (lead: QuizLead) =>
    lead.origin_table === "newsletter_subscribers"
      ? "newsletter"
      : lead.lead_source === "sorting_hat"
        ? "sorting_hat"
        : "quiz";

  const SourceBadge = ({ lead }: { lead: QuizLead }) => {
    const key = sourceKey(lead);
    const cfg = SOURCE_BADGE[key];
    return <Badge className={cfg.className}>{cfg.label}</Badge>;
  };

  const PriorityDot = ({ priority }: { priority: string | null }) => (
    <div className="flex items-center gap-2">
      <div
        className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[priority || "low"] || "bg-gray-400"}`}
      />
      <span className="text-sm capitalize">{priority || "low"}</span>
    </div>
  );

  // --- Kanban ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.status !== columnStatus) {
        updateLeadStatus(leadId, columnStatus);
      }
    }
  };

  const KanbanCard = ({ lead }: { lead: QuizLead }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, lead.id)}
      onClick={() => router.push(`/admin/leads/${lead.id}`)}
      className="bg-card border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm truncate flex-1">{lead.full_name}</h4>
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{lead.email}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {lead.business_type && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{lead.business_type}</span>
        )}
        {lead.monthly_volume && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{lead.monthly_volume}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <PriorityDot priority={lead.priority} />
        {lead.follow_up_date && (
          <span className="text-xs text-muted-foreground">
            {format(new Date(lead.follow_up_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );

  const KanbanColumn = ({
    status,
    leads: columnLeads,
  }: {
    status: string;
    leads: QuizLead[];
  }) => (
    <div
      className={`flex flex-col min-w-[260px] w-[260px] rounded-xl transition-colors ${
        dragOverColumn === status
          ? "bg-primary/10 ring-2 ring-primary/30"
          : "bg-muted/30"
      }`}
      onDragOver={(e) => handleDragOver(e, status)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, status)}
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold capitalize text-sm">{status}</h3>
          <Badge variant="secondary" className="text-xs">
            {columnLeads.length}
          </Badge>
        </div>
      </div>
      <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
        {columnLeads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
        {columnLeads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No leads
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CRM - Quiz Leads
              </h1>
              <p className="text-muted-foreground mt-1">
                {leads.length} total leads - {filteredLeads.length} shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-0.5">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="gap-1.5"
                >
                  <TableIcon className="h-4 w-4" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="gap-1.5"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </Button>
              </div>
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Tab navigation: All Leads / Failed Captures */}
          <div className="flex gap-2 border-b">
            <Link
              href="/admin/leads"
              className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              All Leads
              <Badge variant="secondary" className="text-xs">
                {leads.length}
              </Badge>
            </Link>
            <Link
              href="/admin/leads/failed"
              className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Failed Captures
              {failedCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs">
                  {failedCount}
                </Badge>
              )}
            </Link>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`rounded-lg border p-2 text-center transition-all hover:shadow-sm ${
                  statusFilter === s ? "ring-2 ring-primary border-primary" : ""
                }`}
              >
                <div className="text-lg font-bold">{statusCounts[s] || 0}</div>
                <div className="text-xs text-muted-foreground capitalize">{s}</div>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search name, email, business type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="sorting_hat">Sorting-Hat</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={funnelFilter} onValueChange={setFunnelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Funnel state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="day0">day0</SelectItem>
                <SelectItem value="day3">day3</SelectItem>
                <SelectItem value="day7">day7</SelectItem>
                <SelectItem value="day14">day14</SelectItem>
                <SelectItem value="day17">day17</SelectItem>
                <SelectItem value="booked">booked</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
              title="From date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
              title="To date"
            />

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Status Change
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => bulkUpdateStatus(s)}
                        className="capitalize"
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            </div>
          ) : viewMode === "table" ? (
            /* ===== TABLE VIEW ===== */
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            sortedLeads.length > 0 &&
                            selectedIds.size === sortedLeads.length
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("full_name")}
                      >
                        <div className="flex items-center">
                          Name
                          <SortIcon field="full_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden sm:table-cell"
                        onClick={() => toggleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          <SortIcon field="email" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Source</TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden lg:table-cell"
                        onClick={() => toggleSort("business_type")}
                      >
                        <div className="flex items-center">
                          Business Type
                          <SortIcon field="business_type" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden lg:table-cell"
                        onClick={() => toggleSort("monthly_volume")}
                      >
                        <div className="flex items-center">
                          Volume
                          <SortIcon field="monthly_volume" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden md:table-cell"
                        onClick={() => toggleSort("priority")}
                      >
                        <div className="flex items-center">
                          Priority
                          <SortIcon field="priority" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden xl:table-cell"
                        onClick={() => toggleSort("last_contacted")}
                      >
                        <div className="flex items-center">
                          Last Contact
                          <SortIcon field="last_contacted" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden xl:table-cell"
                        onClick={() => toggleSort("follow_up_date")}
                      >
                        <div className="flex items-center">
                          Follow-up
                          <SortIcon field="follow_up_date" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hidden lg:table-cell"
                        onClick={() => toggleSort("deal_value")}
                      >
                        <div className="flex items-center">
                          Deal Value
                          <SortIcon field="deal_value" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeads.map((lead) => {
                      const contactStyle = getLastContactStyle(lead.last_contacted);
                      return (
                        <TableRow
                          key={lead.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            lead.origin_table === "newsletter_subscribers"
                              ? ""
                              : "cursor-pointer"
                          } ${selectedIds.has(lead.id) ? "bg-primary/5" : ""}`}
                          onClick={() => {
                            if (lead.origin_table !== "newsletter_subscribers") {
                              router.push(`/admin/leads/${lead.id}`);
                            }
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(lead.id)}
                              onCheckedChange={() => toggleSelect(lead.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {lead.full_name || (
                                <span className="text-muted-foreground italic">
                                  (newsletter)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {lead.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <SourceBadge lead={lead} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {lead.business_type || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {lead.monthly_volume || "-"}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <StatusBadge lead={lead} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <PriorityDot priority={lead.priority} />
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span className={`text-sm ${contactStyle.className}`}>
                              {contactStyle.text}
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {lead.follow_up_date
                              ? format(new Date(lead.follow_up_date), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {lead.deal_value != null
                              ? `$${lead.deal_value.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={lead.origin_table === "newsletter_subscribers"}
                                onClick={() =>
                                  router.push(`/admin/leads/${lead.id}`)
                                }
                                title={
                                  lead.origin_table === "newsletter_subscribers"
                                    ? "Newsletter — no detail view"
                                    : "View details"
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteId(lead.id)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {sortedLeads.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No leads found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* ===== KANBAN VIEW ===== */
            <div className="space-y-4">
              <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((status) => {
                  const columnLeads = filteredLeads.filter(
                    (l) => l.status === status
                  );
                  return (
                    <KanbanColumn
                      key={status}
                      status={status}
                      leads={columnLeads}
                    />
                  );
                })}
              </div>

              {/* Lost section - collapsible */}
              {statusCounts["lost"] > 0 && (
                <div className="border rounded-xl">
                  <button
                    onClick={() => setShowLost(!showLost)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Lost
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {statusCounts["lost"]}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        showLost ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showLost && (
                    <div
                      className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2"
                      onDragOver={(e) => handleDragOver(e, "lost")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "lost")}
                    >
                      {filteredLeads
                        .filter((l) => l.status === "lost")
                        .map((lead) => (
                          <KanbanCard key={lead.id} lead={lead} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
