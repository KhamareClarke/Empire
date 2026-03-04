# Empire OS — 24-Hour Burn-In Report

**Burn-in window:** From _______________ to _______________ (24 hours).

**Completed by:** _______________  
**Date:** _______________

---

## At end of 24 hours — capture

### Total leads generated per repo
- khamareclarke: _____
- omniwtms: _____
- myapproved: _____
- adstarter: _____
- seoinforce: _____
- identitymarketing: _____
- leveragejournal: _____
- leverageacademy: _____

### Total agent executions
- empire_agent_activity rows in last 24h: _______________

### Error rate
- empire_reports severity=error in last 24h: _______________
- Error rate %: _______________

### System health summary
- Crashes: Yes / No
- Silent failures: Yes / No
- Repos dropped out: _______________
- Dashboard matched DB: Yes / No

### Last cron execution timestamps
- Empire-Leads: _______________
- Empire-SEO: _______________
- Empire-Health: _______________
- Empire-Monitoring: _______________

---

## Burn-in result
- [ ] PASS — No crash, silent failure, or data inconsistency.
- [ ] FAIL — (Describe): _______________

---
Run `node scripts/verification/burn-in-summary.js` (env set) to pre-fill counts from Supabase.
