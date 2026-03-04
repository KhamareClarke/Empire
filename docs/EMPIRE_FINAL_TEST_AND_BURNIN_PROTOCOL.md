# EMPIRE FINAL TEST & 24-HOUR BURN-IN PROTOCOL v1.0

**Purpose:** To fully confirm that the Empire OS infrastructure is not only completed but stable, resilient, and production-ready under real conditions.

**Completion is NOT acceptance. Verification + Burn-In = Acceptance.**

---

## PHASE 1 — IMMEDIATE VERIFICATION (EVIDENCE REQUIRED)

### 1. Orchestration Status Test
- Confirm all 8 repositories are active.
- No inactive repos.
- No configuration errors.  
**Evidence:** Screenshot of status output.

**Run:** `node bin/empire.js status` from empire root.

---

### 2. Database Lead Test
- Insert 1 test lead per repo.
- Confirm 8 new rows in `empire_leads`.  
**Evidence:** Screenshot of Supabase table.

**Run:** `node scripts/verification/step2-push-8-leads.js`

---

### 3. Agent Activity Test
- Run 1 agent across all repos.
- Confirm 8 entries in `empire_agent_activity`.  
**Evidence:** Screenshot of activity logs.

**Run:** `node scripts/verification/step3-log-8-agents.js`

---

### 4. Dashboard Validation
- Confirm dashboard numbers match database counts.
- Confirm filtering works.  
**Evidence:** Screenshot comparison (dashboard vs Supabase counts).

**Run:** Open KhamareClarke.com → `/dashboard/empire`; compare with Supabase Table Editor row counts.

---

### 5. Failure Simulation
- Break one repo environment variable (or use simulated failure).
- Run system.  
**Expected:** That repo logs failure; other repos continue; failure visible in dashboard.  
**Evidence:** Screenshot of error log + successful runs for others.

**Run:** `node scripts/verification/step4-failure-simulation.js --break-repo=omniwtms`

---

### 6. RLS Security Test
- Admin can read.
- Non-admin cannot read.  
**Evidence:** Screenshot showing restricted access.

**Run:** With anon-only read: N/A (all can read). With admin RLS: sign in as admin vs non-admin and screenshot dashboard/API response.

---

### 7. Cron Verification
- Confirm cron jobs are listed.
- Confirm timestamps update.  
**Evidence:** Screenshot of crontab (or Task Scheduler) + logs.

**Run:** Windows: Task Scheduler → Empire-* tasks; run one script manually, then check “Last Run” time.

---

## PHASE 2 — 24-HOUR BURN-IN TEST (MANDATORY)

**Purpose:** To confirm system stability over time, not just one execution.

**Instructions:**
- Do **NOT** manually trigger jobs during this period.
- Let automation run naturally for 24 hours.

**During 24 hours verify:**
1. Leads are generated automatically.
2. Agent logs populate consistently.
3. No silent failures occur.
4. No repo drops out of execution.
5. Cron executes at scheduled times.
6. Dashboard reflects real-time updates.
7. No unhandled errors accumulate.
8. Alerts trigger properly if thresholds breached.

**At the end of 24 hours, capture:**
- Total leads generated per repo.
- Total agent executions.
- Error rate percentage.
- System health summary.
- Timestamp of last cron execution.

**If system runs 24 hours without crash, silent failure, or data inconsistency → Burn-In Passed.**

Use the burn-in report template: `scripts/verification/burn-in-report-template.md` (fill after 24h). Optional: run `node scripts/verification/burn-in-summary.js` to query Supabase and pre-fill counts (if env is set).

---

## FINAL ACCEPTANCE CHECKLIST

- [ ] 8 repos active
- [ ] 8 test leads verified
- [ ] Agent logging confirmed
- [ ] Dashboard accurate
- [ ] Failure handling proven
- [ ] RLS secure
- [ ] Cron running
- [ ] Alerts functional
- [ ] 24-hour burn-in passed

**Only after all boxes are checked → System Approved.**

---

## WHAT HAPPENS NEXT AFTER CONFIRMATION

Once system passes verification and burn-in:

1. **Implement Agent Performance Scoring**
   - Track ROI per agent.
   - Track success rate per agent.
   - Track execution time trends.

2. **Implement Auto-Disable Threshold**
   - Automatically disable agents with failure rate above defined threshold.

3. **Implement Weekly Performance Report**
   - Revenue potential.
   - Conversion rate.
   - SEO improvements.
   - System uptime percentage.

4. **Implement Audit Logging Archive**
   - Store historical weekly reports.
   - Enable long-term analytics.

5. **Introduce Staging Environment**
   - Separate staging from production.
   - Test new agents before deployment.

6. **Introduce Versioned Agent Registry**
   - Version control for agent behaviors.
   - Controlled upgrades.

7. **Stress Test Under Load**
   - Simulate 10x normal activity.
   - Confirm system resilience.

---

*Operational systems survive time, failure, scale, and human error.*

*End of Document.*
