import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePermissions = (pageName: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (!roleData) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check permission
        const { data: permissionData } = await supabase
          .from("role_permissions")
          .select("can_access")
          .eq("role", roleData.role)
          .eq("page_name", pageName)
          .single();

        setHasAccess(permissionData?.can_access || false);
        setLoading(false);
      } catch (error) {
        console.error("Error checking permissions:", error);
        setHasAccess(false);
        setLoading(false);
      }
    };

    checkPermission();
  }, [pageName]);

  return { hasAccess, loading };
};
