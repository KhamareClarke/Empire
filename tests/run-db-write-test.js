/**
 * Phase 11 — Test 1: DB write test (service role)
 * Run from empire folder: node tests/run-db-write-test.js
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const khamareclarkeDir = join(root, '..', 'khamareclarke.com-main');
const paths = [join(khamareclarkeDir, '.env.local'), join(khamareclarkeDir, '.env'), join(root, '.env')];
for (const envPath of paths) {
  if (!existsSync(envPath)) continue;
  try {
    readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
    break;
  } catch (_) {}
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const project = 'test-project';
  const { data: lead, error: e1 } = await supabase.from('empire_leads').insert({ project_id: project, source: 'test' }).select('id').single();
  const { data: report, error: e2 } = await supabase.from('empire_reports').insert({ project_id: project, report_type: 'test', severity: 'info', title: 'DB write test' }).select('id').single();
  const { data: act, error: e3 } = await supabase.from('empire_agent_activity').insert({ project_id: project, agent_id: 'test-agent', action: 'run', status: 'started' }).select('id').single();

  if (e1 || e2 || e3) {
    console.error('DB write test FAILED:', e1 || e2 || e3);
    process.exit(1);
  }
  console.log('DB write test PASSED:', { lead: lead?.id, report: report?.id, activity: act?.id });
}

main();
