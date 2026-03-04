#!/usr/bin/env bash
# Empire OS — Leads runner (cron: 0 9 * * *)
# Usage: /empire/run_empire_leads.sh  or  ./run_empire_leads.sh
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
export EMPIRE_ROOT
export EMPIRE_CRON_SECRET="${EMPIRE_CRON_SECRET:-}"
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire leads run started"
node bin/empire.js run leads --all 2>&1 || true
EXIT=$?
if [ $EXIT -ne 0 ]; then
  node "$EMPIRE_ROOT/scripts/push-report-cron.js" "run_empire_leads failed" "Exit code $EXIT" 2>/dev/null || true
fi
echo "[$(date -Iseconds)] Empire leads run finished (exit $EXIT)"
exit $EXIT
