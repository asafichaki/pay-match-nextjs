"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("analytics_events").insert({
          event_type: "page_view",
          page_path: pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
          user_id: user?.id || null,
          metadata: {
            search: searchParams?.toString() || "",
          } as any,
        });
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
