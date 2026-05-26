"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { PasswordStrengthMeter, scorePassword } from "./password-strength";
import { createUserAdmin, deleteUserCompletely, changeUserRole } from "./actions";

interface UserWithProfile {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "user" as "admin" | "moderator" | "user",
  });
  const { hasAccess, loading: permissionLoading } = usePermissions("users");
  const router = useRouter();

  useEffect(() => {
    if (!permissionLoading && !hasAccess) {
      toast.error("No permission");
      router.push("/admin/dashboard");
    }
  }, [hasAccess, permissionLoading, router]);

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
      supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    }
  }, [hasAccess]);

  const loadUsers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");
      if (rolesError) throw rolesError;
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email");
      if (profilesError) throw profilesError;
      setUsers(
        (rolesData || []).map((role: any) => {
          const profile = (profilesData || []).find((p: any) => p.user_id === role.user_id);
          return {
            user_id: role.user_id,
            email: profile?.email || "No email",
            role: role.role,
            created_at: role.created_at,
          };
        })
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const passwordScore = scorePassword(newUser.password);
  const canSubmit =
    Boolean(newUser.email) && newUser.password.length > 0 && passwordScore.passes;

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error("Fill all fields");
      return;
    }
    if (!passwordScore.passes) {
      toast.error("Password too weak, see requirements below the field");
      return;
    }
    setCreating(true);
    try {
      const res = await createUserAdmin(newUser);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("User created");
      setDialogOpen(false);
      setNewUser({ email: "", password: "", role: "user" });
      loadUsers();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await changeUserRole({
      userId,
      newRole: newRole as "admin" | "moderator" | "user",
    });
    if (!res.ok) {
      toast.error(res.error);
      // Refresh UI to bounce the Select back to the persisted value.
      loadUsers();
      return;
    }
    toast.success("Role updated");
    loadUsers();
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      toast.error("Cannot delete your own account from this UI");
      return;
    }
    if (!confirm(`Delete user ${email}? This removes them from auth.users and is irreversible.`))
      return;
    const res = await deleteUserCompletely(userId);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("User fully deleted");
    loadUsers();
  };

  const getRoleBadgeVariant = (role: string) =>
    role === "admin"
      ? ("destructive" as const)
      : role === "moderator"
        ? ("default" as const)
        : ("secondary" as const);

  if (permissionLoading || !hasAccess)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Users & Roles Management</h1>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email *</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Password *</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  data-testid="new-user-password"
                />
                <PasswordStrengthMeter password={newUser.password} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v: any) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={creating || !canSubmit}
                className="w-full"
                data-testid="create-user-submit"
              >
                {creating ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Change Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user.user_id === currentUserId;
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.email}
                        {isSelf && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.user_id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.user_id, user.email)}
                          className="text-destructive hover:text-destructive"
                          disabled={isSelf}
                          title={isSelf ? "Cannot delete your own account" : undefined}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
