# Empire OS — Testing Order (Phase 11)

Run in this order. All must pass before production.

1. **DB write test (service role)**  
   From a Node script or runner: use empire-bridge with SUPABASE_SERVICE_ROLE_KEY to insert one row into empire_leads, empire_reports, empire_agent_activity. Confirm rows exist in Supabase dashboard.

2. **Agent activity test**  
   Call `logAgentActivity({ agent_id: 'test-agent', action: 'run', status: 'started' })` then `status: 'finished'`. Confirm two rows in empire_agent_activity.

3. **Dashboard read test (admin)**  
   Log in as admin on KhamareClarke.com, open /dashboard/empire. Confirm Leads overview, Leads by project, Agent activity, Reports, Failures, and Health summary load without error.

4. **RLS test (non-admin)**  
   As a non-admin user (or anon), attempt to read empire_leads via Supabase anon client. Must get no rows (or RLS denial).

5. **Failure simulation**  
   Insert a row into empire_reports with severity = 'error'. Confirm it appears in Dashboard Failures view.

6. **Cron execution verification**  
   Run each of run_empire_leads.sh, run_empire_seo.sh, run_empire_health.sh, run_empire_weekly_report.sh manually. Confirm they exit 0 and (when wired to bridge) that activity is logged.
