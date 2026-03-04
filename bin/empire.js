#!/usr/bin/env node
/**
 * Empire OS — Orchestration engine (Phase 1)
 * Install once: npm link (from empire folder) or npm install -g ./empire
 * Verify: empire --version | tool --version, empire help | tool help, empire status
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMPIRE_ROOT = process.env.EMPIRE_ROOT || resolve(__dirname, '..');

function loadConfig() {
  const p = join(EMPIRE_ROOT, 'empire.config.json');
  if (!existsSync(p)) throw new Error('empire.config.json not found. Set EMPIRE_ROOT or run from /empire.');
  return JSON.parse(readFileSync(p, 'utf8'));
}

function repoPath(repo) {
  return join(EMPIRE_ROOT, repo.path);
}

function checkAccess(repo) {
  const p = repoPath(repo);
  const hasDir = existsSync(p);
  const hasPkg = existsSync(join(p, 'package.json'));
  return { path: p, ok: hasDir, hasPackage: hasPkg };
}

const args = process.argv.slice(2);
const cmd = args[0];

if (args.includes('--version') || args.includes('-v') || cmd === 'version') {
  const pkg = JSON.parse(readFileSync(join(EMPIRE_ROOT, 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

if (!cmd || cmd === 'help' || args.includes('--help') || args.includes('-h')) {
  console.log(`
Empire OS — Orchestration engine
Usage: empire <command> [options]
       tool <command>   (if installed as 'tool')

Commands:
  status              Confirm access to all 8 repos from /empire
  run <job> --all     Run job (leads|seo|health|weekly-report), push data to Supabase
  version, --version  Show version
  help                Show this help

Environment:
  EMPIRE_ROOT         Root directory (default: parent of bin/)
`);
  process.exit(0);
}

if (cmd === 'status') {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  console.log('Empire root:', EMPIRE_ROOT);
  console.log('Repos:', config.repos.length);
  console.log('');
  let allOk = true;
  for (const repo of config.repos) {
    const { path: p, ok, hasPackage } = checkAccess(repo);
    const status = ok ? (hasPackage ? 'OK' : 'OK (no package.json)') : 'MISSING';
    if (!ok) allOk = false;
    console.log(`  ${repo.id.padEnd(18)} ${repo.path.padEnd(22)} ${status}`);
  }
  console.log('');
  if (allOk) {
    console.log('All repos accessible from /empire.');
  } else {
    console.log('Some repos missing. Check paths in empire.config.json and junctions.');
    process.exit(1);
  }
  process.exit(0);
}

if (cmd === 'run') {
  const sub = args[1];
  const all = args.includes('--all');
  const valid = ['leads', 'seo', 'health', 'weekly-report'].includes(sub);
  if (!sub || !valid || !all) {
    console.error('Usage: empire run <leads|seo|health|weekly-report> --all');
    process.exit(1);
  }
  const script = join(EMPIRE_ROOT, 'scripts', 'run-job.js');
  const res = spawnSync(process.execPath, [script, sub], {
    cwd: EMPIRE_ROOT,
    env: { ...process.env, EMPIRE_ROOT },
    stdio: 'inherit'
  });
  process.exit(res.status ?? 1);
}

console.error('Unknown command:', cmd);
console.error('Run "empire help" for usage.');
process.exit(1);
