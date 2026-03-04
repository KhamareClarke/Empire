# Automate all data to the dashboard

So the Empire dashboard always has fresh data without you running anything by hand:

1. **Jobs push data** — When a job runs (leads, seo, health, weekly-report), it uses the bridge to write to Supabase: leads, reports, agent activity. The dashboard reads from the same Supabase project, so new data appears there.

2. **Schedule the jobs (Windows)** — Run this **once** from the empire folder (PowerShell, preferably as Administrator):

   ```powershell
   cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
   .\scripts\schedule-empire-tasks.ps1
   ```

   That creates scheduled tasks:

   | Task                | When              | What runs                          |
   |---------------------|-------------------|------------------------------------|
   | Empire-Leads        | Daily 09:00       | Leads job → Supabase               |
   | Empire-SEO          | Daily 13:00       | SEO job → Supabase                 |
   | Empire-Health       | Daily 18:00       | Health job → Supabase              |
   | Empire-WeeklyReport | Sunday 18:00      | Weekly report → Supabase           |
   | Empire-Monitoring   | Every 15 minutes | Monitoring checks → alerts to Supabase |

3. **Env** — Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `khamareclarke.com-main/.env.local` (or `empire/.env`). The runners load that env so the bridge can write.

4. **Dashboard** — Open KhamareClarke.com → `/dashboard/empire`. After the first scheduled run, you’ll see new leads, reports, and agent activity. Data keeps updating on the schedule above.

---

## Jobs run by Empire (GitHub) — no PC needed

The [Empire repo](https://github.com/KhamareClarke/Empire) has scheduled workflows that run the same jobs from GitHub. Add **SUPABASE_URL** and **SUPABASE_SERVICE_ROLE_KEY** in repo Settings → Secrets → Actions. Workflows: **Scheduled leads** (daily 09:00 UTC), **Scheduled SEO** (13:00 UTC), **Scheduled health** (18:00 UTC), **Scheduled weekly report** (Sunday 18:00 UTC). You can also run any workflow manually from Actions.

## Clear current data (see only new data)

- **Supabase SQL Editor:** run `TRUNCATE TABLE empire_agent_activity, empire_reports, empire_leads;`
- **Or:** from empire root run `node scripts/clear-empire-data.js` (env set).

---

**Manual run (no schedule):**

```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node bin/empire.js run leads --all
```

Then refresh the dashboard to see the new row.
