/**
 * Empire OS — 24-hour burn-in summary (query Supabase for counts).
 * Run from empire root with env set: node scripts/verification/burn-in-summary.js
 * Use output to fill burn-in-report-template.md.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMPIRE_ROOT = process.env.EMPIRE_ROOT || join(__dirname, '..', '..');
const KHAMARECLAKE_ENV_DIR = join(EMPIRE_ROOT, '..', 'khamareclarke.com-main');

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
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}
loadEnv();

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in khamareclarke.com-main/.env.local).');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const now = new Date();
const since = new Date(now - 24 * 60 * 60 * 1000).toISOString();

async function main() {
  console.log('--- Empire 24-hour burn-in summary ---\n');
  console.log('Window: last 24 hours (since', since, ')\n');

  const { data: leadsByProject } = await supabase.from('empire_leads').select('project_id').gte('created_at', since);
  const byRepo = {};
  (leadsByProject || []).forEach(r => { byRepo[r.project_id] = (byRepo[r.project_id] || 0) + 1; });
  console.log('Leads per repo (last 24h):');
  Object.entries(byRepo).sort((a, b) => b[1] - a[1]).forEach(([repo, count]) => console.log('  ', repo, count));
  console.log('  Total leads:', (leadsByProject || []).length, '\n');

  const { count: activityCount } = await supabase.from('empire_agent_activity').select('*', { count: 'exact', head: true }).gte('started_at', since);
  console.log('Agent activity rows (last 24h):', activityCount ?? 0, '\n');

  const { count: errorCount } = await supabase.from('empire_reports').select('*', { count: 'exact', head: true }).eq('severity', 'error').gte('created_at', since);
  const totalReports = (await supabase.from('empire_reports').select('*', { count: 'exact', head: true }).gte('created_at', since)).count ?? 0;
  const errRate = activityCount ? ((errorCount ?? 0) / activityCount * 100).toFixed(2) : 'N/A';
  console.log('Errors (last 24h):', errorCount ?? 0);
  console.log('Error rate % (errors/activity):', errRate, '\n');

  const { data: lastReports } = await supabase.from('empire_reports').select('report_type, created_at').order('created_at', { ascending: false }).limit(10);
  console.log('Last 10 report timestamps (cron/job activity):');
  (lastReports || []).forEach(r => console.log('  ', r.report_type, r.created_at));

  console.log('\n--- Use this output to fill scripts/verification/burn-in-report-template.md ---');
}

main().catch(e => { console.error(e); process.exit(1); });
