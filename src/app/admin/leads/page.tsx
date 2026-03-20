"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Trash2, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface QuizLead { id: string; created_at: string; full_name: string; email: string; phone: string | null; monthly_volume: string | null; business_type: string | null; industry: string | null; recommended_provider: string | null; status: string; priority: string; deal_value: number | null; follow_up_date: string | null; tags: string[]; }

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase.from("quiz_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setLeads((data || []) as any);
    } catch (error: any) { toast({ title: "Error loading leads", description: error.message, variant: "destructive" }); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { const { error } = await supabase.from("quiz_leads").delete().eq("id", deleteId); if (error) throw error; toast({ title: "Lead deleted successfully" }); loadLeads(); } catch (error: any) { toast({ title: "Error deleting lead", description: error.message, variant: "destructive" }); } finally { setDeleteId(null); }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Monthly Volume", "Business Type", "Industry", "Recommended Provider", "Status"];
    const csvData = filteredLeads.map(lead => [new Date(lead.created_at).toLocaleDateString(), lead.full_name, lead.email, lead.phone || "", lead.monthly_volume || "", lead.business_type || "", lead.industry || "", lead.recommended_provider || "", lead.status]);
    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `quiz-leads-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Export successful", description: `Exported ${filteredLeads.length} leads to CSV` });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.full_name.toLowerCase().includes(search.toLowerCase()) || lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => ({ low: "bg-blue-500", medium: "bg-yellow-500", high: "bg-orange-500", urgent: "bg-red-500" }[priority] || "bg-gray-500");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">CRM - Quiz Leads</h1>
              <p className="text-muted-foreground mt-2">{leads.length} total leads</p>
            </div>
            <Button onClick={exportToCSV} className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All Priorities</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
          </div>

          {loading ? <div className="text-center py-12"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead className="hidden sm:table-cell">Email</TableHead><TableHead className="hidden md:table-cell">Priority</TableHead><TableHead className="hidden lg:table-cell">Business</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/admin/leads/${lead.id}`)}>
                      <TableCell className="text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><div className="font-medium">{lead.full_name}</div></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{lead.email}</TableCell>
                      <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${getPriorityColor(lead.priority)}`} /><span className="text-sm capitalize">{lead.priority}</span></div></TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{lead.business_type || "-"}</TableCell>
                      <TableCell><Badge variant={lead.status === "converted" ? "default" : "secondary"}>{lead.status}</Badge></TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/leads/${lead.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(lead.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No leads found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this lead.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
