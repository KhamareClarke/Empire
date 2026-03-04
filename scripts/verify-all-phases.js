#!/usr/bin/env node
/**
 * Empire OS — Verify all phases achieved
 * Run from empire root: node scripts/verify-all-phases.js
 * Optional: set env (e.g. from khamareclarke.com-main/.env.local) to include Phase 4+11 live checks.
 */
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

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
      break;
    } catch (_) {}
  }
}
loadEnv();

const results = [];

function ok(phase, message) {
  results.push({ phase, status: 'OK', message });
  return true;
}
function fail(phase, message) {
  results.push({ phase, status: 'FAIL', message });
  return false;
}
function skip(phase, message) {
  results.push({ phase, status: 'SKIP', message });
  return false;
}

// Phase 0–2: Global skills
function checkPhase0_2() {
  const configPath = join(EMPIRE_ROOT, 'empire.config.json');
  if (!existsSync(configPath)) return fail('0–2', 'empire.config.json missing');
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (_) {
    return fail('0–2', 'empire.config.json invalid');
  }
  const globalPath = (config.globalSkillsPath || '~/.khamare-clarke/global-skills').replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
  if (!existsSync(globalPath)) return fail('0–2', 'Global skills path missing: ' + globalPath);
  const repos = config.repos || [];
  if (repos.length === 0) return fail('0–2', 'No repos in config');
  const firstRepoPath = join(EMPIRE_ROOT, repos[0].path);
  const skillsLink = join(firstRepoPath, '.agents', 'skills');
  if (!existsSync(firstRepoPath)) return skip('0–2', 'First repo path missing (junctions?)');
  if (!existsSync(skillsLink) && !existsSync(join(firstRepoPath, '.agents'))) return fail('0–2', 'No .agents/skills in first repo');
  return ok('0–2', 'Global skills + repo structure');
}

// Phase 1: Orchestration
function checkPhase1() {
  const bin = join(EMPIRE_ROOT, 'bin', 'empire.js');
  if (!existsSync(bin)) return fail('1', 'bin/empire.js missing');
  const res = spawnSync(process.execPath, [bin, 'status'], { cwd: EMPIRE_ROOT, env: { ...process.env, EMPIRE_ROOT }, encoding: 'utf8', timeout: 10000 });
  if (res.status !== 0) return fail('1', 'empire status exited ' + res.status);
  return ok('1', 'Orchestration (empire status)');
}

// Phase 3: Multi-repo config
function checkPhase3() {
  const configPath = join(EMPIRE_ROOT, 'empire.config.json');
  if (!existsSync(configPath)) return fail('3', 'empire.config.json missing');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const repos = config.repos || [];
  const n = repos.length;
  if (n < 8) return fail('3', 'Expected 8 repos, found ' + n);
  return ok('3', n + ' repos in empire.config.json');
}

// Phase 4: Supabase tables (live DB) — verified via Phase 11 test 1
async function checkPhase4() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return skip('4', 'Set SUPABASE_* to verify tables (or run npm test)');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('empire_leads').select('id').limit(1);
  if (error) return fail('4', 'empire_leads unreachable: ' + error.message);
  return ok('4', 'Supabase tables reachable');
}

// Phase 5: Env
function checkPhase5() {
  const hasUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const hasKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (hasUrl && hasKey) return ok('5', 'Env vars set (Supabase)');
  const empireEnv = join(EMPIRE_ROOT, '.env');
  const kcEnv = join(KHAMARECLAKE_ENV_DIR, '.env.local');
  if (existsSync(empireEnv) || existsSync(kcEnv)) return fail('5', 'Env files exist but SUPABASE_URL/SERVICE_ROLE_KEY empty');
  return skip('5', 'No .env found; copy .env.example and set Supabase keys');
}

// Phase 6: Bridge
function checkPhase6() {
  const bridgeIndex = join(EMPIRE_ROOT, 'shared', 'empire-bridge', 'index.js');
  if (!existsSync(bridgeIndex)) return fail('6', 'shared/empire-bridge/index.js missing');
  const content = readFileSync(bridgeIndex, 'utf8');
  if (!content.includes('pushLead') || !content.includes('pushReport') || !content.includes('logAgentActivity')) return fail('6', 'Bridge missing pushLead/pushReport/logAgentActivity');
  return ok('6', 'Shared empire-bridge');
}

// Phase 7: Dashboard
function checkPhase7() {
  const dashPaths = [
    join(EMPIRE_ROOT, 'khamareclarke.com', 'src', 'app', 'dashboard', 'empire', 'page.jsx'),
    join(EMPIRE_ROOT, '..', 'khamareclarke.com-main', 'src', 'app', 'dashboard', 'empire', 'page.jsx')
  ];
  const found = dashPaths.find(p => existsSync(p));
  if (!found) return fail('7', 'Dashboard page not found (dashboard/empire)');
  return ok('7', 'Dashboard route present');
}

// Phase 8: Agent contract
function checkPhase8() {
  const schema = join(EMPIRE_ROOT, 'shared', 'empire-bridge', 'agent-contract.schema.json');
  const helper = join(EMPIRE_ROOT, 'shared', 'empire-bridge', 'contract-helper.js');
  if (!existsSync(schema)) return fail('8', 'agent-contract.schema.json missing');
  if (!existsSync(helper)) return fail('8', 'contract-helper.js missing');
  return ok('8', 'Agent contract + runWithContract');
}

// Phase 9: Scheduling
function checkPhase9() {
  const runners = ['run_empire_leads.sh', 'run_empire_seo.sh', 'run_empire_health.sh', 'run_empire_weekly_report.sh'];
  const missing = runners.filter(r => !existsSync(join(EMPIRE_ROOT, r)));
  if (missing.length) return fail('9', 'Missing runners: ' + missing.join(', '));
  return ok('9', '4 runner scripts present');
}

// Phase 10: Monitoring
function checkPhase10() {
  const monitor = join(EMPIRE_ROOT, 'scripts', 'run_empire_monitoring.js');
  const cronReport = join(EMPIRE_ROOT, 'scripts', 'push-report-cron.js');
  if (!existsSync(monitor)) return fail('10', 'run_empire_monitoring.js missing');
  if (!existsSync(cronReport)) return fail('10', 'push-report-cron.js missing');
  return ok('10', 'Monitoring + cron report scripts');
}

// Phase 11: Testing
function checkPhase11() {
  const testPath = join(EMPIRE_ROOT, 'tests', 'run-phase11-order.js');
  if (!existsSync(testPath)) return fail('11', 'tests/run-phase11-order.js missing');
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return skip('11', 'Set SUPABASE_* then run: npm test');
  const res = spawnSync(process.execPath, [testPath], { cwd: EMPIRE_ROOT, env: { ...process.env, EMPIRE_ROOT }, encoding: 'utf8', timeout: 60000 });
  if (res.status !== 0) return fail('11', 'npm test failed (run: npm test)');
  return ok('11', 'All 6 tests passed');
}

async function main() {
  console.log('Empire OS — Phase verification\n');

  checkPhase0_2();
  checkPhase1();
  checkPhase3();
  await checkPhase4();
  checkPhase5();
  checkPhase6();
  checkPhase7();
  checkPhase8();
  checkPhase9();
  checkPhase10();
  checkPhase11();

  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad('Phase', 8) + pad('Status', 8) + 'Detail');
  console.log('-'.repeat(60));
  for (const { phase, status, message } of results) {
    const icon = status === 'OK' ? '\u2713' : status === 'FAIL' ? '\u2717' : '?';
    console.log(pad(phase, 8) + pad(icon + ' ' + status, 8) + message);
  }

  const okCount = results.filter(r => r.status === 'OK').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const skipCount = results.filter(r => r.status === 'SKIP').length;

  console.log('\n' + '-'.repeat(60));
  console.log('Summary: ' + okCount + ' OK, ' + failCount + ' FAIL, ' + skipCount + ' SKIP');
  if (failCount > 0) {
    console.log('\nNot all phases achieved. Fix FAIL items, then run again.');
    process.exit(1);
  }
  if (skipCount > 0) {
    console.log('\nAll structural phases OK. Set Supabase env and run "npm test" to clear SKIP for Phase 4 & 11.');
  } else {
    console.log('\nAll phases achieved. Empire OS operational.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
