/**
 * Delete all rows from empire_leads, empire_reports, empire_agent_activity (fresh start for dashboard).
 * Run from empire root with env set: node scripts/clear-empire-data.js
 * Requires service role (Supabase allows truncate with service role).
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

async function clear() {
  console.log('Clearing empire_leads, empire_reports, empire_agent_activity...');
  const tables = ['empire_agent_activity', 'empire_reports', 'empire_leads'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').select('id');
    if (error) {
      console.error(table, 'error:', error.message);
      console.log('Run in Supabase SQL Editor instead: TRUNCATE empire_agent_activity, empire_reports, empire_leads;');
      process.exit(1);
    }
  }
  console.log('Done. Dashboard will show only new data from scheduled jobs.');
}

clear();
