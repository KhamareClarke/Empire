#!/usr/bin/env bash
# Empire OS — Weekly report (cron: 0 18 * * 0)
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-/empire}"
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire weekly report started"
# tool run weekly-report --all
echo "[$(date -Iseconds)] Empire weekly report finished"
