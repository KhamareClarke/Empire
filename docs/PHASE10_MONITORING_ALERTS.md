# Phase 10 — Monitoring & Alerts

## Alert conditions (all logged to `empire_reports` with `severity = 'error'`)

| Condition | Check | Action |
|-----------|--------|--------|
| No leads for 48 hours | Latest `empire_leads.created_at` | Insert report: title "No leads for 48 hours", payload last_lead_at |
| Cron fails twice consecutively | Last 2 `empire_reports` with `report_type = 'cron'` | If both `severity = 'error'`, insert report "Cron failed twice consecutively" |
| DB unreachable > 5 minutes | Local state file + Supabase ping | On recovery after ≥5 min outage, insert report "DB was unreachable for > 5 minutes" |
| Agent success rate < 80% | Last 24h `empire_agent_activity` (finished vs failed) | If rate < 0.8 and ≥10 runs, insert report with payload counts |

## Failure logging

All such failures **must** appear in `empire_reports` with `severity = 'error'` so the Dashboard Failures view and any external monitoring can surface them.

## Implementation

### Monitoring script (run every 15 min)

- **Path:** `empire/scripts/run_empire_monitoring.js`
- **Run:** `node scripts/run_empire_monitoring.js` from empire root (e.g. cron `*/15 * * * *` or Task Scheduler).
- **Env:** Loads `.env` from empire root; requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **DB unreachable:** Uses local state in `empire/.monitoring/db_fail_state.json`; on first success after an outage ≥5 min, writes the alert then clears state.

### Cron failure reporting

- **Path:** `empire/scripts/push-report-cron.js`
- **Usage:** `node scripts/push-report-cron.js "run_empire_leads failed" "Exit code 1"`
- **Runners:** All four Phase 9 runners (`run_empire_leads.sh`, `run_empire_seo.sh`, `run_empire_health.sh`, `run_empire_weekly_report.sh`) call this on non-zero exit so cron failures are written to `empire_reports` with `report_type = 'cron'`, `severity = 'error'`.

### Optional

- Add `empire/.monitoring/` to `.gitignore`.
- Wire external alerts (email, PagerDuty) from Dashboard or a separate job that reads `empire_reports` where `severity = 'error'`.
