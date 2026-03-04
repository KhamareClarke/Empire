# Empire OS — Monitoring & Alerts (Phase 10)

## Alert Conditions (all logged with `severity = 'error'`)

| Condition | Action |
|-----------|--------|
| No leads for 48 hours | Log to empire_reports (severity: error) |
| Cron fails twice consecutively | Log to empire_reports (severity: error) |
| DB unreachable > 5 minutes | Log to empire_reports (severity: error) on recovery |
| Agent success rate < 80% | Log to empire_reports (severity: error); payload with counts |

## Failure Logging

All failures **must** be logged to `empire_reports` with `severity = 'error'` and a clear `title`/`body` so the Dashboard Failures view and monitoring can surface them.

## Implementation

- **Monitoring script:** `empire/scripts/run_empire_monitoring.js` — run every 15 min (cron or Task Scheduler). Checks all four conditions; uses `empire/.monitoring/db_fail_state.json` for DB outage duration.
- **Cron failures:** Runners call `node scripts/push-report-cron.js "run_empire_<name> failed" "Exit code N"` on non-zero exit so the monitor can detect "cron failed twice consecutively."
- **Agents:** On exception or failure status, call `pushReport({ severity: 'error', ... })` and `logAgentActivity({ status: 'failed', error_message })`.
- See **docs/PHASE10_MONITORING_ALERTS.md** for full details.
