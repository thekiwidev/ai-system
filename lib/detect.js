/**
 * Project mode detection — the v3 initializer's §0.1.2 decision tree, made deterministic.
 *
 *   docs/ai/AGENT-CORE.md present  → UPGRADE (kiwi_version missing/older) | AUDIT (current)
 *   absent + real code / manifest / history → ADOPT
 *   otherwise → INIT
 *
 * AMEND and EXTEND are user-intent modes and are never detected from the filesystem.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parse } = require('./frontmatter');

const CORE = path.join('docs', 'ai', 'AGENT-CORE.md');
const SYSTEM = path.join('docs', 'ai', 'SYSTEM.md');

const MANIFESTS = ['package.json', 'pyproject.toml', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'pubspec.yaml', 'Package.swift', 'mix.exs'];
const LEGACY_INSTRUCTIONS = ['AGENT.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules', '.windsurfrules', '.clinerules', '.github/copilot-instructions.md', '.cursor/rules', '.agents/rules', '.agent/rules'];
const ENTRY_POINTS = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md'];

function exists(p) {
  try { fs.lstatSync(p); return true; } catch { return false; }
}

function compareSemver(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

function gitCommitCount(dir) {
  try {
    return Number(execSync('git rev-list --count HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim());
  } catch { return 0; }
}

function hasSourceCode(dir) {
  const dirs = ['src', 'app', 'apps', 'packages', 'lib', 'cmd', 'internal', 'pkg', 'server', 'client'];
  return dirs.some(d => exists(path.join(dir, d)) && fs.statSync(path.join(dir, d)).isDirectory());
}

/** @returns {{ mode, evidence: string[], legacy: string[], entryPoints: object, kiwiVersion, currentVersion, system }} */
function detect(dir, currentVersion) {
  const evidence = [];
  // Hand-written instruction files only: symlinks into docs/ai and kiwi's own pointer file are not legacy.
  const legacy = LEGACY_INSTRUCTIONS.filter(f => {
    const p = path.join(dir, f);
    if (!exists(p)) return false;
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) return !(fs.readlinkSync(p) || '').includes('docs/ai/AGENT-CORE.md');
    if (st.isDirectory()) {
      const names = fs.readdirSync(p);
      // kiwi-generated pointers and kiwi-vendored copies are not hand-written knowledge
      const generated = n => { try { return fs.readFileSync(path.join(p, n), 'utf8').includes('generated-by: kiwi'); } catch { return false; } };
      return names.some(n => !n.endsWith('.kiwi-vendored') && !names.includes(n + '.kiwi-vendored') && !generated(n));
    }
    return true;
  });
  const entryPoints = {};
  for (const e of ENTRY_POINTS) {
    const p = path.join(dir, e);
    if (!exists(p)) entryPoints[e] = 'absent';
    else if (fs.lstatSync(p).isSymbolicLink()) entryPoints[e] = fs.existsSync(p) ? `symlink → ${fs.readlinkSync(p)}` : 'broken symlink';
    else entryPoints[e] = 'hand-written file';
  }

  const coreExists = exists(path.join(dir, CORE));
  let mode, kiwiVersion = null, system = null;

  if (coreExists) {
    evidence.push(`${CORE} exists — a generated system is present`);
    const sysPath = path.join(dir, SYSTEM);
    if (exists(sysPath)) {
      system = parse(fs.readFileSync(sysPath, 'utf8')).data;
      kiwiVersion = system.kiwi_version || null;
      evidence.push(kiwiVersion ? `${SYSTEM} records kiwi_version ${kiwiVersion}` : `${SYSTEM} carries no kiwi_version (built before the global system existed)`);
    } else {
      evidence.push(`${SYSTEM} is missing — manifest must be reconstructed`);
    }
    if (!kiwiVersion || compareSemver(kiwiVersion, currentVersion) < 0) {
      mode = 'UPGRADE';
      evidence.push(`current kiwi version is ${currentVersion}`);
    } else {
      mode = 'AUDIT';
      evidence.push('system is current with this kiwi version');
    }
  } else {
    evidence.push(`${CORE} absent — no generated system`);
    const manifests = MANIFESTS.filter(m => exists(path.join(dir, m)));
    const commits = gitCommitCount(dir);
    const code = hasSourceCode(dir);
    if (manifests.length) evidence.push(`dependency manifest(s): ${manifests.join(', ')}`);
    if (code) evidence.push('source directories present');
    if (commits) evidence.push(`git history: ${commits} commit(s)`);
    if (legacy.length) evidence.push(`existing instruction files: ${legacy.join(', ')} — these are project knowledge (never discard; migrate per §22.9)`);
    mode = (manifests.length || code || commits > 3 || legacy.length) ? 'ADOPT' : 'INIT';
    if (mode === 'INIT') evidence.push('no code, manifests, meaningful history or instruction files — greenfield');
  }

  return { mode, evidence, legacy, entryPoints, kiwiVersion, currentVersion, system };
}

/** The exact prompt to hand to an agent. */
function prompt(det, { globalRoot }) {
  const lines = [
    `${({ INIT: 'Set up', ADOPT: 'Set up', UPGRADE: 'Upgrade', AUDIT: 'Audit', AMEND: 'Amend a rule in', EXTEND: 'Extend' })[det.mode] || 'Run the kiwi-system skill on'} this project's AI system: run \`kiwi agent ${det.mode}\` (or \`~/.thekiwidev/bin/kiwi agent ${det.mode}\`) yourself and follow its output top to bottom.`,
    '',
    `Detected mode: ${det.mode}`,
    'Evidence:',
    ...det.evidence.map(e => `  - ${e}`),
    '',
    `Global system: ${globalRoot} (GLOBAL.md, skills/, agents/, rules/). Project rules win on conflict; global principles fill gaps.`,
    'Follow the initializer exactly: inspect first, ask only what the repository cannot answer, never guess project facts, never perform Git operations.'
  ];
  if (det.mode === 'UPGRADE') lines.push('Produce the dry-run delta table and stop for approval before writing anything.');
  if (det.mode === 'AUDIT') lines.push('Read-only: report drift, propose fixes, apply only trivially safe structural repairs.');
  if (det.mode === 'ADOPT') lines.push('Run the reverse-engineering sweep and present the derived-facts confirmation table before asking questions.');
  return lines.join('\n');
}

module.exports = { detect, prompt, compareSemver, CORE, SYSTEM, ENTRY_POINTS };
