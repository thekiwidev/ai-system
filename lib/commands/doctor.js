/**
 * kiwi doctor — read-only health check of the global install and/or the current project.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const registry = require('../registry');
const detect = require('../detect');
const { color, styleStatus, fail } = require('../cli');

const help = `kiwi doctor [--global] [--project] [--verbose]

Read-only. Checks the global install (links, managed blocks, generated wrappers, frontmatter)
and, when run inside a project, the project's entry points and system version. Reports drift;
never fixes anything — run \`kiwi install\` / \`kiwi link\` to repair.`;

function section(title) {
  console.log('\n' + color.bold(title));
}

function checkGlobal(verbose) {
  let issues = 0;
  const root = paths.globalRoot();
  section(`Global system  ${color.dim(paths.tilde(root))}`);
  if (!fs.existsSync(root)) {
    console.log(color.red('  missing — run `kiwi install` from your checkout'));
    return 1;
  }
  const problems = registry.validate(root);
  for (const p of problems) { console.log(`  ${styleStatus('conflict')} ${paths.tilde(p.file)}: ${p.problem}`); issues++; }
  if (!problems.length) console.log(color.dim('  frontmatter: ok'));

  const ctx = plan.context();
  const checks = ops.check(plan.globalPlan(ctx));
  const byAgent = {};
  for (const c of checks) (byAgent[c.op.agent] = byAgent[c.op.agent] || []).push(c);
  for (const [agent, rows] of Object.entries(byAgent)) {
    const bad = rows.filter(r => r.state !== 'ok');
    issues += bad.length;
    console.log(`  ${agent.padEnd(12)} ${bad.length ? color.yellow(`${bad.length} issue(s)`) : color.dim('ok')} ${color.dim(`(${rows.length} items)`)}`);
    for (const r of (verbose ? rows : bad)) console.log(`     ${styleStatus(r.state).padEnd(18)} ${paths.tilde(r.op.path)}`);
  }
  // symlinks into the root whose target vanished (renamed/removed component)
  const dirs = [
    path.join(ctx.homes.claude, 'skills'), path.join(ctx.homes.claude, 'agents'), path.join(ctx.homes.claude, 'rules'),
    path.join(ctx.homes.agents, 'skills'), path.join(ctx.homes.gemini, 'skills'), path.join(ctx.homes.antigravityConfig, 'skills'), path.join(ctx.homes.copilot, 'skills')
  ];
  const broken = dirs.flatMap(d => ops.brokenLinksInto(d, fs.existsSync(root) ? fs.realpathSync(root) : root).concat(ops.brokenLinksInto(d, root)));
  for (const b of broken) { console.log(`  ${styleStatus('broken')} ${paths.tilde(b.path)} → ${paths.tilde(b.target)} (remove it)`); issues++; }
  // caveman upstream pin (best effort, quick, never fails the check on no network)
  try {
    const pin = JSON.parse(fs.readFileSync(paths.g('skills', 'caveman', 'UPSTREAM.json'), 'utf8'));
    const { execSync } = require('child_process');
    const out = execSync('git ls-remote --tags --refs https://github.com/JuliusBrussee/caveman.git', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 });
    const tags = out.split('\n').map(l => (l.split('refs/tags/')[1] || '')).filter(t => /^v\d+\.\d+\.\d+$/.test(t))
      .sort((a, b) => a.replace('v', '').split('.').map(Number).reduce((r, x, i) => r || (x - b.replace('v', '').split('.').map(Number)[i]), 0));
    const latest = tags[tags.length - 1];
    if (latest && latest !== pin.tag) { console.log(`  ${styleStatus('stale')} caveman mirrored at ${pin.tag}; upstream ${latest} — node scripts/update-caveman.js ${latest}`); issues++; }
    else console.log(color.dim(`  caveman mirror: ${pin.tag} (current)`));
  } catch { console.log(color.dim('  caveman mirror: pin check skipped (offline)')); }
  return issues;
}

function checkProject(dir, verbose) {
  let issues = 0;
  section(`Project  ${color.dim(dir)}`);
  const det = detect.detect(dir, paths.version());
  console.log(`  mode: ${color.bold(det.mode)}`);
  for (const e of det.evidence) console.log(color.dim(`    - ${e}`));
  if (!fs.existsSync(path.join(dir, detect.CORE))) {
    console.log(color.yellow('  no docs/ai/AGENT-CORE.md — run `kiwi init` to start the initializer'));
    return issues + 1;
  }
  const ctx = plan.context();
  const vendored = plan.vendoredSkills(dir);
  const checks = ops.check(plan.projectPlan(ctx, dir, { vendor: vendored.length > 0, skillNames: vendored.length ? vendored : null }));
  for (const c of checks) {
    if (c.state !== 'ok') issues++;
    if (verbose || c.state !== 'ok') console.log(`  ${styleStatus(c.state).padEnd(18)} ${path.relative(dir, c.op.path)}${c.state === 'conflict' ? color.dim('  (hand-written file — the kiwi-system skill migrates it)') : ''}`);
  }
  const cavemanFile = path.join(dir, '.caveman.json');
  if (fs.existsSync(cavemanFile)) {
    const mode = require('../caveman').readMode(cavemanFile);
    if (!mode) { console.log(`  ${styleStatus('conflict')} .caveman.json is not valid ({"defaultMode": "off|lite|full|ultra"})`); issues++; }
    else console.log(color.dim(`  caveman: ${mode} (project)`));
  } else console.log(color.dim(`  caveman: ${require('../caveman').effective(dir).mode} (inherited)`));
  const coreFile = path.join(dir, detect.CORE);
  if (fs.existsSync(coreFile)) {
    const cave = require('../caveman');
    const frozen = cave.statedInCore(fs.readFileSync(coreFile, 'utf8'));
    const eff = cave.effective(dir).mode;
    if (frozen && frozen !== eff) {
      issues++;
      console.log(`  ${styleStatus('stale').padEnd(18)} ${detect.CORE} states caveman "${frozen}", effective level is "${eff}" — upgrade delta V3-11 replaces the frozen value`);
    }
    if (!fs.readFileSync(coreFile, 'utf8').includes('RULE-GIT-002')) {
      issues++;
      console.log(`  ${styleStatus('stale').padEnd(18)} ${detect.CORE} has no "No AI attribution" paragraph (RULE-GIT-002) — upgrade delta V3-14 adds it`);
    }
  }
  const ctxlib = require('../ctx');
  const conf = ctxlib.configured(dir);
  if (conf.length) {
    for (const r of ctxlib.status(dir)) {
      if (r.state === 'current') { if (verbose) console.log(color.dim(`  context/${r.name}: current`)); continue; }
      issues++;
      console.log(`  ${styleStatus(r.state === 'stale' ? 'stale' : r.state === 'missing' ? 'missing' : 'conflict').padEnd(18)} context/${r.name} — ${r.state === 'no-source' ? 'source missing' : 'agent must regenerate from ' + path.relative(dir, r.source) + ' (context-docs skill) then `kiwi ctx stamp ' + r.name + '`'}`);
    }
  }
  if (!issues) console.log(color.dim('  entry points and adapters: ok'));
  issues += checkProjectWorkflows(dir, verbose);
  if (vendored.length) console.log(color.dim(`  vendored skills: ${vendored.join(', ')}`));
  if (det.mode === 'UPGRADE') {
    issues++;
    const linksOk = checks.every(c => c.state === 'ok');
    console.log(color.yellow(`  system is behind kiwi v${det.currentVersion} (${det.kiwiVersion ? 'kiwi_version ' + det.kiwiVersion : 'no kiwi_version'} in SYSTEM.md)`));
    console.log(color.dim(linksOk
      ? '    links are current · the agent step is pending: tell any agent "upgrade this project\'s AI system" (it runs `kiwi agent UPGRADE`, shows the delta, and ends with `kiwi stamp`, which clears this).'
      : '    links need repair (the agent runs `kiwi link` as part of the upgrade, or run it yourself) · then tell any agent "upgrade this project\'s AI system".'));
  }
  return issues;
}

/** RULE-KIND-001: project workflows conform, are registered, and Claude can discover them. */
function checkProjectWorkflows(dir, verbose) {
  const kinds = require('../kinds');
  let issues = 0;
  const indexFile = path.join(dir, 'docs', 'ai', 'workflows', 'INDEX.md');
  const index = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';
  const flag = (msg) => { issues++; console.log(`  ${styleStatus('conflict').padEnd(18)} ${msg}`); };
  const workflows = kinds.projectWorkflows(dir);
  for (const w of workflows) {
    const rel = path.relative(dir, w.file);
    for (const p of kinds.workflowProblems(fs.readFileSync(w.file, 'utf8'))) flag(`${rel}: ${p} (create-workflow skill)`);
    if (!index.includes('`' + w.name + '`')) flag(`${rel}: not registered in docs/ai/workflows/INDEX.md`);
    if (!fs.existsSync(path.join(dir, '.claude', 'skills', w.name))) flag(`${rel}: no .claude/skills/${w.name} link — Claude Code cannot find it`);
  }
  for (const f of kinds.strayWorkflowDocs(dir)) flag(`${path.relative(dir, f)}: workflow outside its home — upgrade delta V3-13 migrates it to .agents/skills/ with the owner's approval`);
  if (verbose && workflows.length) console.log(color.dim(`  workflows: ${workflows.map(w => w.name).join(', ')}`));
  return issues;
}

async function run(args) {
  const inProject = fs.existsSync(path.join(process.cwd(), 'docs', 'ai')) || fs.existsSync(path.join(process.cwd(), '.git'));
  const doGlobal = args.flags.global || !args.flags.project;
  const doProject = args.flags.project || (!args.flags.global && inProject && fs.realpathSync(process.cwd()) !== fs.realpathSync(paths.REPO_ROOT));
  let issues = 0;
  if (doGlobal) issues += checkGlobal(!!args.flags.verbose);
  if (doProject) issues += checkProject(process.cwd(), !!args.flags.verbose);
  console.log(issues ? color.yellow(`\n${issues} issue(s) found`) : color.green('\nAll clear'));
  return issues ? 1 : 0;
}

module.exports = { run, help, checkGlobal, checkProject, checkProjectWorkflows };
