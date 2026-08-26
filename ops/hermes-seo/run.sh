#!/usr/bin/env bash
# Hermes runner for the myPayAdvisor SEO loop.
#
#   /opt/mypayadvisor-seo/run.sh daily|weekly|report|health|measure|probe [flags]
#
# 1. git pull --ff-only of the checkout (deploy key from the git-mirror cron).
#    No scp, ever: Hermes runs what is on the branch.
# 2. RULES parity: rules.json version must equal the live
#    /seo-manifest.json rules_version. Mismatch = SEO_APPLY_ENABLED=0 for this
#    run and a red line in the mail. A missing manifest (override layer not
#    deployed yet) is a warning; main.py keeps apply off on its own.
# 3. exec python3 main.py "$@".
set -euo pipefail

REPO="${SEO_REPO_DIR:-/opt/mypayadvisor-seo/repo}"
PKG="$REPO/ops/hermes-seo"
ENV_FILE="${SEO_ENV_FILE:-/opt/mypayadvisor-seo/.env}"
PY="${SEO_PYTHON:-/usr/bin/python3}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

if [ -d "$REPO/.git" ]; then
  if ! git -C "$REPO" pull --ff-only --quiet 2>&1; then
    echo "run.sh: git pull --ff-only failed, running the checked-out version" >&2
  fi
  echo "run.sh: code version $(git -C "$REPO" rev-parse --short HEAD)" >&2
else
  echo "run.sh: $REPO is not a git checkout" >&2
fi

RULES_LOCAL="${RULES_JSON_PATH:-$REPO/src/lib/seo/rules.json}"
[ -f "$RULES_LOCAL" ] || RULES_LOCAL="$PKG/rules.fallback.json"
SITE="${SITE_BASE:-https://www.mypayadvisor.com}"
LOCAL_VERSION="$("$PY" -c 'import json,sys; print(json.load(open(sys.argv[1]))["rules_version"])' "$RULES_LOCAL" 2>/dev/null || echo unknown)"
LIVE_VERSION="$(curl -fsS --max-time 20 "$SITE/seo-manifest.json" 2>/dev/null \
  | "$PY" -c 'import json,sys; print(json.load(sys.stdin).get("rules_version",""))' 2>/dev/null || true)"

if [ -z "$LIVE_VERSION" ]; then
  echo "run.sh: warn: $SITE/seo-manifest.json not available, RULES parity unchecked (apply stays off in main.py)" >&2
elif [ "$LIVE_VERSION" != "$LOCAL_VERSION" ]; then
  echo "run.sh: RULES parity mismatch: local $LOCAL_VERSION vs live $LIVE_VERSION, apply forced off" >&2
  export SEO_APPLY_ENABLED=0
  export SEO_PARITY_MISMATCH="$LOCAL_VERSION!=$LIVE_VERSION"
else
  echo "run.sh: RULES parity ok ($LOCAL_VERSION)" >&2
fi

cd "$PKG"
exec "$PY" main.py "$@"
