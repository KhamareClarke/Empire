# Empire Dashboard Requirements (Phase 7)

KhamareClarke.com is the **Sovereign Control Panel**. It must display the following. All data MUST be read **only** from Supabase central tables (empire_leads, empire_reports, empire_agent_activity). Use anon key with RLS so only admin users can see data.

## Required Views

| View | Source table(s) | Description |
|------|-----------------|-------------|
| **Leads overview** | empire_leads | Total count, recent leads |
| **Leads by project** | empire_leads | Group by project_id, counts and list |
| **Agent activity logs** | empire_agent_activity | Filter by project_id, agent_id, status, date range |
| **Reports table** | empire_reports | All reports; filter by severity (error for failures) |
| **Failures view** | empire_reports | WHERE severity = 'error' |
| **Empire health summary** | All three | KPIs: leads last 24h/48h, error count, agent success rate |

## Implementation Notes

- Add route: `/dashboard/empire` or `/empire` (protected; admin only).
- Use Supabase client with **anon key** (RLS grants SELECT to admin only).
- Never use service role key in the dashboard (browser).
- Refresh via polling or Supabase Realtime if desired.

## Suggested Components

- `EmpireLeadsOverview.jsx` — cards + table
- `EmpireLeadsByProject.jsx` — grouped table or tabs
- `EmpireAgentActivity.jsx` — filterable log table
- `EmpireReports.jsx` — reports table with severity badge
- `EmpireFailures.jsx` — error-only list
- `EmpireHealthSummary.jsx` — headline KPIs
