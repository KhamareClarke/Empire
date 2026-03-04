# Phase 6 — Shared Empire Bridge module

## Requirement

- Shared module at **/empire/shared/empire-bridge/**
- Functions: **pushLead()**, **pushReport()**, **logAgentActivity()**
- **All repos must use this module.** No duplicate DB logic allowed.

---

## Module location

```
/empire/shared/empire-bridge/
  index.js      # pushLead, pushReport, logAgentActivity
  package.json  # @empire/bridge, peer: @supabase/supabase-js
  README.md
```

---

## Functions

| Function | Table | Use |
|----------|--------|-----|
| **pushLead(lead)** | empire_leads | When a lead is captured (form, signup, etc.) |
| **pushReport(report)** | empire_reports | Reports, failures, cron results |
| **logAgentActivity(activity)** | empire_agent_activity | Agent start/finish/fail (required per agent contract) |

All use the **service role** client (server-side only). Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMPIRE_PROJECT_NAME`.

---

## All repos must use this module

- Do **not** reimplement Supabase inserts for empire_leads, empire_reports, or empire_agent_activity in any repo.
- Import from `@empire/bridge` (add dependency below) and call the three functions only.

### Add dependency (repos under /empire)

In each repo’s `package.json`:

```json
"dependencies": {
  "@empire/bridge": "file:../shared/empire-bridge"
}
```

Run `npm install` from the repo. Then in server-side code (API routes, cron, scripts):

```js
import { pushLead, pushReport, logAgentActivity } from '@empire/bridge';
```

---

## Status

- **Module:** Implemented at `empire/shared/empire-bridge/` with pushLead, pushReport, logAgentActivity.
- **Dependency:** Added `"@empire/bridge": "file:../shared/empire-bridge"` to all 8 repos’ package.json. Run `npm install` from each repo (or from /empire when using the junctions). Use only these three functions for central DB writes — no duplicate DB logic in any repo.
