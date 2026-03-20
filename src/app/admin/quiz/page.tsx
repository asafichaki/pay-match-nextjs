"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClipboardList, Plus, Pencil, Trash2, MoveUp, MoveDown } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface QuizQuestion { id: string; question_id: string; question_text: string; display_order: number; options: Array<{ value: string; label: string; icon: string }>; }

export default function QuizDashboard() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasAccess, loading: permissionLoading } = usePermissions("articles");
  const router = useRouter();

  useEffect(() => { if (!permissionLoading && !hasAccess) { toast.error("No permission"); router.push("/admin/dashboard"); } }, [hasAccess, permissionLoading, router]);
  useEffect(() => { if (hasAccess) loadQuestions(); }, [hasAccess]);

  const loadQuestions = async () => { try { const { data, error } = await supabase.from("quiz_questions").select("*").order("display_order", { ascending: true }); if (error) throw error; setQuestions((data as any[])?.map(q => ({ ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options })) || []); } catch { toast.error("Failed to load"); } finally { setLoading(false); } };

  const handleSave = async (questionData: Partial<QuizQuestion>) => {
    try {
      if (editingQuestion) { await supabase.from("quiz_questions").update({ question_text: questionData.question_text, options: questionData.options }).eq("id", editingQuestion.id); toast.success("Updated"); }
      else { await supabase.from("quiz_questions").insert({ question_id: questionData.question_id, question_text: questionData.question_text, display_order: questions.length + 1, options: questionData.options } as any); toast.success("Created"); }
      setDialogOpen(false); setEditingQuestion(null); loadQuestions();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDelete = async (id: string) => { if (!confirm("Delete this question?")) return; try { await supabase.from("quiz_questions").delete().eq("id", id); toast.success("Deleted"); loadQuestions(); } catch { toast.error("Failed"); } };

  const handleReorder = async (id: string, dir: "up" | "down") => {
    const idx = questions.findIndex(q => q.id === id); if (idx === -1 || (dir === "up" && idx === 0) || (dir === "down" && idx === questions.length - 1)) return;
    const newIdx = dir === "up" ? idx - 1 : idx + 1; const newOrder = [...questions]; [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    try { for (const [i, q] of newOrder.entries()) { await supabase.from("quiz_questions").update({ display_order: i + 1 }).eq("id", q.id); } toast.success("Reordered"); loadQuestions(); } catch { toast.error("Failed"); }
  };

  if (permissionLoading || !hasAccess) return <div className="flex items-center justify-center min-h-screen"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-3 rounded-lg bg-primary/10"><ClipboardList className="h-6 w-6 text-primary" /></div><div><h1 className="text-3xl font-bold">Quiz Management</h1></div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button className="gap-2" onClick={() => setEditingQuestion(null)}><Plus className="h-4 w-4" />Add Question</Button></DialogTrigger>
          <QuestionDialog question={editingQuestion} onSave={handleSave} onClose={() => { setDialogOpen(false); setEditingQuestion(null); }} />
        </Dialog>
      </div>
      <Card><CardHeader><CardTitle>Quiz Questions</CardTitle><CardDescription>Manage quiz questions</CardDescription></CardHeader><CardContent>
        {loading ? <div className="flex justify-center p-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
          <Table><TableHeader><TableRow><TableHead className="w-16">Order</TableHead><TableHead>Question</TableHead><TableHead>Options</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {questions.map((q, i) => (
              <TableRow key={q.id}>
                <TableCell><div className="flex items-center gap-1"><Badge variant="outline">{q.display_order}</Badge><div className="flex flex-col"><Button size="sm" variant="ghost" onClick={() => handleReorder(q.id, "up")} disabled={i === 0} className="h-5 w-5 p-0"><MoveUp className="h-3 w-3" /></Button><Button size="sm" variant="ghost" onClick={() => handleReorder(q.id, "down")} disabled={i === questions.length - 1} className="h-5 w-5 p-0"><MoveDown className="h-3 w-3" /></Button></div></div></TableCell>
                <TableCell className="font-medium">{q.question_text}</TableCell>
                <TableCell><Badge variant="secondary">{q.options.length} options</Badge></TableCell>
                <TableCell className="text-right"><div className="flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => { setEditingQuestion(q); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(q.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}

function QuestionDialog({ question, onSave, onClose }: { question: QuizQuestion | null; onSave: (data: Partial<QuizQuestion>) => void; onClose: () => void; }) {
  const [formData, setFormData] = useState({ question_id: question?.question_id || "", question_text: question?.question_text || "", options: question?.options || [{ value: "", label: "", icon: "" }] });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{question ? "Edit Question" : "Add New Question"}</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!question && <div className="space-y-2"><Label>Question ID</Label><Input value={formData.question_id} onChange={(e) => setFormData({ ...formData, question_id: e.target.value })} required /></div>}
        <div className="space-y-2"><Label>Question Text</Label><Textarea value={formData.question_text} onChange={(e) => setFormData({ ...formData, question_text: e.target.value })} required rows={2} /></div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><Label>Options</Label><Button type="button" size="sm" variant="outline" onClick={() => setFormData({ ...formData, options: [...formData.options, { value: "", label: "", icon: "" }] })}><Plus className="h-4 w-4 mr-1" />Add</Button></div>
          {formData.options.map((opt, i) => (
            <Card key={i} className="p-4"><div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Value</Label><Input value={opt.value} onChange={(e) => { const n = [...formData.options]; n[i] = { ...n[i], value: e.target.value }; setFormData({ ...formData, options: n }); }} required /></div>
              <div className="space-y-1"><Label className="text-xs">Label</Label><Input value={opt.label} onChange={(e) => { const n = [...formData.options]; n[i] = { ...n[i], label: e.target.value }; setFormData({ ...formData, options: n }); }} required /></div>
              <div className="space-y-1"><Label className="text-xs">Icon</Label><Input value={opt.icon} onChange={(e) => { const n = [...formData.options]; n[i] = { ...n[i], icon: e.target.value }; setFormData({ ...formData, options: n }); }} required /></div>
            </div></Card>
          ))}
        </div>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">{question ? "Update" : "Create"}</Button></div>
      </form>
    </DialogContent>
  );
}
