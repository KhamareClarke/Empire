/**
 * Empire OS — Run a job (leads, seo, health, weekly-report). Pushes data to Supabase via bridge.
 * Called by run_empire_*.sh / .ps1. Loads env from KhamareClarke then empire.
 */
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
}
loadEnv();

const jobType = process.argv[2] || 'leads';
const configPath = join(EMPIRE_ROOT, 'empire.config.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : { repos: [] };
const repos = config.repos || [];

async function run() {
  process.env.EMPIRE_PROJECT_NAME = 'empire';
  const { pushLead, pushReport, logAgentActivity } = await import('../shared/empire-bridge/index.js');

  const agentId = `empire-${jobType}`;
  await logAgentActivity({ agent_id: agentId, action: 'run', status: 'started', payload: { job: jobType } });

  let ok = true;
  if (jobType === 'leads') {
    const { error } = await pushLead({
      source: 'empire-scheduled',
      email: null,
      name: null,
      payload: { job: 'leads', at: new Date().toISOString(), repos: repos.length }
    });
    if (error) { console.error('pushLead error:', error); ok = false; }
  }

  await pushReport({
    report_type: jobType,
    severity: 'info',
    title: `Empire ${jobType} run`,
    body: `Completed at ${new Date().toISOString()}. Repos: ${repos.length}.`,
    payload: { job: jobType }
  });

  await logAgentActivity({ agent_id: agentId, action: 'run', status: ok ? 'finished' : 'failed', payload: { job: jobType } });
  console.log(`[empire] ${jobType} run done.`);
}

run().catch(e => { console.error(e); process.exit(1); });
