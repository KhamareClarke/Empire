#!/usr/bin/env bash
# Empire OS — SEO runner (cron: 0 13 * * *)
set -e
EMPIRE_ROOT="${EMPIRE_ROOT:-/empire}"
cd "$EMPIRE_ROOT" || exit 1
[ -f .env ] && set -a && source .env && set +a
echo "[$(date -Iseconds)] Empire SEO run started"
# tool run seo --all
echo "[$(date -Iseconds)] Empire SEO run finished"
