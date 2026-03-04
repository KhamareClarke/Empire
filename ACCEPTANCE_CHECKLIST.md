# EMPIRE OS — Acceptance Checklist

When all phases show **OK** → **Empire OS Operational.**

## How to know all phases are achieved

From empire root, run:

```bash
npm run verify
```

or:

```bash
node scripts/verify-all-phases.js
```

The script prints a table: **Phase | Status | Detail**. Status is **OK**, **FAIL**, or **SKIP**. All phases must be OK (or SKIP only where env is not set; set Supabase keys and run again to clear Phase 4 & 11).

---

## Verification Protocol (production sign-off)

For full proof of production readiness, follow **EMPIRE VERIFICATION PROTOCOL v1.0** and collect evidence (screenshots) for all 9 steps. See `docs/EMPIRE_VERIFICATION_PROTOCOL.md`.

## Final Test and 24-Hour Burn-In (acceptance)

**Completion is NOT acceptance. Verification + Burn-In = Acceptance.**

- **Phase 1 — Immediate verification:** 7 items (orchestration, DB leads, agent activity, dashboard, failure sim, RLS, cron). Evidence: screenshots. See `docs/EMPIRE_FINAL_TEST_AND_BURNIN_PROTOCOL.md`.
- **Phase 2 — 24-hour burn-in:** Do not manually trigger jobs; let automation run 24h. Capture leads per repo, agent executions, error rate, health summary, last cron timestamps. Use `scripts/verification/burn-in-report-template.md` and optionally `node scripts/verification/burn-in-summary.js` to fill counts.

**Final acceptance checklist** (all must be checked): 8 repos active, 8 test leads verified, agent logging confirmed, dashboard accurate, failure handling proven, RLS secure, cron running, alerts functional, **24-hour burn-in passed**. Only then → System Approved. See protocol doc for “What happens next” (performance scoring, auto-disable threshold, weekly report, audit archive, staging, versioned registry, stress test).

- [ ] Step 1 — System recognition (8 repos)
- [ ] Step 2 — 8 test leads in DB
- [ ] Step 3 — Agent activity logs
- [ ] Step 4 — Failure simulation
- [ ] Step 5 — Dashboard matches DB
- [ ] Step 6 — Cron / scheduled run
- [ ] Step 7 — RLS (admin vs non-admin)
- [ ] Step 8 — Alerts
- [ ] Step 9 — Rollback

**If any item fails → system is NOT production ready.**

---

## Manual checklist (optional)

- [ ] **Phases 0–2** — Global skills path exists; repos have .agents/skills
- [ ] **Phase 1** — `empire status` passes
- [ ] **Phase 3** — 8 repos in empire.config.json
- [ ] **Phase 4** — Supabase tables live (run 001_empire_central_tables.sql); verify with `npm test`
- [ ] **Phase 5** — Env set (khamareclarke.com-main/.env.local or empire/.env)
- [ ] **Phase 6** — shared/empire-bridge (pushLead, pushReport, logAgentActivity)
- [ ] **Phase 7** — Dashboard route /dashboard/empire
- [ ] **Phase 8** — Agent contract schema + contract-helper
- [ ] **Phase 9** — 4 runner scripts present; cron scheduled
- [ ] **Phase 10** — Monitoring + push-report-cron scripts
- [ ] **Phase 11** — `npm test` passes (all 6 tests)

---
*Empire OS Integration Runbook v1.0*
