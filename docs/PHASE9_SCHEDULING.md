# Phase 9 — Scheduling

## Runner scripts (at /empire root)

| Script | Purpose |
|--------|---------|
| **run_empire_leads.sh** | Leads aggregation |
| **run_empire_seo.sh** | SEO run |
| **run_empire_health.sh** | Health check |
| **run_empire_weekly_report.sh** | Weekly report |

All four live at the **empire root** so cron can call `/empire/run_empire_*.sh`. They set `EMPIRE_ROOT` from the script directory if not set, load `.env`, and log start/finish. Wire the middle to your orchestration (e.g. `tool run …` or `node scripts/…`).

---

## Cron schedule

Use this when empire is at `/empire` (e.g. on a VPS):

```cron
0  9 * * * /empire/run_empire_leads.sh
0 13 * * * /empire/run_empire_seo.sh
0 18 * * * /empire/run_empire_health.sh
0 18 * * 0 /empire/run_empire_weekly_report.sh
```

- **0 9 * * *** — Daily at 09:00 — leads  
- **0 13 * * *** — Daily at 13:00 — SEO  
- **0 18 * * *** — Daily at 18:00 — health  
- **0 18 * * 0** — Sundays at 18:00 — weekly report  

To install: `crontab -e` and paste the four lines (adjust `/empire` if your path is different, or set `EMPIRE_ROOT` in crontab and use `$EMPIRE_ROOT/run_empire_leads.sh`).

---

## Windows (Task Scheduler)

Create one task per script. Example for leads (daily 09:00):

- **Program:** `powershell.exe`  
- **Arguments:** `-NoProfile -ExecutionPolicy Bypass -Command "& { Set-Location 'C:\Users\FC\Desktop\ALL PROJECTS\empire'; $env:EMPIRE_ROOT = (Get-Location).Path; & bash ./run_empire_leads.sh }"`  

If Bash isn’t available, use the PowerShell runners in `scripts/` (e.g. `run_empire_leads.ps1`) and point the task at that `.ps1` with the same working directory and `EMPIRE_ROOT`.

Repeat for the other three scripts and their times (13:00, 18:00, and Sunday 18:00 for weekly).

---

## Summary

- Runner scripts: **run_empire_leads.sh**, **run_empire_seo.sh**, **run_empire_health.sh**, **run_empire_weekly_report.sh** at empire root.  
- Cron: four lines as above.  
- Windows: Task Scheduler tasks for each script at the same times.
