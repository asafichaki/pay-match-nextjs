"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatIL(ts: string | null): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("he-IL", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

/**
 * Export every lead_activity joined with its quiz_lead (email + source) as a CSV string.
 * Columns: lead_id, email, activity_type, timestamp (he-IL Asia/Jerusalem), notes, source
 *
 * Wire from any admin page (e.g. admin/leads) with a button that calls this action,
 * then triggers a client-side download of the returned CSV. Example:
 *
 *   const csv = await exportLeadActivities();
 *   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
 *   const url = URL.createObjectURL(blob);
 *   const a = document.createElement("a"); a.href = url;
 *   a.download = `lead-activities-${new Date().toISOString().split("T")[0]}.csv`;
 *   a.click(); URL.revokeObjectURL(url);
 */
export async function exportLeadActivities(): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lead_activities")
    .select(
      "lead_id, activity_type, created_at, title, description, quiz_leads!inner(email, source)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load lead activities: ${error.message}`);
  }

  const headers = ["lead_id", "email", "activity_type", "timestamp", "notes", "source"];
  const lines: string[] = [headers.join(",")];

  for (const row of (data || []) as any[]) {
    const lead = Array.isArray(row.quiz_leads) ? row.quiz_leads[0] : row.quiz_leads;
    const notes = [row.title, row.description].filter(Boolean).join(" — ");
    lines.push(
      [
        row.lead_id,
        lead?.email ?? "",
        row.activity_type ?? "",
        formatIL(row.created_at),
        notes,
        lead?.source ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return lines.join("\n");
}
