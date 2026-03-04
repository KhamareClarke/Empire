# Use Empire regularly, always

To use the Empire bridge, agents, and dashboard **regularly and always**:

---

## 1. Cursor rule (always on in this workspace)

A rule is in **`.cursor/rules/empire-always.mdc`** at the workspace root (ALL PROJECTS). It is set to **always apply**, so when you work in any project here, the AI will:

- Use `@empire/bridge` for leads, reports, and agent activity
- Follow the agent contract (log start/finish, push leads/reports, log failures)
- Avoid silent execution and duplicate DB logic

No extra step — it applies every time you’re in this workspace.

---

## 2. Scheduled runs (cron / Task Scheduler)

To run Empire jobs **regularly**, schedule the scripts under `empire/scripts/`:

| Schedule | Script | Purpose |
|----------|--------|---------|
| Daily 09:00 | `run_empire_leads.sh` or `run_empire_leads.ps1` | Leads |
| Daily 13:00 | `run_empire_seo.sh` | SEO |
| Daily 18:00 | `run_empire_health.sh` | Health |
| Sunday 18:00 | `run_empire_weekly_report.sh` | Weekly report |

### Windows (Task Scheduler)

1. Open **Task Scheduler** → Create Basic Task.
2. Trigger: Daily (or your preferred time).
3. Action: Start a program.
   - Program: `powershell.exe`
   - Arguments: `-NoProfile -ExecutionPolicy Bypass -File "C:\Users\FC\Desktop\ALL PROJECTS\empire\scripts\run_empire_leads.ps1"`
4. Repeat for each script and time (or use one task that runs a small launcher which runs all four on a schedule).

Set **EMPIRE_ROOT** in the task’s environment to `C:\Users\FC\Desktop\ALL PROJECTS\empire` if the scripts need it.

### Linux / VPS

```bash
# In crontab -e
0  9 * * * EMPIRE_ROOT=/empire /empire/scripts/run_empire_leads.sh
0 13 * * * EMPIRE_ROOT=/empire /empire/scripts/run_empire_seo.sh
0 18 * * * EMPIRE_ROOT=/empire /empire/scripts/run_empire_health.sh
0 18 * * 0 EMPIRE_ROOT=/empire /empire/scripts/run_empire_weekly_report.sh
```

---

## 3. Checklist

- [ ] Cursor rule **empire-always** is in `.cursor/rules/` with `alwaysApply: true` (done).
- [ ] Supabase central tables and env vars are set; dashboard works at `/dashboard/empire`.
- [ ] Cron or Task Scheduler runs the four scripts at the times above (or your chosen times).
- [ ] In code: use `@empire/bridge` and the agent contract (or `runWithContract`) so everything is logged and visible on the dashboard.

When these are in place, you use Empire **regularly** (scheduled jobs) and **always** (Cursor rule in this workspace).
