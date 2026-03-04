# Phase 8 — Agent contract

## Rule: no silent execution

Every agent must satisfy the contract below. No agent may run without logging and, when applicable, pushing leads and reports.

---

## 1. Log start and finish

- **Start:** Before doing work, call `logAgentActivity({ agent_id, action, status: 'started' })`.
- **Finish:** After success, call `logAgentActivity({ agent_id, action, status: 'finished' })`. Optionally set `finished_at` via the bridge (it is set when status is `finished` or `failed`).

Use `@empire/bridge` → `logAgentActivity()`.

---

## 2. Push leads if applicable

If the agent produces or discovers a lead (e.g. form submission, signup, scraped contact), call:

`pushLead({ source?, email?, name?, payload? })`

Use `@empire/bridge` → `pushLead()`.

---

## 3. Push reports if applicable

If the agent produces a report (e.g. audit result, summary, cron outcome), call:

`pushReport({ report_type, severity?, title?, body?, payload? })`

Use `@empire/bridge` → `pushReport()`.

---

## 4. Log failures

On error or failure:

- Call `logAgentActivity({ agent_id, action, status: 'failed', error_message })`.
- Call `pushReport({ report_type: 'agent', severity: 'error', title?, body?, payload? })` so failures appear in the dashboard Failures view.

Use `@empire/bridge` → `logAgentActivity()` and `pushReport()`.

---

## 5. Follow strict JSON output schema

Agent output must conform to the **Empire Agent Contract** schema so it can be parsed and logged consistently.

- **Schema file:** `empire/shared/empire-bridge/agent-contract.schema.json`
- **Required fields:** `agent_id`, `status`, `timestamp`
- **Optional:** `action`, `project_id`, `leads[]`, `reports[]`, `error_message`, `payload`

Example minimal output:

```json
{
  "agent_id": "seo-audit",
  "action": "run",
  "status": "finished",
  "timestamp": "2026-02-25T12:00:00.000Z",
  "project_id": "omniwtms"
}
```

With leads/reports:

```json
{
  "agent_id": "copywriting",
  "status": "finished",
  "timestamp": "2026-02-25T12:00:00.000Z",
  "leads": [],
  "reports": [{ "report_type": "agent", "severity": "info", "title": "Copy run complete" }]
}
```

---

## Summary checklist (per agent run)

- [ ] `logAgentActivity(..., status: 'started')`
- [ ] If leads produced → `pushLead(...)` for each
- [ ] If reports produced → `pushReport(...)` for each
- [ ] On success → `logAgentActivity(..., status: 'finished')`
- [ ] On failure → `logAgentActivity(..., status: 'failed', error_message)` and `pushReport(..., severity: 'error')`
- [ ] Output conforms to `agent-contract.schema.json`

All via `@empire/bridge`; no silent execution.

---

## Optional: runWithContract helper

To satisfy the contract in one go, use the wrapper (server-side only):

```js
import { runWithContract } from '@empire/bridge/contract-helper.js';

const result = await runWithContract(
  { agent_id: 'seo-audit', action: 'run' },
  async () => {
    // do work
    return { leads: [], reports: [{ report_type: 'agent', severity: 'info', title: 'Done' }] };
  }
);
```

It logs start, runs your fn, pushes leads/reports from the return value, logs finish or (on throw) failure and pushes an error report.
