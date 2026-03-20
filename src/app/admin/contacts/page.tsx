"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ContactSubmission { id: string; created_at: string; name: string; email: string; phone: string | null; }

export default function ContactsDashboard() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => { try { const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }); if (error) throw error; setContacts(data || []); } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } finally { setLoading(false); } };
  const handleDelete = async () => { if (!deleteId) return; try { const { error } = await supabase.from("contact_submissions").delete().eq("id", deleteId); if (error) throw error; toast({ title: "Deleted" }); loadContacts(); } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } finally { setDeleteId(null); } };
  const exportToCSV = () => {
    const csv = [["Date", "Name", "Email", "Phone"], ...filteredContacts.map(c => [new Date(c.created_at).toLocaleDateString(), c.name, c.email, c.phone || ""])].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`; a.click(); window.URL.revokeObjectURL(url);
  };
  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex justify-between items-center"><div><h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Contact Submissions</h1></div><Button onClick={exportToCSV} className="gap-2"><Download className="h-4 w-4" />Export CSV</Button></div>
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          {loading ? <div className="text-center py-12"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden"><Table><TableHeader><TableRow className="bg-muted/50"><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="hidden md:table-cell">Phone</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
              {filteredContacts.map((c) => (<TableRow key={c.id}><TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell><TableCell className="font-medium">{c.name}</TableCell><TableCell className="text-sm">{c.email}</TableCell><TableCell className="hidden md:table-cell text-sm">{c.phone || "-"}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}
              {filteredContacts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No contacts found.</TableCell></TableRow>}
            </TableBody></Table></div>
          )}
        </div>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this contact.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
