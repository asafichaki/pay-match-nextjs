"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface Permission { id: string; role: string; page_name: string; can_access: boolean; }

const PAGE_LABELS: Record<string, string> = { dashboard: "Dashboard", providers: "Payment Providers", leads: "Quiz Leads", articles: "Blog Articles", contacts: "Contact Submissions", users: "Users & Roles" };
const PAGE_DESCRIPTIONS: Record<string, string> = { dashboard: "Main analytics and overview", providers: "Manage payment provider listings", leads: "View and manage quiz submissions", articles: "Create and edit blog content", contacts: "Handle contact form submissions", users: "Manage user accounts and permissions" };

export default function PermissionsDashboard() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasAccess, loading: permissionLoading } = usePermissions("users");
  const router = useRouter();

  useEffect(() => { if (!permissionLoading && !hasAccess) { toast.error("No permission"); router.push("/admin/dashboard"); } }, [hasAccess, permissionLoading, router]);
  useEffect(() => { if (hasAccess) loadPermissions(); }, [hasAccess]);

  const loadPermissions = async () => { try { const { data, error } = await supabase.from("role_permissions").select("*").order("role").order("page_name"); if (error) throw error; setPermissions((data || []) as any); } catch { toast.error("Failed to load permissions"); } finally { setLoading(false); } };
  const handleToggle = async (id: string, current: boolean) => { try { await supabase.from("role_permissions").update({ can_access: !current }).eq("id", id); toast.success("Updated"); loadPermissions(); } catch { toast.error("Failed"); } };
  const getRoleBadgeVariant = (role: string) => role === "admin" ? "destructive" as const : role === "moderator" ? "default" as const : "secondary" as const;

  if (permissionLoading || !hasAccess) return <div className="flex items-center justify-center min-h-screen"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div>;

  const grouped = permissions.reduce((acc, perm) => { if (!acc[perm.role]) acc[perm.role] = []; acc[perm.role].push(perm); return acc; }, {} as Record<string, Permission[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3"><div className="p-3 rounded-lg bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div><div><h1 className="text-3xl font-bold">Permissions Management</h1><p className="text-muted-foreground">Control page access for each role</p></div></div>
      {loading ? <div className="flex justify-center p-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /></div> : (
        <div className="grid gap-6">
          {Object.entries(grouped).map(([role, perms]) => (
            <Card key={role} className="overflow-hidden">
              <CardHeader className="bg-muted/30"><div className="flex items-center gap-3"><Badge variant={getRoleBadgeVariant(role)} className="text-base px-4 py-1">{role.charAt(0).toUpperCase() + role.slice(1)}</Badge></div></CardHeader>
              <CardContent className="p-0"><div className="divide-y">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between p-4 hover:bg-muted/20">
                    <div><div className="font-medium">{PAGE_LABELS[perm.page_name] || perm.page_name}</div><div className="text-sm text-muted-foreground">{PAGE_DESCRIPTIONS[perm.page_name]}</div></div>
                    <div className="flex items-center gap-3"><span className={`text-sm font-medium ${perm.can_access ? 'text-green-600' : 'text-muted-foreground'}`}>{perm.can_access ? 'Enabled' : 'Disabled'}</span><Switch checked={perm.can_access} onCheckedChange={() => handleToggle(perm.id, perm.can_access)} disabled={role === "admin"} /></div>
                  </div>
                ))}
              </div></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
