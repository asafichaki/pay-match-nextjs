#!/bin/bash
# myPayAdvisor SEO Phase 0: daily IndexNow ping + GSC sitemap submit. Cron: 06:20 IL.
set -euo pipefail
cd "$(dirname "$0")"
set -a; source ./.env; set +a
exec /usr/bin/python3 ping.py "$@"
