/**
 * Empire Bridge — shared module for all 8 repos.
 * Use Supabase service role client server-side only for inserts.
 * No duplicate DB logic; all repos must use this module.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getProjectId() {
  return process.env.EMPIRE_PROJECT_NAME || 'unknown';
}

function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Empire Bridge: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

/**
 * Push a lead to central empire_leads table.
 * @param {Object} lead - { source?, email?, name?, payload? }
 * @returns {Promise<{ data?, error? }>}
 */
export async function pushLead(lead = {}) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('empire_leads')
    .insert({
      project_id: getProjectId(),
      source: lead.source ?? null,
      email: lead.email ?? null,
      name: lead.name ?? null,
      payload: lead.payload ?? {},
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();
  return { data, error };
}

/**
 * Push a report or failure to empire_reports.
 * @param {Object} report - { report_type, severity?, title?, body?, payload? }
 * @param {string} report.report_type - e.g. 'cron', 'agent', 'health'
 * @param {string} report.severity - 'info' | 'warning' | 'error'
 */
export async function pushReport(report = {}) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('empire_reports')
    .insert({
      project_id: getProjectId(),
      report_type: report.report_type ?? 'agent',
      severity: report.severity ?? 'info',
      title: report.title ?? null,
      body: report.body ?? null,
      payload: report.payload ?? {}
    })
    .select('id')
    .single();
  return { data, error };
}

/**
 * Log agent activity (start/finish/fail). Each agent must log start and finish.
 * @param {Object} activity - { agent_id, action, status?, payload?, error_message? }
 * @param {string} activity.agent_id - e.g. 'seo-audit', 'copywriting'
 * @param {string} activity.action - e.g. 'run', 'audit'
 * @param {string} activity.status - 'started' | 'finished' | 'failed'
 */
export async function logAgentActivity(activity = {}) {
  const supabase = getServiceClient();
  const row = {
    project_id: getProjectId(),
    agent_id: activity.agent_id ?? 'unknown',
    action: activity.action ?? 'run',
    status: activity.status ?? 'started',
    payload: activity.payload ?? {},
    error_message: activity.error_message ?? null
  };
  if (activity.status === 'finished' || activity.status === 'failed') {
    row.finished_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('empire_agent_activity')
    .insert(row)
    .select('id')
    .single();
  return { data, error };
}

export { runWithContract } from './contract-helper.js';
export default { pushLead, pushReport, logAgentActivity };
