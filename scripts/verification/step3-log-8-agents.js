/**
 * Verification Protocol Step 3 — Log 1 agent activity per repo (8 entries, all success).
 * Run from empire root: node scripts/verification/step3-log-8-agents.js
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

const configPath = join(EMPIRE_ROOT, 'empire.config.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : { repos: [] };
const repos = config.repos || [];

const { logAgentActivity } = await import('../../shared/empire-bridge/index.js');

const agentId = 'Leads sync';
let logged = 0;
for (const repo of repos) {
  process.env.EMPIRE_PROJECT_NAME = repo.id;
  const { error: e1 } = await logAgentActivity({ agent_id: agentId, action: 'sync', status: 'started', payload: { project: repo.id } });
  const { error: e2 } = await logAgentActivity({ agent_id: agentId, action: 'sync', status: 'finished', payload: { project: repo.id } });
  if (e1 || e2) {
    console.error('FAIL ' + repo.id + ':', (e1 || e2).message);
  } else {
    logged++;
    console.log('OK ' + repo.id);
  }
}
console.log('Step 3 done: ' + logged + '/' + repos.length + ' agent activities. Screenshot empire_agent_activity.');
process.exit(logged === repos.length ? 0 : 1);
