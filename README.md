# Empire OS Integration

Unify 8 repositories under one **Sovereign Control Panel** (KhamareClarke.com) with structured logging, reporting, and centralized oversight. All 29 agents operate across all projects via shared skills and the Empire Bridge.

## Repo mapping (empire.config.json)

| ID              | Path                 | Name              |
|-----------------|----------------------|-------------------|
| khamareclarke   | khamareclarke.com-main | KhamareClarke.com (sovereign) |
| omniwtms        | omniwtms.com         | Omni WTMS         |
| myapproved      | myapproved.com       | MyApproved        |
| adstarter       | AdsStarter.com       | AdStarter         |
| seoinforce      | Seoinforce.com       | SEO Inforce       |
| identitymarketing | Identimarketing.com | Identity Marketing |
| leveragejournal | leveragejournel      | Leverage Journal  |
| leverageacademy | LeverageAcademy.com   | Leverage Academy  |

## Quick start

1. **Phase 0–2:** Create `/empire` (or use `empire/` in ALL PROJECTS). Put repos inside or set paths in `empire.config.json`. Optional: global skills symlink (see `PHASE0_GLOBAL_SKILLS.md`).
2. **Phase 4:** Run `empire/supabase/migrations/001_empire_central_tables.sql` in your Supabase SQL Editor.
3. **Phase 5:** Copy `empire/.env.example` to `empire/.env` and each repo; set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and server-side only `SUPABASE_SERVICE_ROLE_KEY`.
4. **Phase 6:** In each repo, depend on or copy `empire/shared/empire-bridge` and call `pushLead`, `pushReport`, `logAgentActivity` from agents/cron.
5. **Phase 7:** Dashboard at **KhamareClarke.com** → `/dashboard/empire` (link added in Control Centre). Uses anon key; RLS limits reads to admin.
6. **Phase 9:** Schedule cron (or Task Scheduler on Windows) for `empire/scripts/run_empire_*.sh` or `.ps1` as in the runbook.
7. **Phase 11:** Run tests in `empire/tests/empire-test-order.md`; use `npm run test:db` in `empire` for the DB write test.

## Files

- `empire.config.json` — Repo list and paths
- `shared/empire-bridge/` — pushLead, pushReport, logAgentActivity (use with service role server-side only)
- `supabase/migrations/001_empire_central_tables.sql` — Central tables + RLS
- `scripts/run_empire_*.sh` and `run_empire_leads.ps1` — Cron runners
- `docs/DASHBOARD_REQUIREMENTS.md`, `docs/MONITORING_ALERTS.md` — Specs
- `ACCEPTANCE_CHECKLIST.md` — Sign-off list
- `tests/empire-test-order.md`, `tests/run-db-write-test.js` — Testing order and DB test

## Cron schedule (runbook)

- `0 9 * * *` — run_empire_leads
- `0 13 * * *` — run_empire_seo
- `0 18 * * *` — run_empire_health
- `0 18 * * 0` — run_empire_weekly_report

---

*Empire OS Integration Runbook v1.0*
