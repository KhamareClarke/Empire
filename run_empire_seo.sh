#!/usr/bin/env bash
# Empire OS — SEO runner (cron: 0 13 * * *)
# Usage: /empire/run_empire_seo.sh  or  ./run_empire_seo.sh
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
export EMPIRE_ROOT
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire SEO run started"
node bin/empire.js run seo --all 2>&1 || true
EXIT=$?
if [ $EXIT -ne 0 ]; then
  node "$EMPIRE_ROOT/scripts/push-report-cron.js" "run_empire_seo failed" "Exit code $EXIT" 2>/dev/null || true
fi
echo "[$(date -Iseconds)] Empire SEO run finished (exit $EXIT)"
exit $EXIT
