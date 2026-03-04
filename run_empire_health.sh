#!/usr/bin/env bash
# Empire OS — Health check (cron: 0 18 * * *)
# Usage: /empire/run_empire_health.sh  or  ./run_empire_health.sh
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
export EMPIRE_ROOT
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire health run started"
node bin/empire.js run health --all 2>&1 || true
EXIT=$?
if [ $EXIT -ne 0 ]; then
  node "$EMPIRE_ROOT/scripts/push-report-cron.js" "run_empire_health failed" "Exit code $EXIT" 2>/dev/null || true
fi
echo "[$(date -Iseconds)] Empire health run finished (exit $EXIT)"
exit $EXIT
