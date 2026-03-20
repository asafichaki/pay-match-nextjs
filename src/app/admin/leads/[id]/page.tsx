"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckSquare,
  FileText,
  Plus,
  X,
  CheckCircle2,
  Circle,
  User,
  Building2,
  Globe,
  CreditCard,
  TrendingUp,
  Tag,
  Clock,
  Sparkles,
} from "lucide-react";
import { LeadEmailDialog } from "@/components/admin/LeadEmailDialog";
import { format, formatDistanceToNow } from "date-fns";

interface Lead {
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
  priority: string;
  source: string;
  follow_up_date: string | null;
  last_contacted: string | null;
  notes: string | null;
  tags: string[];
  deal_value: number | null;
  conversion_date: string | null;
  average_transaction: string | null;
  integration_needs: string | null;
  international_payments: boolean | null;
  assigned_to: string | null;
}

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  due_date: string | null;
  completed: boolean;
}

const PIPELINE_STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "converted", label: "Converted" },
];

function calculateLeadScore(lead: Lead): number {
  let score = 0;
  const vol = lead.monthly_volume ? parseFloat(lead.monthly_volume.replace(/[^0-9.]/g, "")) : 0;
  if (vol > 50000) score += 30;
  else if (vol > 20000) score += 20;
  else if (vol > 5000) score += 10;

  if (lead.phone) score += 15;
  if (lead.email) score += 10;
  if (lead.priority === "urgent" || lead.priority === "high") score += 15;
  if (lead.follow_up_date) score += 10;
  if (lead.deal_value) score += 10;

  return Math.min(score, 100);
}

function getScoreColor(score: number) {
  if (score > 70) return { ring: "text-green-500", bg: "bg-green-500/10", text: "text-green-600" };
  if (score > 40) return { ring: "text-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-600" };
  return { ring: "text-red-500", bg: "bg-red-500/10", text: "text-red-600" };
}

function getActivityIcon(type: string) {
  switch (type) {
    case "email": return <Mail className="h-4 w-4" />;
    case "call": return <Phone className="h-4 w-4" />;
    case "meeting": return <Calendar className="h-4 w-4" />;
    case "task": return <CheckSquare className="h-4 w-4" />;
    case "note": return <MessageSquare className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "email": return "bg-blue-500/10 text-blue-600";
    case "call": return "bg-green-500/10 text-green-600";
    case "meeting": return "bg-purple-500/10 text-purple-600";
    case "task": return "bg-orange-500/10 text-orange-600";
    case "note": return "bg-gray-500/10 text-gray-600";
    default: return "bg-gray-500/10 text-gray-600";
  }
}

export default function LeadDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newActivity, setNewActivity] = useState({
    activity_type: "note",
    title: "",
    description: "",
    due_date: "",
  });

  useEffect(() => {
    if (id) {
      loadLead();
      loadActivities();
    }
  }, [id]);

  const loadLead = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_leads")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setLead(data as any);
    } catch (error: any) {
      toast({ title: "Error loading lead", description: error.message, variant: "destructive" });
      router.push("/admin/leads");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setActivities((data || []) as any);
    } catch (error: any) {
      toast({ title: "Error loading activities", description: error.message, variant: "destructive" });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const updateLead = useCallback(
    async (updates: Partial<Lead>) => {
      if (!lead) return;
      const updatedLead = { ...lead, ...updates };
      setLead(updatedLead);
      setSaving(true);
      try {
        const { error } = await supabase
          .from("quiz_leads")
          .update(updates as any)
          .eq("id", lead.id);
        if (error) throw error;
        toast({ title: "Lead updated" });
      } catch (error: any) {
        toast({ title: "Error updating lead", description: error.message, variant: "destructive" });
      } finally {
        setSaving(false);
      }
    },
    [lead, toast]
  );

  const handleStageClick = async (stageKey: string) => {
    await updateLead({ status: stageKey });
  };

  const handleNotesBlur = async () => {
    if (!lead) return;
    await updateLead({ notes: lead.notes });
  };

  const handleAddTag = async () => {
    if (!lead || !newTag.trim()) return;
    if (lead.tags?.includes(newTag.trim())) {
      setNewTag("");
      return;
    }
    const updatedTags = [...(lead.tags || []), newTag.trim()];
    setNewTag("");
    await updateLead({ tags: updatedTags } as any);
  };

  const handleRemoveTag = async (tag: string) => {
    if (!lead) return;
    const updatedTags = (lead.tags || []).filter((t) => t !== tag);
    await updateLead({ tags: updatedTags } as any);
  };

  const handleAddActivity = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("lead_activities").insert({
        lead_id: id,
        ...newActivity,
        created_by: user?.id,
      });
      if (error) throw error;
      toast({ title: "Activity added" });
      setNewActivity({ activity_type: "note", title: "", description: "", due_date: "" });
      setActivityDialogOpen(false);
      loadActivities();
    } catch (error: any) {
      toast({ title: "Error adding activity", description: error.message, variant: "destructive" });
    }
  };

  const toggleActivityComplete = async (activityId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("lead_activities")
        .update({ completed: !completed })
        .eq("id", activityId);
      if (error) throw error;
      loadActivities();
    } catch (error: any) {
      toast({ title: "Error updating activity", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkContacted = async () => {
    const now = new Date().toISOString();
    await updateLead({ status: "contacted", last_contacted: now });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("lead_activities").insert({
      lead_id: id,
      activity_type: "note",
      title: "Marked as Contacted",
      created_by: user?.id,
    });
    loadActivities();
  };

  const handleScheduleFollowUp = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await updateLead({ follow_up_date: dateStr });
  };

  const handleAddNoteQuick = () => {
    setNewActivity({ activity_type: "note", title: "", description: "", due_date: "" });
    setActivityDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }
  if (!lead) return null;

  const score = calculateLeadScore(lead);
  const scoreColors = getScoreColor(score);
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === lead.status);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/leads")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{lead.full_name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Lead #{lead.id.slice(0, 8)} - {lead.source}
                  </p>
                </div>
                <Badge
                  variant={lead.priority === "urgent" ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {lead.priority}
                </Badge>
              </div>
              {saving && (
                <span className="text-sm text-muted-foreground animate-pulse">Saving...</span>
              )}
            </div>

            {/* Stage Progress Bar */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-2">
              {PIPELINE_STAGES.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isFuture = index > currentStageIndex;
                return (
                  <button
                    key={stage.key}
                    onClick={() => handleStageClick(stage.key)}
                    className={`
                      flex-1 relative py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer
                      ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                      ${isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      ${isFuture ? "bg-muted text-muted-foreground hover:bg-muted/80" : ""}
                      ${isCompleted ? "hover:bg-primary/90" : ""}
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{stage.label}</span>
                      <span className="sm:hidden text-xs">{stage.label.slice(0, 3)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleMarkContacted}>
                <Phone className="h-4 w-4 mr-2" />
                Mark Contacted
              </Button>
              <Button variant="outline" size="sm" onClick={handleScheduleFollowUp}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddNoteQuick}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lead Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Business Type
                      </p>
                      <p className="text-sm font-medium">{lead.business_type || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Monthly Volume
                      </p>
                      <p className="text-sm font-medium">{lead.monthly_volume || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Industry
                      </p>
                      <p className="text-sm font-medium">{lead.industry || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Average Transaction
                      </p>
                      <p className="text-sm font-medium">
                        {lead.average_transaction || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Integration Needs
                      </p>
                      <p className="text-sm font-medium">
                        {lead.integration_needs || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        International Payments
                      </p>
                      <p className="text-sm font-medium">
                        {lead.international_payments === null
                          ? "Not specified"
                          : lead.international_payments
                            ? "Yes"
                            : "No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Source
                      </p>
                      <Badge variant="secondary">{lead.source}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </p>
                      <p className="text-sm font-medium">
                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </p>
                      <p className="text-sm font-medium">{lead.full_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </p>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phone
                      </p>
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Contacted
                      </p>
                      <p className="text-sm font-medium">
                        {lead.last_contacted
                          ? formatDistanceToNow(new Date(lead.last_contacted), { addSuffix: true })
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                  <CardDescription>Auto-saves when you click away</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={lead.notes || ""}
                    onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                    onBlur={handleNotesBlur}
                    placeholder="Add notes about this lead..."
                    rows={5}
                    className="resize-y"
                  />
                </CardContent>
              </Card>

              {/* Tags Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(lead.tags || []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No tags yet</p>
                    )}
                    {(lead.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Lead Score Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Lead Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                  <div
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center ${scoreColors.bg}`}
                  >
                    <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="8"
                        className="stroke-muted"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="8"
                        strokeDasharray={`${(score / 100) * 264} 264`}
                        strokeLinecap="round"
                        className={`${scoreColors.ring.replace("text-", "stroke-")}`}
                      />
                    </svg>
                    <span className={`text-2xl font-bold ${scoreColors.text}`}>{score}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center space-y-1">
                    {score > 70 && <p className="text-green-600 font-medium">Hot Lead</p>}
                    {score > 40 && score <= 70 && (
                      <p className="text-yellow-600 font-medium">Warm Lead</p>
                    )}
                    {score <= 40 && <p className="text-red-600 font-medium">Cold Lead</p>}
                  </div>
                  <div className="w-full text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Volume ({lead.monthly_volume || "N/A"})</span>
                      <span>
                        +
                        {(() => {
                          const vol = lead.monthly_volume
                            ? parseFloat(lead.monthly_volume.replace(/[^0-9.]/g, ""))
                            : 0;
                          if (vol > 50000) return 30;
                          if (vol > 20000) return 20;
                          if (vol > 5000) return 10;
                          return 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has phone</span>
                      <span>+{lead.phone ? 15 : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has email</span>
                      <span>+{lead.email ? 10 : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority</span>
                      <span>
                        +{lead.priority === "urgent" || lead.priority === "high" ? 15 : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up set</span>
                      <span>+{lead.follow_up_date ? 10 : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deal value set</span>
                      <span>+{lead.deal_value ? 10 : 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deal Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Deal Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Deal Value</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={lead.deal_value || ""}
                        onChange={(e) =>
                          setLead({ ...lead, deal_value: parseFloat(e.target.value) || null })
                        }
                        onBlur={() => updateLead({ deal_value: lead.deal_value })}
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={lead.priority}
                      onValueChange={(value) => updateLead({ priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={
                        lead.follow_up_date
                          ? new Date(lead.follow_up_date).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => updateLead({ follow_up_date: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Input
                      value={lead.assigned_to || ""}
                      onChange={(e) => setLead({ ...lead, assigned_to: e.target.value })}
                      onBlur={() => updateLead({ assigned_to: lead.assigned_to })}
                      placeholder="Unassigned"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Activity
                      </CardTitle>
                      <CardDescription>
                        {activities.length} activit{activities.length === 1 ? "y" : "ies"}
                      </CardDescription>
                    </div>
                    <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Activity</DialogTitle>
                          <DialogDescription>Record a new interaction or task</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={newActivity.activity_type}
                              onValueChange={(value) =>
                                setNewActivity({ ...newActivity, activity_type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="call">Phone Call</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={newActivity.title}
                              onChange={(e) =>
                                setNewActivity({ ...newActivity, title: e.target.value })
                              }
                              placeholder="Brief description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={newActivity.description}
                              onChange={(e) =>
                                setNewActivity({ ...newActivity, description: e.target.value })
                              }
                              placeholder="Detailed notes..."
                              rows={4}
                            />
                          </div>
                          {newActivity.activity_type === "task" && (
                            <div className="space-y-2">
                              <Label>Due Date</Label>
                              <Input
                                type="date"
                                value={newActivity.due_date}
                                onChange={(e) =>
                                  setNewActivity({ ...newActivity, due_date: e.target.value })
                                }
                              />
                            </div>
                          )}
                          <Button onClick={handleAddActivity} className="w-full">
                            Add Activity
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="text-center py-6">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    </div>
                  ) : activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No activities yet
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-3 border-l-2 border-primary/20 pl-3 py-2"
                        >
                          <div
                            className={`mt-0.5 p-1.5 rounded-md shrink-0 ${getActivityColor(
                              activity.activity_type
                            )}`}
                          >
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate">
                                {activity.title}
                              </span>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {activity.activity_type}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                            {activity.due_date && (
                              <p className="text-[10px] text-muted-foreground">
                                Due: {format(new Date(activity.due_date), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          {activity.activity_type === "task" && (
                            <button
                              onClick={() =>
                                toggleActivityComplete(activity.id, activity.completed)
                              }
                              className="shrink-0 mt-0.5"
                            >
                              {activity.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <LeadEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} lead={lead} />
    </>
  );
}
