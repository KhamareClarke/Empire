/**
 * Verification Protocol Step 2 — Push 1 test lead per repo (8 leads).
 * Run from empire root: node scripts/verification/step2-push-8-leads.js
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

const { pushLead } = await import('../../shared/empire-bridge/index.js');

let pushed = 0;
for (const repo of repos) {
  process.env.EMPIRE_PROJECT_NAME = repo.id;
  const { error } = await pushLead({
    source: 'verification-step2',
    email: 'test-' + repo.id + '@verification.local',
    name: 'Test Lead ' + repo.name,
    payload: { step: 2, repo: repo.id, at: new Date().toISOString() }
  });
  if (error) {
    console.error('FAIL ' + repo.id + ':', error.message);
  } else {
    pushed++;
    console.log('OK ' + repo.id);
  }
}
console.log('Step 2 done: ' + pushed + '/' + repos.length + ' leads pushed. Take screenshot of empire_leads in Supabase.');
process.exit(pushed === repos.length ? 0 : 1);
