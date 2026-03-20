"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadActivities } from "@/components/admin/LeadActivities";
import { LeadEmailDialog } from "@/components/admin/LeadEmailDialog";

interface Lead { id: string; created_at: string; full_name: string; email: string; phone: string | null; monthly_volume: string | null; business_type: string | null; industry: string | null; recommended_provider: string | null; status: string; priority: string; source: string; follow_up_date: string | null; last_contacted: string | null; notes: string | null; tags: string[]; deal_value: number | null; conversion_date: string | null; }

export default function LeadDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  useEffect(() => { if (id) loadLead(); }, [id]);

  const loadLead = async () => {
    try {
      const { data, error } = await supabase.from("quiz_leads").select("*").eq("id", id).single();
      if (error) throw error;
      setLead(data as any);
    } catch (error: any) { toast({ title: "Error loading lead", description: error.message, variant: "destructive" }); router.push("/admin/leads"); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("quiz_leads").update({ status: lead.status, priority: lead.priority, notes: lead.notes, follow_up_date: lead.follow_up_date, deal_value: lead.deal_value, tags: lead.tags }).eq("id", lead.id);
      if (error) throw error;
      toast({ title: "Lead updated successfully" });
    } catch (error: any) { toast({ title: "Error updating lead", description: error.message, variant: "destructive" }); } finally { setSaving(false); }
  };

  const getPriorityColor = (priority: string) => ({ low: "bg-blue-500", medium: "bg-yellow-500", high: "bg-orange-500", urgent: "bg-red-500" }[priority] || "bg-gray-500");

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div>;
  if (!lead) return null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin/leads")}><ArrowLeft className="h-4 w-4" /></Button>
              <div><h1 className="text-3xl font-bold">{lead.full_name}</h1><p className="text-muted-foreground">Lead #{lead.id.slice(0, 8)}</p></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(true)}><Mail className="h-4 w-4 mr-2" />Send Email</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Email</Label><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{lead.email}</span></div></div>
                    <div className="space-y-2"><Label>Phone</Label><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{lead.phone || "Not provided"}</span></div></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Business Type</Label><Input value={lead.business_type || ""} readOnly /></div>
                    <div className="space-y-2"><Label>Monthly Volume</Label><Input value={lead.monthly_volume || ""} readOnly /></div>
                  </div>
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><Textarea value={lead.notes || ""} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Add notes about this lead..." rows={6} /></CardContent></Card>
              <Tabs defaultValue="activities">
                <TabsList><TabsTrigger value="activities">Activities</TabsTrigger><TabsTrigger value="emails">Emails</TabsTrigger></TabsList>
                <TabsContent value="activities"><LeadActivities leadId={lead.id} /></TabsContent>
                <TabsContent value="emails"><Card><CardHeader><CardTitle>Email History</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No emails sent yet</p></CardContent></Card></TabsContent>
              </Tabs>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Lead Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Status</Label><Select value={lead.status} onValueChange={(value) => setLead({ ...lead, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Priority</Label><Select value={lead.priority} onValueChange={(value) => setLead({ ...lead, priority: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Deal Value</Label><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><Input type="number" value={lead.deal_value || ""} onChange={(e) => setLead({ ...lead, deal_value: parseFloat(e.target.value) || null })} placeholder="0.00" /></div></div>
                  <div className="space-y-2"><Label>Follow-up Date</Label><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><Input type="date" value={lead.follow_up_date ? new Date(lead.follow_up_date).toISOString().split('T')[0] : ""} onChange={(e) => setLead({ ...lead, follow_up_date: e.target.value })} /></div></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Source</span><Badge variant="secondary">{lead.source}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(lead.created_at).toLocaleDateString()}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <LeadEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} lead={lead} />
    </>
  );
}
