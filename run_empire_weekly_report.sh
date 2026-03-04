#!/usr/bin/env bash
# Empire OS — Weekly report (cron: 0 18 * * 0)
# Usage: /empire/run_empire_weekly_report.sh  or  ./run_empire_weekly_report.sh
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
export EMPIRE_ROOT
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire weekly report started"
node bin/empire.js run weekly-report --all 2>&1 || true
EXIT=$?
if [ $EXIT -ne 0 ]; then
  node "$EMPIRE_ROOT/scripts/push-report-cron.js" "run_empire_weekly_report failed" "Exit code $EXIT" 2>/dev/null || true
fi
echo "[$(date -Iseconds)] Empire weekly report finished (exit $EXIT)"
exit $EXIT
