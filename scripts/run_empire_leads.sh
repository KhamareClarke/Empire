#!/usr/bin/env bash
# Empire OS — Leads runner (cron: 0 9 * * *)
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-/empire}"
export EMPIRE_CRON_SECRET="${EMPIRE_CRON_SECRET:-}"
cd "$EMPIRE_ROOT" || exit 1
# Load .env if present
[ -f .env ] && set -a && source .env && set +a
# Run leads aggregation (implement per your tooling)
echo "[$(date -Iseconds)] Empire leads run started"
# Placeholder: invoke your orchestration tool or node script
# tool run leads --all
echo "[$(date -Iseconds)] Empire leads run finished"
