/**
 * Populate dashboard with complete info for all 8 projects (real project names).
 * Run from empire root: node scripts/populate-dashboard-all-8-projects.js
 * Optionally clears existing data first so dashboard shows only these 8 projects.
 *
 * What you see on dashboard after:
 * - Leads by project: khamareclarke, omniwtms, myapproved, adstarter, seoinforce, identitymarketing, leveragejournal, leverageacademy (1 lead each)
 * - Agent activity: each project with verification-step3-agent and step4 (one failure: omniwtms)
 * - No "empire-phase11-test" or "empire" test placeholders from Phase 11 / cron
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMPIRE_ROOT = process.env.EMPIRE_ROOT || join(__dirname, '..');
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
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const clearFirst = process.argv.includes('--clear');

async function clear() {
  console.log('Clearing existing data...');
  for (const table of ['empire_agent_activity', 'empire_reports', 'empire_leads']) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(table, error.message);
  }
  console.log('Done.\n');
}

async function main() {
  if (clearFirst) await clear();

  console.log('Running verification: 8 leads + 8 agent activities + 1 failure simulation...\n');
  const { spawnSync } = await import('child_process');
  const run = (script, ...args) => {
    const r = spawnSync(process.execPath, [join(EMPIRE_ROOT, 'scripts', 'verification', script), ...args], {
      cwd: EMPIRE_ROOT,
      env: { ...process.env, EMPIRE_ROOT },
      encoding: 'utf8',
      timeout: 60000
    });
    if (r.stdout) console.log(r.stdout);
    if (r.stderr) console.error(r.stderr);
    return r.status;
  };

  if (run('step2-push-8-leads.js') !== 0) { console.error('Step 2 failed'); process.exit(1); }
  if (run('step3-log-8-agents.js') !== 0) { console.error('Step 3 failed'); process.exit(1); }
  if (run('step4-failure-simulation.js', '--break-repo=omniwtms') !== 0) { console.error('Step 4 failed'); process.exit(1); }

  console.log('\nDashboard will show all 8 projects: khamareclarke, omniwtms, myapproved, adstarter, seoinforce, identitymarketing, leveragejournal, leverageacademy.');
  console.log('Refresh: https://www.khamareclarke.com/dashboard/empire');
}

main().catch(e => { console.error(e); process.exit(1); });
