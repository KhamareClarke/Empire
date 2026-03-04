# Phase 11 — Testing Order

All tests must pass before production approval. Run from empire root.

## Test order

| # | Test | What is verified |
|---|------|------------------|
| 1 | **DB write (service role)** | Service role can insert into `empire_leads`, `empire_reports`, `empire_agent_activity`. |
| 2 | **Agent activity test** | Bridge `pushLead`, `pushReport`, `logAgentActivity` write correctly; activity rows visible via service role. |
| 3 | **Dashboard read (admin)** | With admin JWT, anon client can SELECT from central tables (dashboard scenario). If `TEST_ADMIN_JWT` not set, step is skipped. |
| 4 | **RLS (non-admin)** | Anon client without admin sees no rows (SELECT); INSERT as anon is denied. |
| 5 | **Failure simulation** | `pushReport` with `severity: 'error'` writes to `empire_reports` and row is readable. |
| 6 | **Cron execution verification** | `empire status` exits 0; `scripts/push-report-cron.js` runs and succeeds. |

## Env source

Tests (and monitoring/cron scripts) load env from **KhamareClarke.com** first: `khamareclarke.com-main/.env.local`, then `.env`, then `empire/.env`. Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in one of those.

## How to run

From empire root (with credentials in khamareclarke.com-main/.env.local or empire/.env):

```bash
npm test
```

or:

```bash
node tests/run-phase11-order.js
```

Optional for test 3 (dashboard read as admin): set `TEST_ADMIN_JWT` to a valid Supabase access token for a user whose `raw_user_meta_data->>'role' = 'admin'` (or JWT `role = 'admin'`). If unset, test 3 is skipped and the rest still run.

Optional for anon/RLS tests: set `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` so tests 3 and 4 can run (dashboard and RLS checks).

## Exit code

- **0** — All tests passed; production approval gate passed.
- **1** — One or more tests failed; production approval blocked.

## Legacy

- `tests/run-db-write-test.js` — Test 1 only; still runnable via `npm run test:db` for quick DB write checks.
