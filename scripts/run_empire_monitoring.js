/**
 * Phase 10 — Monitoring & Alerts
 * Run periodically (e.g. every 15 min). Checks four conditions and logs to empire_reports (severity: error).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env (and .env in empire root).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMPIRE_ROOT = process.env.EMPIRE_ROOT || join(__dirname, '..');
const KHAMARECLAKE_ENV_DIR = join(EMPIRE_ROOT, '..', 'khamareclarke.com-main');
const STATE_DIR = join(EMPIRE_ROOT, '.monitoring');
const DB_FAIL_STATE = join(STATE_DIR, 'db_fail_state.json');

function loadEnv() {
  const paths = [
    join(KHAMARECLAKE_ENV_DIR, '.env.local'),
    join(KHAMARECLAKE_ENV_DIR, '.env'),
    join(EMPIRE_ROOT, '.env')
  ];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      readFileSync(p, 'utf8').split(/\r?\n/).forEach(line => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim();
      });
    } catch (_) {}
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function pushAlert(report) {
  const { error } = await supabase.from('empire_reports').insert({
    project_id: 'empire',
    report_type: report.report_type ?? 'monitoring',
    severity: 'error',
    title: report.title,
    body: report.body ?? null,
    payload: report.payload ?? {}
  });
  if (error) console.error('pushAlert error:', error);
  return error;
}

async function checkNoLeads48h() {
  const { data, error } = await supabase.from('empire_leads').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return;
  const last = data?.created_at ? new Date(data.created_at) : null;
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  if (last && last < cutoff) {
    await pushAlert({ title: 'No leads for 48 hours', body: `Last lead: ${last.toISOString()}`, report_type: 'monitoring', payload: { last_lead_at: last.toISOString() } });
    console.log('[Monitor] Alert: no leads 48h');
  }
}

async function checkCronFailsTwice() {
  const { data, error } = await supabase.from('empire_reports').select('id, severity, created_at').eq('report_type', 'cron').order('created_at', { ascending: false }).limit(2);
  if (error || !data || data.length < 2) return;
  const bothError = data.every(r => r.severity === 'error');
  if (bothError) {
    await pushAlert({ title: 'Cron failed twice consecutively', body: `Last two cron runs reported errors.`, report_type: 'monitoring', payload: { last_two: data } });
    console.log('[Monitor] Alert: cron failed twice');
  }
}

async function checkDbReachable() {
  try {
    const { error } = await supabase.from('empire_reports').select('id').limit(1);
    if (error) throw new Error(error.message);
    const statePath = DB_FAIL_STATE;
    if (!existsSync(statePath)) return;
    const raw = readFileSync(statePath, 'utf8');
    const state = raw ? JSON.parse(raw) : {};
    const failCount = state.count ?? 0;
    const firstFail = state.firstFailAt ? new Date(state.firstFailAt) : null;
    const fiveMin = 5 * 60 * 1000;
    if (failCount >= 1 && firstFail && (Date.now() - firstFail.getTime()) >= fiveMin) {
      await pushAlert({ title: 'DB was unreachable for > 5 minutes', body: `Recovered after ${failCount} consecutive failures.`, report_type: 'monitoring', payload: { firstFailAt: state.firstFailAt, count: failCount } });
      console.log('[Monitor] Alert: DB was unreachable >5min');
    }
    writeFileSync(statePath, '{}');
  } catch (_) {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    const statePath = DB_FAIL_STATE;
    let state = { count: 0, firstFailAt: null };
    if (existsSync(statePath)) try { state = JSON.parse(readFileSync(statePath, 'utf8')); } catch (_) {}
    state.count = (state.count || 0) + 1;
    if (!state.firstFailAt) state.firstFailAt = new Date().toISOString();
    writeFileSync(statePath, JSON.stringify(state));
  }
}

async function checkAgentSuccessRate() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: fin } = await supabase.from('empire_agent_activity').select('*', { count: 'exact', head: true }).eq('status', 'finished').gte('started_at', since);
  const { count: fail } = await supabase.from('empire_agent_activity').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('started_at', since);
  const total = (fin ?? 0) + (fail ?? 0);
  if (total < 10) return;
  const rate = (fin ?? 0) / total;
  if (rate < 0.8) {
    await pushAlert({ title: 'Agent success rate < 80%', body: `Last 24h: ${(rate * 100).toFixed(1)}% (${fin ?? 0} finished, ${fail ?? 0} failed).`, report_type: 'monitoring', payload: { finished: fin ?? 0, failed: fail ?? 0, rate } });
    console.log('[Monitor] Alert: agent success rate < 80%');
  }
}

async function main() {
  await checkDbReachable();
  await checkNoLeads48h();
  await checkCronFailsTwice();
  await checkAgentSuccessRate();
}

main().catch(e => { console.error(e); process.exit(1); });
