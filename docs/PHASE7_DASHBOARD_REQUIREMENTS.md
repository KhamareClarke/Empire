# Phase 7 — Dashboard requirements

## Requirement

**KhamareClarke.com** must display all six views below. The dashboard must read **only** from Supabase central tables (no other data sources).

---

## Required views (all implemented)

| View | Source | Location in UI |
|------|--------|----------------|
| **Leads overview** | empire_leads | Total count + note that data is from empire_leads |
| **Leads by project** | empire_leads | Table: project_id → count |
| **Agent activity logs** | empire_agent_activity | Table: time, project, agent, status |
| **Reports table** | empire_reports | Table: time, project, type, severity, title |
| **Failures view** | empire_reports (severity = error) | Table: errors only |
| **Empire health summary** | All three tables | KPIs: Leads 24h, Leads 48h, Error count |

---

## Implementation

- **Route:** `/dashboard/empire` (under KhamareClarke.com; same auth as Control Centre).
- **Entry:** “Empire OS” link in the main dashboard header.
- **Data:** All queries use Supabase client with **anon key** only. Tables: `empire_leads`, `empire_reports`, `empire_agent_activity`. RLS limits rows to admin users.
- **No service role in the browser.** No other APIs or DBs for this dashboard.

---

## File

- **Page:** `khamareclarke.com-main/src/app/dashboard/empire/page.jsx` (or `empire/khamareclarke.com/src/app/dashboard/empire/page.jsx` when using empire junctions).

Phase 7 complete: all six views exist and read only from Supabase central tables.
