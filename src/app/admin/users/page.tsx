"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface UserWithProfile { user_id: string; email: string; role: string; created_at: string; }

export default function UsersDashboard() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "user" as "admin" | "moderator" | "user" });
  const { hasAccess, loading: permissionLoading } = usePermissions("users");
  const router = useRouter();

  useEffect(() => { if (!permissionLoading && !hasAccess) { toast.error("No permission"); router.push("/admin/dashboard"); } }, [hasAccess, permissionLoading, router]);
  useEffect(() => { if (hasAccess) loadUsers(); }, [hasAccess]);

  const loadUsers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase.from("user_roles").select("user_id, role, created_at"); if (rolesError) throw rolesError;
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("user_id, email"); if (profilesError) throw profilesError;
      setUsers((rolesData || []).map((role: any) => { const profile = (profilesData || []).find((p: any) => p.user_id === role.user_id); return { user_id: role.user_id, email: profile?.email || "No email", role: role.role, created_at: role.created_at }; }));
    } catch { toast.error("Failed to load users"); } finally { setLoading(false); }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) { toast.error("Fill all fields"); return; }
    setCreating(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: newUser.email, password: newUser.password, options: { emailRedirectTo: `${window.location.origin}/` } }); if (authError) throw authError; if (!authData.user) throw new Error("Failed");
      await supabase.from("profiles").insert({ user_id: authData.user.id, email: newUser.email });
      await supabase.from("user_roles").insert({ user_id: authData.user.id, role: newUser.role });
      toast.success("User created"); setDialogOpen(false); setNewUser({ email: "", password: "", role: "user" }); loadUsers();
    } catch (error: any) { toast.error(error.message); } finally { setCreating(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => { try { await supabase.from("user_roles").update({ role: newRole } as any).eq("user_id", userId); toast.success("Role updated"); loadUsers(); } catch { toast.error("Failed"); } };
  const handleDeleteUser = async (userId: string, email: string) => { if (!confirm(`Delete user ${email}?`)) return; try { await supabase.from("profiles").delete().eq("user_id", userId); await supabase.from("user_roles").delete().eq("user_id", userId); toast.success("Deleted"); loadUsers(); } catch { toast.error("Failed"); } };
  const getRoleBadgeVariant = (role: string) => role === "admin" ? "destructive" as const : role === "moderator" ? "default" as const : "secondary" as const;

  if (permissionLoading || !hasAccess) return <div className="flex items-center justify-center min-h-screen"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-3 rounded-lg bg-primary/10"><Users className="h-6 w-6 text-primary" /></div><div><h1 className="text-3xl font-bold">Users & Roles Management</h1></div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button className="gap-2"><UserPlus className="h-4 w-4" />Add User</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Add a new user</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Role</Label><Select value={newUser.role} onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
            <Button onClick={handleCreateUser} disabled={creating} className="w-full">{creating ? "Creating..." : "Create User"}</Button>
          </div>
        </DialogContent></Dialog>
      </div>
      <Card><CardHeader><CardTitle>System Users</CardTitle></CardHeader><CardContent>
        {loading ? <div className="flex justify-center p-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
          <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Change Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {users.map((user) => (<TableRow key={user.user_id}><TableCell className="font-medium">{user.email}</TableCell><TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge></TableCell><TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell><TableCell><Select value={user.role} onValueChange={(v) => handleRoleChange(user.user_id, v)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.user_id, user.email)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}
          </TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
}
