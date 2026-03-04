# EMPIRE VERIFICATION PROTOCOL v1.0

**Purpose:** To fully verify that the Empire OS infrastructure is complete, operational, secure, and production-ready. “Completed” is not accepted without proof.

---

## STEP 1 — SYSTEM RECOGNITION TEST

**From the /empire root:** Run orchestration status command.

**Expected:**
- All 8 repositories listed
- No inactive repos
- No configuration errors

**Evidence Required:** Screenshot of status output.

**How to run:**
```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node bin/empire.js status
```
Or: `empire status` if installed globally.

---

## STEP 2 — DATABASE WRITE TEST

Trigger 1 test lead in EACH repo manually.

**Expected:**
- 8 new rows in `empire_leads`
- Correct `project_id` (per repo)
- Valid timestamp
- No null critical fields

**Evidence Required:** Screenshot of Supabase `empire_leads` table showing 8 new entries.

**How to run:**
```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node scripts/verification/step2-push-8-leads.js
```
Then open Supabase → Table Editor → `empire_leads` and screenshot the latest 8 rows.

---

## STEP 3 — AGENT ACTIVITY LOG TEST

Run 1 agent across all repos.

**Expected:**
- 8 entries in `empire_agent_activity`
- Correct agent identifier
- status = 'finished' (success)

**Evidence Required:** Screenshot of `empire_agent_activity` table.

**How to run:**
```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node scripts/verification/step3-log-8-agents.js
```
Then open Supabase → `empire_agent_activity` and screenshot the latest 8 rows.

---

## STEP 4 — FAILURE SIMULATION TEST

Break one repo intentionally (wrong environment variable). Run job again.

**Expected:**
- That repo logs success = false
- error_message recorded
- Other 7 repos continue successfully
- System does not crash

**Evidence Required:** Screenshot of failure log + proof other repos worked.

**How to run:**
```powershell
node scripts/verification/step4-failure-simulation.js --break-repo=omniwtms
```
This script runs one “agent” per repo; one repo is simulated as broken and logs a failure; the other 7 succeed. Then screenshot `empire_agent_activity` (one failed, seven finished) and `empire_reports` (one error).

---

## STEP 5 — DASHBOARD AGGREGATION TEST

Log into KhamareClarke.com dashboard. Verify:
- Leads count matches database
- Activity count matches database
- Filters function properly

**Evidence Required:** Screenshot of dashboard + DB comparison (e.g. Supabase row count vs dashboard numbers).

**How to run:** Manual. Open `/dashboard/empire` and Supabase Table Editor; compare counts.

---

## STEP 6 — CRON TEST

Force-run each scheduled script manually. Then verify scheduled execution runs automatically.

**Expected:**
- Timestamp updates
- New data appears
- No silent failures

**Evidence Required:** Screenshot of crontab list (or Task Scheduler) + last run logs.

**How to run (manual force):**
```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node bin/empire.js run leads --all
node bin/empire.js run seo --all
node bin/empire.js run health --all
node bin/empire.js run weekly-report --all
node scripts/run_empire_monitoring.js
```
Windows: Task Scheduler → View Empire-* tasks → History. Screenshot task list and last run result.

---

## STEP 7 — RLS SECURITY TEST

Login as:
- **Admin** → confirm read access
- **Non-admin** → confirm no read access

**Evidence Required:** Screenshot showing RLS blocking non-admin access.

**How to run:** If using anon read (migration 002), temporarily drop anon policies and use Supabase Auth: sign in as admin → dashboard shows data; sign in as non-admin (or no user) → dashboard shows no rows. Screenshot both. Re-apply anon read policy if needed for dashboard without auth.

---

## STEP 8 — ALERT TEST

Disable scraping logic. Let system run. Expected:
- Alert triggers
- Failure logged in `empire_reports`

**Evidence Required:** Screenshot of alert + failure record.

**How to run:** Disable the leads scheduled task (or stop running leads job). Wait for monitoring to run (or run `node scripts/run_empire_monitoring.js` after 48h no leads / or force alert condition). Check `empire_reports` for severity = 'error' monitoring alert. Screenshot.

---

## STEP 9 — ROLLBACK TEST

1. Disable cron (or all Empire scheduled tasks).
2. Re-enable cron.
3. Confirm system resumes normally.

**Evidence Required:** Screenshot of cron disable/enable + successful next run.

**How to run:** Task Scheduler → Disable all Empire-* tasks → run one manually to confirm it still works → Re-enable tasks → wait for next scheduled run or trigger one → screenshot success.

---

## FINAL ACCEPTANCE CRITERIA

The system is verified **only if ALL** below are proven with screenshots:

- [ ] 8 repos recognized
- [ ] 8 test leads inserted
- [ ] Agent logs populated
- [ ] Failure handling proven
- [ ] Dashboard matches database
- [ ] Cron functioning
- [ ] RLS secure
- [ ] Alerts functioning
- [ ] Rollback validated

**If any item fails → system is NOT production ready.**

---

*End of Protocol.*
