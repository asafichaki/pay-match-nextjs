#!/usr/bin/env python3
"""Phase 0 of the myPayAdvisor SEO autopilot: the daily indexing ping.

Builds the set of URLs changed in the last 7 days (blog_articles rows plus a
seed file), posts them to IndexNow (api.indexnow.org and bing.com), then
submits the sitemap to Google Search Console.

Honest framing: IndexNow reaches Bing and Copilot only. Google ignores it.
The GSC sitemap submit is the only Google-facing signal in this script.

Env:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   PostgREST read of blog_articles
  GSC_SA_JSON                               service account file, webmasters scope
  GSC_SITE                                  default sc-domain:mypayadvisor.com
  SITE_BASE                                 default https://www.mypayadvisor.com
  INDEXNOW_KEY                              key file must live at SITE_BASE/<key>.txt
  SEED_URLS_FILE                            optional, one URL or path per line

Usage:
  ping.py             run for real
  ping.py --dry-run   print the URL set, do not POST anywhere

Prints one JSON line per run. Exit 0 unless both IndexNow endpoints fail.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import requests

INDEXNOW_ENDPOINTS = {
    "api": "https://api.indexnow.org/indexnow",
    "bing": "https://www.bing.com/indexnow",
}
GSC_SCOPE = "https://www.googleapis.com/auth/webmasters"
HTTP_TIMEOUT = 30
LOOKBACK_DAYS = 7


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if isinstance(value, str):
        value = value.strip().strip('"').strip("'")
    if required and not value:
        print(f"ping.py: missing env {name}", file=sys.stderr)
        sys.exit(2)
    return value


def log(msg):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] {msg}", file=sys.stderr)


def recent_article_urls(supabase_url, service_key, site_base):
    """Published blog_articles touched in the last LOOKBACK_DAYS days."""
    since = (datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)).isoformat()
    params = {
        "select": "kind,slug,updated_at",
        "published": "eq.true",
        "updated_at": f"gte.{since}",
        "order": "updated_at.desc",
    }
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }
    resp = requests.get(
        f"{supabase_url.rstrip('/')}/rest/v1/blog_articles",
        params=params,
        headers=headers,
        timeout=HTTP_TIMEOUT,
    )
    resp.raise_for_status()
    rows = resp.json()
    urls = []
    for row in rows:
        kind = (row.get("kind") or "").strip("/")
        slug = (row.get("slug") or "").strip("/")
        if kind and slug:
            urls.append(f"{site_base}/{kind}/{slug}")
    log(f"blog_articles changed in {LOOKBACK_DAYS}d: {len(urls)}")
    return urls


def seed_urls(path, site_base):
    """Seed file: one entry per line, absolute URL or site path. # comments ok."""
    if not path:
        return []
    if not os.path.exists(path):
        log(f"seed file not found, skipping: {path}")
        return []
    urls = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("http://") or line.startswith("https://"):
                urls.append(line)
            else:
                urls.append(f"{site_base}/{line.lstrip('/')}")
    log(f"seed urls: {len(urls)}")
    return urls


def dedupe(urls):
    seen = set()
    out = []
    for u in urls:
        u = u.rstrip("/")
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def post_indexnow(endpoint, host, key, key_location, urls):
    """Returns HTTP status, or a short error string."""
    payload = {
        "host": host,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls,
    }
    try:
        resp = requests.post(
            endpoint,
            json=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=HTTP_TIMEOUT,
        )
    except requests.RequestException as exc:
        return f"error:{exc.__class__.__name__}"
    if resp.status_code not in (200, 202):
        body = (resp.text or "").strip().replace("\n", " ")[:200]
        log(f"indexnow {endpoint} -> {resp.status_code} {body}")
    return resp.status_code


def submit_sitemap(sa_json, site, feedpath):
    """GSC sitemaps.submit. Returns 'ok' or a short error string."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
    except ImportError as exc:
        return f"error:import:{exc.name}"
    try:
        creds = service_account.Credentials.from_service_account_file(
            sa_json, scopes=[GSC_SCOPE]
        )
        service = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
        service.sitemaps().submit(siteUrl=site, feedpath=feedpath).execute()
        return "ok"
    except HttpError as exc:
        status = getattr(exc.resp, "status", "?")
        if status == 403:
            log(
                "sitemaps.submit 403: the service account is not a siteOwner "
                f"on {site} or lacks the webmasters write scope. Continuing."
            )
        return f"http:{status}"
    except Exception as exc:
        return f"error:{exc.__class__.__name__}"


def main(argv):
    dry_run = "--dry-run" in argv

    supabase_url = env("SUPABASE_URL", required=True)
    service_key = env("SUPABASE_SERVICE_ROLE_KEY", required=True)
    sa_json = env("GSC_SA_JSON", required=True)
    gsc_site = env("GSC_SITE", "sc-domain:mypayadvisor.com")
    site_base = env("SITE_BASE", "https://www.mypayadvisor.com").rstrip("/")
    indexnow_key = env("INDEXNOW_KEY", required=True)
    seed_file = env("SEED_URLS_FILE")

    host = urlparse(site_base).netloc
    key_location = f"{site_base}/{indexnow_key}.txt"
    sitemap_url = f"{site_base}/sitemap.xml"

    urls = dedupe(
        recent_article_urls(supabase_url, service_key, site_base)
        + seed_urls(seed_file, site_base)
    )

    if dry_run:
        for u in urls:
            print(u)
        print(
            json.dumps(
                {
                    "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    "dry_run": True,
                    "urls": len(urls),
                    "host": host,
                    "keyLocation": key_location,
                    "sitemap": sitemap_url,
                    "gsc_site": gsc_site,
                }
            )
        )
        return 0

    indexnow = {}
    if urls:
        for name, endpoint in INDEXNOW_ENDPOINTS.items():
            indexnow[name] = post_indexnow(endpoint, host, indexnow_key, key_location, urls)
    else:
        log("no urls to ping, skipping IndexNow")
        indexnow = {name: "skipped" for name in INDEXNOW_ENDPOINTS}

    sitemap_submit = submit_sitemap(sa_json, gsc_site, sitemap_url)

    result = {
        "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "urls": len(urls),
        "indexnow": indexnow,
        "sitemap_submit": sitemap_submit,
    }
    print(json.dumps(result))

    ok_statuses = (200, 202, "skipped")
    both_failed = urls and all(s not in ok_statuses for s in indexnow.values())
    return 1 if both_failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
