"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { getAnalyticsSessionId } from "@/lib/analytics/funnel";
import { track } from "@/lib/analytics/track";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // One delegated listener for every provider button on the site. Only a
  // browser that ran this JavaScript can send it, which is what makes it the
  // human click count (the /go/ table also sees crawlers and scripts).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Primary click, or middle click (opens a new tab). Not a right-click.
      if (e.type === "auxclick" && e.button !== 1) return;
      const el = (e.target as Element | null)?.closest?.("a[data-partner], a[data-partner-direct]");
      if (!el) return;
      const partner = el.getAttribute("data-partner") || el.getAttribute("data-partner-direct") || "";
      const placement = el.closest("[data-top-picks]")
        ? "top-picks"
        : el.closest("#ranking")
          ? "ranking"
          : el.closest("aside")
            ? "sidebar"
            : el.closest(".fixed")
              ? "sticky-bar"
              : "body";
      track("affiliate_click", {
        partner,
        placement,
        tracked: el.hasAttribute("data-partner"),
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);

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
          session_id: getAnalyticsSessionId(),
          user_id: user?.id || null,
          metadata: {
            search: searchParams?.toString() || "",
          },
        });
      } catch (error) {
        console.error("Analytics tracking error:", error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
