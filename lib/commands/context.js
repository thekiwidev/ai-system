/**
 * kiwi context — a deterministic brief of the project for the agent that runs the kiwi-system skill.
 * Everything here is [verified] from the filesystem; the agent still inspects code for the rest.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const paths = require('../paths');
const detect = require('../detect');
const plan = require('../plan');
const registry = require('../registry');
const ops = require('../ops');
const { parse } = require('../frontmatter');
const caveman = require('../caveman');

const help = `kiwi context [--json]

Run inside a project. Prints a verified brief for the agent running the kiwi-system skill:
detected mode and evidence, toolchain (lockfiles, scripts, workspaces, CI), existing AI/instruction
files and their status, the docs/ai inventory and SYSTEM.md manifest, vendored skills, and what the
global system offers. Read-only. The agent reads this first, then inspects the code.`;

function exists(p) { try { fs.lstatSync(p); return true; } catch { return false; } }
function sh(cmd, cwd) { try { return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } }
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

const LOCKFILES = { 'bun.lock': 'bun', 'bun.lockb': 'bun', 'pnpm-lock.yaml': 'pnpm', 'yarn.lock': 'yarn', 'package-lock.json': 'npm', 'uv.lock': 'uv', 'poetry.lock': 'poetry', 'Pipfile.lock': 'pipenv', 'Cargo.lock': 'cargo', 'go.sum': 'go', 'Gemfile.lock': 'bundler', 'composer.lock': 'composer' };
const MANIFESTS = ['package.json', 'pyproject.toml', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'pubspec.yaml', 'Package.swift', 'mix.exs', 'Makefile', 'docker-compose.yml', 'docker-compose.yaml', 'Dockerfile', '.env.example', 'tsconfig.json', 'tsconfig.base.json'];
const SRC_DIRS = ['src', 'app', 'apps', 'packages', 'lib', 'cmd', 'internal', 'pkg', 'server', 'client', 'services', 'web', 'api', 'worker', 'tests', 'test', '__tests__', 'e2e', 'docs', 'prisma', 'migrations', 'scripts', 'infra'];

function gather(dir) {
  const det = detect.detect(dir, paths.version());
  const git = {
    repo: !!sh('git rev-parse --git-dir', dir),
    branch: sh('git rev-parse --abbrev-ref HEAD', dir),
    commits: Number(sh('git rev-list --count HEAD', dir) || 0),
    dirty: (sh('git status --porcelain', dir) || '').split('\n').filter(Boolean).length,
    lastCommit: sh('git log -1 --format=%cs%x20%s', dir)
  };
  const lockfiles = Object.keys(LOCKFILES).filter(f => exists(path.join(dir, f)));
  const pkg = readJson(path.join(dir, 'package.json'));
  const tsconfig = readJson(path.join(dir, 'tsconfig.json')) || readJson(path.join(dir, 'tsconfig.base.json'));
  const workflows = exists(path.join(dir, '.github', 'workflows')) ? fs.readdirSync(path.join(dir, '.github', 'workflows')) : [];
  const aiDir = path.join(dir, 'docs', 'ai');
  const aiFiles = exists(aiDir) ? walk(aiDir).map(f => path.relative(dir, f)) : [];
  const system = exists(path.join(dir, detect.SYSTEM)) ? parse(fs.readFileSync(path.join(dir, detect.SYSTEM), 'utf8')).data : null;
  const markers = git.repo ? sh('git grep -c -E "TODO|FIXME|HACK|XXX" -- . ":!*.lock" ":!*lock*" ":!docs/ai/*" | awk -F: \'{s+=$2} END {print s+0}\'', dir) : null;
  const reg = registry.all(paths.globalRoot());
  return {
    project: { dir, name: (pkg && pkg.name) || path.basename(dir) },
    mode: { mode: det.mode, evidence: det.evidence, kiwiVersion: det.kiwiVersion, currentVersion: det.currentVersion },
    git,
    toolchain: {
      lockfiles, packageManager: [...new Set(lockfiles.map(f => LOCKFILES[f]))],
      packageManagerField: pkg && pkg.packageManager, workspaces: pkg && pkg.workspaces,
      scripts: pkg && pkg.scripts, engines: pkg && pkg.engines,
      manifests: MANIFESTS.filter(m => exists(path.join(dir, m))),
      tsStrict: tsconfig && tsconfig.compilerOptions ? tsconfig.compilerOptions.strict : undefined,
      ciWorkflows: workflows, srcDirs: SRC_DIRS.filter(d => exists(path.join(dir, d))),
      codeMarkers: markers === null ? null : Number(markers)
    },
    instructions: { entryPoints: det.entryPoints, legacyFiles: det.legacy, agentsRules: exists(path.join(dir, '.agents', 'rules')) ? fs.readdirSync(path.join(dir, '.agents', 'rules')) : [] },
    docsAi: { present: aiFiles.length > 0, files: aiFiles, system, vendored: plan.vendoredSkills(dir) },
    caveman: caveman.effective(dir),
    contextDocs: (() => { const c = require('../ctx'); const names = c.configured(dir); return names.length ? c.status(dir, names).map(r => ({ name: r.name, state: r.state })) : []; })(),
    global: {
      root: paths.globalRoot(), version: paths.version(),
      skills: reg.skills.map(s => s.name + (s.invocable ? '*' : '')), agents: reg.agents.map(a => a.name), rules: reg.rules.map(r => r.name),
      memory: exists(paths.g('MEMORY.md')), notes: exists(paths.g('NOTES.md')), kiwiOnPath: !!sh('command -v kiwi', dir)
    }
  };
}

function walk(d) {
  const out = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

function render(c) {
  const L = [];
  const h = s => L.push('', `## ${s}`, '');
  const kv = (k, v) => L.push(`- **${k}:** ${v === undefined || v === null || (Array.isArray(v) && !v.length) ? '—' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v}`);
  L.push(`# kiwi context — ${c.project.name}`, '', `Verified from the filesystem on ${new Date().toISOString().slice(0, 10)}. Facts marked here are \`[verified]\`; everything about intent, prohibitions and sanctioned patterns is still \`[unconfirmed]\` until the owner says so.`);
  h('Mode');
  kv('Detected mode', c.mode.mode);
  for (const e of c.mode.evidence) L.push(`  - ${e}`);
  kv('Project kiwi_version', c.mode.kiwiVersion); kv('Current kiwi version', c.mode.currentVersion);
  h('Git (read-only)');
  kv('Repository', c.git.repo ? `branch ${c.git.branch}, ${c.git.commits} commits, last: ${c.git.lastCommit}` : 'not a git repository');
  kv('Working tree', c.git.dirty ? `${c.git.dirty} uncommitted change(s) — capture in HANDOFF.md as in-flight work; never tidy` : 'clean');
  h('Toolchain');
  kv('Lockfiles', c.toolchain.lockfiles); kv('Package manager', c.toolchain.packageManager.length > 1 ? `${c.toolchain.packageManager.join(' + ')} — MULTIPLE lockfiles is a finding` : c.toolchain.packageManager);
  kv('packageManager field', c.toolchain.packageManagerField); kv('Workspaces', c.toolchain.workspaces);
  if (c.toolchain.scripts) { L.push('- **Scripts** (the real verification commands come from here):'); for (const [k, v] of Object.entries(c.toolchain.scripts)) L.push(`  - \`${k}\`: \`${v}\``); }
  kv('Manifests / config present', c.toolchain.manifests); kv('TypeScript strict', c.toolchain.tsStrict);
  kv('CI workflows', c.toolchain.ciWorkflows); kv('Top-level source dirs', c.toolchain.srcDirs); kv('TODO/FIXME/HACK markers', c.toolchain.codeMarkers);
  h('Existing agent instructions');
  for (const [k, v] of Object.entries(c.instructions.entryPoints)) L.push(`- \`${k}\`: ${v}`);
  kv('Other instruction files (project knowledge — migrate, never discard)', c.instructions.legacyFiles); kv('.agents/rules', c.instructions.agentsRules);
  h('docs/ai');
  if (!c.docsAi.present) L.push('- absent — this is INIT or ADOPT');
  else { for (const f of c.docsAi.files) L.push(`- ${f}`); }
  if (c.docsAi.system) { L.push('', '**SYSTEM.md frontmatter:**'); for (const [k, v] of Object.entries(c.docsAi.system)) L.push(`- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`); }
  kv('Vendored skills', c.docsAi.vendored);
  kv('Derived context docs', c.contextDocs.length ? c.contextDocs.map(d => `${d.name} ${d.state}`).join(' · ') + (c.contextDocs.some(d => d.state !== 'current') ? ' — read the SOURCE for non-current ones; regenerate (context-docs skill) before ending' : ' — read these instead of the sources') : 'off');
  h('Output style');
  kv('Caveman', `${c.caveman.mode} (${c.caveman.source}${c.caveman.file ? ': ' + paths.tilde(c.caveman.file) : ''}) — change with \`kiwi caveman <mode>\``);
  h('Global system');
  kv('Root', `${c.global.root} (v${c.global.version})`); kv('kiwi on PATH', c.global.kiwiOnPath ? 'yes' : 'no — use ~/.thekiwidev/bin/kiwi');
  kv('Skills (* = invocable)', c.global.skills); kv('Agents', c.global.agents); kv('Rules', c.global.rules);
  kv('Global MEMORY.md / NOTES.md', `${c.global.memory ? 'present' : 'absent'} / ${c.global.notes ? 'present' : 'absent'}`);
  L.push('', '---', `Next: follow \`~/.thekiwidev/skills/kiwi-system/runbooks/${c.mode.mode}.md\`.`);
  return L.join('\n') + '\n';
}

async function run(args) {
  const dir = process.cwd();
  const c = gather(dir);
  if (args.flags.json) console.log(JSON.stringify(c, null, 2)); else console.log(render(c));
  return 0;
}

module.exports = { run, help, gather, render };
