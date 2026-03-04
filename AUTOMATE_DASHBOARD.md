# Automate all data to the dashboard

So the Empire dashboard always has fresh data without running things by hand:

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

**Manual run (no schedule):**

```powershell
cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
node bin/empire.js run leads --all
```

Then refresh the dashboard to see the new row.
