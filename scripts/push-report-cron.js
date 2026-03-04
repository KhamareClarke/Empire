/**
 * Push a cron failure to empire_reports. Call from runner scripts on non-zero exit.
 * Usage: node scripts/push-report-cron.js "run_empire_leads failed" "stderr or details"
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pushReport } from '../shared/empire-bridge/index.js';

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
process.env.EMPIRE_PROJECT_NAME = process.env.EMPIRE_PROJECT_NAME || 'empire';

const title = process.argv[2] || 'Cron run failed';
const body = process.argv[3] || null;

const { error } = await pushReport({
  report_type: 'cron',
  severity: 'error',
  title,
  body,
  payload: { runner: title }
});
if (error) {
  console.error('pushReport error:', error);
  process.exit(1);
}
