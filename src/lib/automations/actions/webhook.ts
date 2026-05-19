import type {
  AutomationActionResult,
  AutomationEventPayload,
  AutomationRow,
} from "../types";

export async function postWebhook(
  automation: AutomationRow,
  payload: AutomationEventPayload
): Promise<AutomationActionResult> {
  const cfg = automation.action_config || {};
  const url = typeof cfg.url === "string" ? cfg.url.trim() : "";
  if (!url || !/^https?:\/\//.test(url)) {
    return { ok: false, error: `webhook url invalid: ${url}` };
  }

  let extraHeaders: Record<string, string> = {};
  if (typeof cfg.headers_json === "string" && cfg.headers_json.trim()) {
    try {
      const parsed = JSON.parse(cfg.headers_json);
      if (parsed && typeof parsed === "object") {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "string") extraHeaders[k] = v;
        }
      }
    } catch (e) {
      return { ok: false, error: `headers_json is not valid JSON: ${(e as Error).message}` };
    }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "mypayadvisor-automations/1.0",
        ...extraHeaders,
      },
      body: JSON.stringify({
        automation_id: automation.id,
        automation_name: automation.name,
        event: payload,
        ts: new Date().toISOString(),
      }),
      // 10s budget
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      return { ok: false, error: `webhook ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true, result: { status: res.status, body_preview: text.slice(0, 200) } };
  } catch (e) {
    return { ok: false, error: `webhook fetch failed: ${(e as Error).message}` };
  }
}
