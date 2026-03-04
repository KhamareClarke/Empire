/**
 * Run verification Steps 1–4 in order. Uses EMPIRE_ROOT and loads env from KhamareClarke + empire.
 * Usage: node scripts/verification/run-all.js
 * Or with explicit URL/key: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/verification/run-all.js
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

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

const steps = [
  { name: 'Step 1 — System recognition', cmd: [join(EMPIRE_ROOT, 'bin', 'empire.js'), 'status'], screenshot: 'Terminal: 8 repos, all OK' },
  { name: 'Step 2 — 8 test leads', cmd: [join(EMPIRE_ROOT, 'scripts', 'verification', 'step2-push-8-leads.js')], screenshot: 'Supabase empire_leads: 8 new rows' },
  { name: 'Step 3 — Agent activity', cmd: [join(EMPIRE_ROOT, 'scripts', 'verification', 'step3-log-8-agents.js')], screenshot: 'Supabase empire_agent_activity' },
  { name: 'Step 4 — Failure simulation', cmd: [join(EMPIRE_ROOT, 'scripts', 'verification', 'step4-failure-simulation.js'), '--break-repo=omniwtms'], screenshot: 'empire_agent_activity (1 failed) + empire_reports (1 error)' }
];

console.log('EMPIRE_ROOT:', EMPIRE_ROOT);
console.log('KHAMARECLAKE_ENV_DIR:', KHAMARECLAKE_ENV_DIR);
console.log('SUPABASE_URL set:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY set:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('');

let failed = 0;
for (const step of steps) {
  console.log('---', step.name, '---');
  const r = spawnSync(process.execPath, step.cmd, {
    cwd: EMPIRE_ROOT,
    env: { ...process.env, EMPIRE_ROOT },
    encoding: 'utf8',
    timeout: 30000
  });
  if (r.stdout) console.log(r.stdout);
  if (r.stderr) console.error(r.stderr);
  if (r.status !== 0) {
    console.error('FAIL:', step.name);
    failed++;
  } else {
    console.log('PASS:', step.name);
    console.log('Screenshot:', step.screenshot);
  }
  console.log('');
}

console.log('--- Result ---');
console.log(failed === 0 ? 'All 4 steps passed. Capture screenshots per instructions above.' : failed + ' step(s) failed.');
process.exit(failed > 0 ? 1 : 0);
