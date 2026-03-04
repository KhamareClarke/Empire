# Phase 4 — Supabase central tables

## Requirements

1. Create tables: **empire_leads**, **empire_reports**, **empire_agent_activity**
2. Enable **RLS** on all tables
3. Allow **read access only for admin users**
4. Use **service role for server-side inserts only** (no INSERT/UPDATE/DELETE policies for anon or authenticated)

---

## Migration file

**Path:** `empire/supabase/migrations/001_empire_central_tables.sql`

Run this in the **Supabase SQL Editor** for the project used by KhamareClarke.com (or your central Empire project).

### Tables

| Table | Purpose |
|-------|---------|
| **empire_leads** | Unified leads from all 8 projects (project_id, source, email, name, payload, created_at) |
| **empire_reports** | Reports and failures (project_id, report_type, severity, title, body, payload, created_at) |
| **empire_agent_activity** | Agent run logs (project_id, agent_id, action, status, started_at, finished_at, payload, error_message) |

### RLS

- **RLS is enabled** on all three tables.
- **SELECT** is allowed only for admin users (JWT `role = 'admin'` or `auth.users.raw_user_meta_data->>'role' = 'admin'`).
- **No INSERT/UPDATE/DELETE policies** for `anon` or `authenticated` — so only the **service_role** key (used server-side) can insert/update/delete. Never expose the service role key to the client.

### How to run

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Paste the contents of `001_empire_central_tables.sql`.
3. Run the script.

### After migration

- **Dashboard (KhamareClarke.com)** uses the **anon** key and reads via RLS; only admin users see rows.
- **Empire bridge and cron** use the **service_role** key server-side to insert into these tables.
