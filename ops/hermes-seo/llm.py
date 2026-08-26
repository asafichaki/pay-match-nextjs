"""LLM calls: Gemini Flash (propose), Gemini Pro (judge), Anthropic and
OpenAI (probes only, optional).

Every call estimates its cost from returned token counts and reports it to
the ledger through `spend_cb`, so the $30 hard stop sees LLM spend the same
run it happens. google-genai is imported lazily so the module loads on a
machine without it (tests, dry-runs without keys). Anthropic and OpenAI are
called with `requests` only: no SDKs on Hermes.

Prices are list prices per 1M tokens as of 2025 and are estimates.
"""
from __future__ import annotations

import json
import random
import re
import sys
import time
from typing import Any, Callable, Dict, List, Optional

import requests

import config

FLASH = "gemini-2.5-flash"
PRO = "gemini-2.5-pro"
PRICES = {  # usd per 1M tokens: (input, output)
    FLASH: (0.30, 2.50),
    PRO: (1.25, 10.00),
    "claude-sonnet-4-5": (3.00, 15.00),
    "gpt-4.1-mini": (0.40, 1.60),
}
SpendCb = Optional[Callable[[float, str], None]]


def _cost(model: str, tokens_in: int, tokens_out: int) -> float:
    pin, pout = PRICES.get(model, (1.0, 5.0))
    return (tokens_in * pin + tokens_out * pout) / 1_000_000


def _extract_json(text: str) -> Any:
    """Parse JSON out of a model reply, tolerating code fences."""
    t = (text or "").strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.S)
    try:
        return json.loads(t)
    except ValueError:
        m = re.search(r"(\{.*\}|\[.*\])", t, re.S)
        if m:
            return json.loads(m.group(1))
        raise


class Gemini:
    """google-genai client with JSON mode, a judge helper and grounding."""

    def __init__(self, api_key: Optional[str] = None, spend_cb: SpendCb = None):
        self.api_key = api_key or config.env("GEMINI_API_KEY") or config.env("GOOGLE_API_KEY")
        self.spend_cb = spend_cb
        self._client = None
        self.calls = 0

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    def client(self) -> Any:
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def _record(self, model: str, resp: Any, note: str) -> float:
        usage = getattr(resp, "usage_metadata", None)
        tin = int(getattr(usage, "prompt_token_count", 0) or 0)
        tout = int(getattr(usage, "candidates_token_count", 0) or 0)
        usd = _cost(model, tin, tout)
        if self.spend_cb:
            self.spend_cb(usd, f"{model} {note}")
        return usd

    def _generate(self, model: str, prompt: str, cfg: Dict[str, Any], note: str) -> Any:
        from google.genai import types
        last: Optional[Exception] = None
        for attempt in range(2):
            try:
                self.calls += 1
                resp = self.client().models.generate_content(
                    model=model, contents=prompt, config=types.GenerateContentConfig(**cfg))
                self._record(model, resp, note)
                return resp
            except Exception as exc:  # noqa: BLE001 - one jittered retry
                last = exc
                if attempt == 0:
                    time.sleep(1.0 + random.random() * 2)
        raise RuntimeError(f"gemini {model} failed: {last}")

    def generate_json(self, prompt: str, model: str = FLASH, temperature: float = 0.4,
                      note: str = "generate") -> Any:
        """JSON-mode generation. Returns the parsed object."""
        resp = self._generate(model, prompt, {"response_mime_type": "application/json",
                                              "temperature": temperature}, note)
        return _extract_json(getattr(resp, "text", "") or "")

    def judge(self, prompt: str, note: str = "judge") -> Dict[str, Any]:
        """Gemini 2.5 Pro as a strict judge. Always returns {ok, reasons}."""
        framed = (prompt + "\n\nReply with JSON only: {\"ok\": true|false, \"reasons\": [\"...\"]}. "
                  "Set ok=false on ANY doubt. Reasons must be specific.")
        try:
            out = self.generate_json(framed, model=PRO, temperature=0.0, note=note)
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "reasons": [f"judge error: {exc}"[:200]]}
        if not isinstance(out, dict):
            return {"ok": False, "reasons": ["judge returned non-object"]}
        reasons = out.get("reasons") or []
        if not isinstance(reasons, list):
            reasons = [str(reasons)]
        return {"ok": bool(out.get("ok") is True), "reasons": [str(r) for r in reasons]}

    def grounded(self, query: str, note: str = "probe") -> Dict[str, Any]:
        """Gemini Flash with Google Search grounding. Returns text + sources.

        sources are the grounding chunk titles/uris (domains, not final URLs).
        `parsed` is False when the response carried no grounding metadata, so
        the caller records 'unknown' rather than 'not cited'.
        """
        from google.genai import types
        cfg = {"tools": [types.Tool(google_search=types.GoogleSearch())], "temperature": 0.2}
        try:
            resp = self._generate(FLASH, query, cfg, note)
        except Exception as exc:  # noqa: BLE001
            return {"text": "", "sources": [], "parsed": False, "error": str(exc)[:200]}
        sources: List[Dict[str, str]] = []
        parsed = False
        try:
            cand = (resp.candidates or [])[0]
            gm = getattr(cand, "grounding_metadata", None)
            chunks = getattr(gm, "grounding_chunks", None) or []
            parsed = gm is not None
            for ch in chunks:
                web = getattr(ch, "web", None)
                if web is not None:
                    sources.append({"title": getattr(web, "title", "") or "", "uri": getattr(web, "uri", "") or ""})
        except Exception:  # noqa: BLE001
            parsed = False
        return {"text": getattr(resp, "text", "") or "", "sources": sources, "parsed": parsed, "error": None}


def anthropic_search(query: str, api_key: Optional[str] = None, spend_cb: SpendCb = None,
                     model: str = "claude-sonnet-4-5") -> Dict[str, Any]:
    """Claude with the web_search tool, via requests. Optional (needs credit)."""
    key = api_key or config.env("ANTHROPIC_API_KEY")
    if not key:
        return {"text": "", "sources": [], "parsed": False, "error": "no key"}
    body = {
        "model": model, "max_tokens": 1024,
        "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],
        "messages": [{"role": "user", "content": query}],
    }
    try:
        resp = requests.post("https://api.anthropic.com/v1/messages", json=body, timeout=90,
                             headers={"x-api-key": key, "anthropic-version": "2023-06-01",
                                      "content-type": "application/json"})
    except requests.RequestException as exc:
        return {"text": "", "sources": [], "parsed": False, "error": str(exc)[:200]}
    if resp.status_code != 200:
        return {"text": "", "sources": [], "parsed": False, "error": f"{resp.status_code} {resp.text[:160]}"}
    data = resp.json()
    usage = data.get("usage", {})
    if spend_cb:
        spend_cb(_cost(model, int(usage.get("input_tokens", 0)), int(usage.get("output_tokens", 0))),
                 f"{model} probe")
    text_parts: List[str] = []
    sources: List[Dict[str, str]] = []
    for block in data.get("content", []):
        if block.get("type") == "text":
            text_parts.append(block.get("text", ""))
            for cit in block.get("citations", []) or []:
                if cit.get("url"):
                    sources.append({"title": cit.get("title", ""), "uri": cit["url"]})
        elif block.get("type") == "web_search_tool_result":
            for item in block.get("content", []) or []:
                if isinstance(item, dict) and item.get("url"):
                    sources.append({"title": item.get("title", ""), "uri": item["url"]})
    return {"text": "".join(text_parts), "sources": sources, "parsed": True, "error": None}


def openai_search(query: str, api_key: Optional[str] = None, spend_cb: SpendCb = None,
                  model: str = "gpt-4.1-mini") -> Dict[str, Any]:
    """OpenAI Responses API with web_search. Optional."""
    key = api_key or config.env("OPENAI_API_KEY")
    if not key:
        return {"text": "", "sources": [], "parsed": False, "error": "no key"}
    body = {"model": model, "tools": [{"type": "web_search_preview"}], "input": query}
    try:
        resp = requests.post("https://api.openai.com/v1/responses", json=body, timeout=90,
                             headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    except requests.RequestException as exc:
        return {"text": "", "sources": [], "parsed": False, "error": str(exc)[:200]}
    if resp.status_code != 200:
        return {"text": "", "sources": [], "parsed": False, "error": f"{resp.status_code} {resp.text[:160]}"}
    data = resp.json()
    usage = data.get("usage", {})
    if spend_cb:
        spend_cb(_cost(model, int(usage.get("input_tokens", 0)), int(usage.get("output_tokens", 0))),
                 f"{model} probe")
    text_parts: List[str] = []
    sources: List[Dict[str, str]] = []
    for item in data.get("output", []):
        for part in item.get("content", []) or []:
            if part.get("type") == "output_text":
                text_parts.append(part.get("text", ""))
                for ann in part.get("annotations", []) or []:
                    if ann.get("type") == "url_citation" and ann.get("url"):
                        sources.append({"title": ann.get("title", ""), "uri": ann["url"]})
    return {"text": "".join(text_parts), "sources": sources, "parsed": True, "error": None}


DFS_SERP_PRICE = {10: 0.002, 30: 0.005, 100: 0.0155}  # observed 2026-08-25, per task


def dataforseo_serp(keyword: str, spend_cb: SpendCb = None, depth: int = 30,
                    advanced: bool = True) -> Dict[str, Any]:
    """DataForSEO live SERP, ONE task per POST. Returns items + cost.

    Day-0 gotcha: `live/advanced` and `live/regular` accept only one task per
    request; an array silently runs the first and returns 40000 for the rest.
    So this function never batches. Spend is the API's own `cost` when
    present, else the observed price for the depth.
    """
    login, password = config.env("DATAFORSEO_LOGIN"), config.env("DATAFORSEO_PASSWORD")
    if not (login and password):
        return {"items": [], "cost": 0.0, "error": "no DataForSEO creds", "ai_overview": False}
    kind = "advanced" if advanced else "regular"
    url = f"https://api.dataforseo.com/v3/serp/google/organic/live/{kind}"
    payload = [{"keyword": keyword, "location_code": 2840, "language_code": "en",
                "device": "desktop", "depth": depth}]  # exactly one task
    try:
        resp = requests.post(url, json=payload, auth=(login, password), timeout=90)
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        return {"items": [], "cost": 0.0, "error": str(exc)[:200], "ai_overview": False}
    cost = float(data.get("cost") or 0.0) or DFS_SERP_PRICE.get(depth, 0.0155)
    if spend_cb and cost:
        spend_cb(cost, f"dataforseo serp d{depth} {keyword[:30]}")
    task = (data.get("tasks") or [{}])[0]
    result = (task.get("result") or [{}])[0]
    items = result.get("items") or []
    organic = [{"rank": it.get("rank_absolute"), "url": it.get("url"), "title": it.get("title"),
                "domain": it.get("domain")} for it in items if it.get("type") == "organic"]
    return {"items": organic, "cost": cost, "error": task.get("status_message") if task.get("status_code") != 20000 else None,
            "ai_overview": "ai_overview" in (result.get("item_types") or [])}


def log(msg: str) -> None:
    print(msg, file=sys.stderr)
