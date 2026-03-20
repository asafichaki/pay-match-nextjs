"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Mail, Phone, Calendar, FileText, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  due_date: string | null;
  completed: boolean;
}

interface LeadActivitiesProps {
  leadId: string;
}

export function LeadActivities({ leadId }: LeadActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newActivity, setNewActivity] = useState({
    activity_type: "note",
    title: "",
    description: "",
    due_date: "",
  });

  useEffect(() => {
    loadActivities();
  }, [leadId]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities((data || []) as any);
    } catch (error: any) {
      toast({
        title: "Error loading activities",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("lead_activities").insert({
        lead_id: leadId,
        ...newActivity,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Activity added successfully",
      });

      setNewActivity({
        activity_type: "note",
        title: "",
        description: "",
        due_date: "",
      });
      setDialogOpen(false);
      loadActivities();
    } catch (error: any) {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (activityId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("lead_activities")
        .update({ completed: !completed })
        .eq("id", activityId);

      if (error) throw error;
      loadActivities();
    } catch (error: any) {
      toast({
        title: "Error updating activity",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      note: FileText,
      email: Mail,
      call: Phone,
      meeting: Calendar,
      task: CheckCircle2,
      status_change: Circle,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Track all interactions with this lead</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>Record a new interaction or task</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newActivity.activity_type}
                    onValueChange={(value) => setNewActivity({ ...newActivity, activity_type: value })}
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
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
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
                      onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
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
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activities yet. Add one to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 border-l-2 border-primary/20 pl-4 py-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 p-2 rounded-lg bg-primary/10">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                    {activity.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(activity.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {activity.activity_type === "task" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComplete(activity.id, activity.completed)}
                    >
                      {activity.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
