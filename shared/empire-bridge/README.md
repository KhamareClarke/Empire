# @empire/bridge

Shared Empire OS module — **no duplicate DB logic**. All repos must use this module for central table writes.

## Functions

| Function | Purpose |
|----------|---------|
| **pushLead(lead)** | Insert into `empire_leads`. Lead: `{ source?, email?, name?, payload? }` |
| **pushReport(report)** | Insert into `empire_reports`. Report: `{ report_type, severity?, title?, body?, payload? }` |
| **logAgentActivity(activity)** | Insert into `empire_agent_activity`. Activity: `{ agent_id, action, status?, payload?, error_message? }` |

Use **server-side only** (Node, API routes, cron). Requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `EMPIRE_PROJECT_NAME` in env.

## Usage (ESM)

```js
import { pushLead, pushReport, logAgentActivity } from '@empire/bridge';
// Optional: wrap an agent run to satisfy the full contract (Phase 8)
import { runWithContract } from '@empire/bridge/contract-helper.js';

// When a lead is captured
await pushLead({ source: 'contact-form', email: 'u@example.com', name: 'User' });

// On failure or report
await pushReport({ report_type: 'agent', severity: 'error', title: 'Run failed', body: '...' });

// Agent contract: log start and finish
await logAgentActivity({ agent_id: 'seo-audit', action: 'run', status: 'started' });
// ... do work ...
await logAgentActivity({ agent_id: 'seo-audit', action: 'run', status: 'finished' });
```

## Dependency

From a repo under `/empire`, add to `package.json`:

```json
"dependencies": {
  "@empire/bridge": "file:../shared/empire-bridge"
}
```

Then `npm install`. Repos must have `@supabase/supabase-js` as well (peer dependency).
