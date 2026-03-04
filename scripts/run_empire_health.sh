#!/usr/bin/env bash
# Empire OS — Health check (cron: 0 18 * * *)
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-/empire}"
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire health run started"
# tool run health --all
echo "[$(date -Iseconds)] Empire health run finished"
