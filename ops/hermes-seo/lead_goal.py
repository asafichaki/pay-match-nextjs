"""Read-only monthly merchant-request goal; never expose contact details."""
from __future__ import annotations
import datetime as dt
import re


def summarize(rows, now):
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    seen = set()
    eligible = []
    for row in sorted(rows, key=lambda r: r.get('created_at') or ''):
        email = (row.get('email') or '').strip().lower()
        name = (row.get('full_name') or '').strip()
        tags = row.get('tags') if isinstance(row.get('tags'), list) else []
        marked = any(str(x).lower() in ('test', 'spam', 'invalid') for x in [row.get('status'), *tags])
        test = re.search(r'^(test|qa)(\b|[-_])', name, re.I) or re.search(r'\+mpa-test[-@]|@(?:example\.(?:com|org|net|invalid)|resend\.dev)$', email, re.I)
        if marked or test or not name or not row.get('business_type') or not re.fullmatch(r'\S+@\S+\.\S+', email) or email in seen:
            continue
        try:
            created = dt.datetime.fromisoformat(row['created_at'].replace('Z', '+00:00'))
            if created.tzinfo is None:
                created = created.replace(tzinfo=dt.timezone.utc)
        except (ValueError, KeyError):
            continue
        if created > now:
            continue
        seen.add(email)
        eligible.append(created)
    count = sum(created >= start for created in eligible)
    rolling = sum(created >= now - dt.timedelta(days=30) for created in eligible)
    return {'available': True, 'month': start.strftime('%Y-%m'), 'timezone': 'UTC',
            'new_unique_requests': count, 'target': 10, 'remaining': max(0, 10-count),
            'trailing_30_days': rolling, 'last_request_at': max(eligible).isoformat() if eligible else None,
            'quality': 'Form-valid merchant requests; contact quality requires human review. Tests, marked spam, duplicates and newsletter-only contacts excluded.'}


def read(supa, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    try:
        rows = supa.get('quiz_leads', {'select': 'created_at,email,full_name,business_type,status,tags', 'order': 'created_at.asc'})
        return summarize(rows, now)
    except Exception:
        # An inaccessible database is unknown, never zero leads.
        return {'available': False, 'target': 10, 'reason': 'Merchant lead data unavailable'}
