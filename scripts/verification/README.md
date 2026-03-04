# Verification Protocol Scripts

Used by **EMPIRE VERIFICATION PROTOCOL v1.0** (see `docs/EMPIRE_VERIFICATION_PROTOCOL.md`) and **EMPIRE FINAL TEST & 24-HOUR BURN-IN PROTOCOL v1.0** (see `docs/EMPIRE_FINAL_TEST_AND_BURNIN_PROTOCOL.md`).

Run from **empire root**:

| Step | Script | Purpose |
|------|--------|---------|
| 2 | `node scripts/verification/step2-push-8-leads.js` | Push 1 test lead per repo → 8 rows in `empire_leads` |
| 3 | `node scripts/verification/step3-log-8-agents.js` | Log 1 agent per repo → 8×2 rows in `empire_agent_activity` |
| 4 | `node scripts/verification/step4-failure-simulation.js [--break-repo=ID]` | One repo fails, others succeed → proof of failure handling |

Steps 1, 5, 6, 7, 8, 9 are manual (status command, dashboard comparison, cron, RLS, alerts, rollback). See the protocol doc for evidence required.

### Burn-in (24-hour)
- **burn-in-report-template.md** — Fill after 24h; capture leads per repo, executions, error rate, last cron times.
- **burn-in-summary.js** — Query Supabase for last-24h counts to pre-fill the report. Run: `node scripts/verification/burn-in-summary.js` (env set).
- **run-all.js** — Runs Steps 1–4 in one go: `node scripts/verification/run-all.js`.
