/**
 * Verification Protocol Step 4 — Run 1 agent per repo; one repo simulated as broken (success = false, error_message).
 * Run from empire root: node scripts/verification/step4-failure-simulation.js [--break-repo=REPO_ID]
 * Default --break-repo=omniwtms if not provided.
 */
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
}
loadEnv();
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const breakRepo = process.argv.find(a => a.startsWith('--break-repo='))?.split('=')[1] || 'omniwtms';

const configPath = join(EMPIRE_ROOT, 'empire.config.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : { repos: [] };
const repos = config.repos || [];

const { logAgentActivity, pushReport } = await import('../../shared/empire-bridge/index.js');

const agentId = 'Health check';
let successCount = 0;
let failCount = 0;

const breakRepoName = repos.find(r => r.id === breakRepo)?.name || breakRepo;

for (const repo of repos) {
  process.env.EMPIRE_PROJECT_NAME = repo.id;
  const isBroken = repo.id === breakRepo;

  await logAgentActivity({ agent_id: agentId, action: 'run', status: 'started', payload: { project: repo.id } });

  if (isBroken) {
    const errMsg = 'Configuration error';
    await logAgentActivity({ agent_id: agentId, action: 'run', status: 'failed', error_message: errMsg, payload: { project: repo.id } });
    await pushReport({ report_type: 'health', severity: 'error', title: `${breakRepoName} — run failed`, body: errMsg, payload: { project: repo.id } });
    failCount++;
    console.log(`FAIL (simulated) ${repo.id}`);
  } else {
    await logAgentActivity({ agent_id: agentId, action: 'run', status: 'finished', payload: { project: repo.id } });
    successCount++;
    console.log(`OK ${repo.id}`);
  }
}

console.log(`Step 4 done: ${successCount} succeeded, ${failCount} failed (${breakRepo}). Screenshot empire_agent_activity + empire_reports.`);
process.exit(failCount === 1 && successCount === repos.length - 1 ? 0 : 1);
