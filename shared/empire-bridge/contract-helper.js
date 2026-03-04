/**
 * Empire Agent Contract helper (Phase 8).
 * Wraps an agent run: logs start/finish, pushes leads/reports from result, logs failures.
 * Use this so every agent satisfies the contract with no silent execution.
 */
import { logAgentActivity, pushLead, pushReport } from './index.js';

/**
 * Run an agent with the full contract: log start, run fn, log finish or failure, push leads/reports.
 * @param {Object} opts - { agent_id, action?, project_id? }
 * @param {Function} fn - async () => ({ leads?: [], reports?: [], payload? }) or throw
 * @returns {Promise<{ success: boolean, output?: object, error?: Error }>}
 */
export async function runWithContract(opts, fn) {
  const agent_id = opts.agent_id ?? 'unknown';
  const action = opts.action ?? 'run';

  try {
    await logAgentActivity({ agent_id, action, status: 'started' });
  } catch (e) {
    console.error('[Empire] Failed to log start:', e);
  }

  try {
    const result = await fn();
    const leads = result?.leads ?? [];
    const reports = result?.reports ?? [];

    for (const lead of leads) {
      try { await pushLead(lead); } catch (e) { console.error('[Empire] pushLead:', e); }
    }
    for (const report of reports) {
      try { await pushReport(report); } catch (e) { console.error('[Empire] pushReport:', e); }
    }

    await logAgentActivity({ agent_id, action, status: 'finished', payload: result?.payload });
    return { success: true, output: result };
  } catch (err) {
    try {
      await logAgentActivity({ agent_id, action, status: 'failed', error_message: err?.message });
      await pushReport({
        report_type: 'agent',
        severity: 'error',
        title: `${agent_id} failed`,
        body: err?.message ?? String(err),
        payload: { agent_id, action }
      });
    } catch (e) {
      console.error('[Empire] Failed to log failure:', e);
    }
    return { success: false, error: err };
  }
}
