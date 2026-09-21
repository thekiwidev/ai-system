/**
 * Tests for the kiwi CLI library: frontmatter, registry, detect, managed blocks, ops, plans, adapters.
 * Everything runs against a temporary HOME (KIWI_TEST_HOME) so nothing on the real machine is touched.
 *
 * Run with: node tests/lib/kiwi.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');
const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwi-home-'));
process.env.KIWI_TEST_HOME = tmpHome;
process.env.THEKIWIDEV_AI_HOME = REPO;

const fm = require('../../lib/frontmatter');
const registry = require('../../lib/registry');
const detect = require('../../lib/detect');
const managed = require('../../lib/managed');
const ops = require('../../lib/ops');
const plan = require('../../lib/plan');
const paths = require('../../lib/paths');
const adapters = require('../../lib/adapters');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing kiwi lib ===\n');
  let passed = 0, failed = 0;
  const t = (n, f) => { if (test(n, f)) passed++; else failed++; };

  console.log('frontmatter:');
  t('parses scalars, quoted strings, inline and block lists', () => {
    const doc = '---\nname: x\ndescription: "a: b"\ntools: [Read, Grep]\nlist:\n  - one\n  - two\ninvocable: true\nn: 3\n---\n\n# Body\n';
    const { data, body, hasFrontmatter } = fm.parse(doc);
    assert.ok(hasFrontmatter);
    assert.deepStrictEqual(data, { name: 'x', description: 'a: b', tools: ['Read', 'Grep'], list: ['one', 'two'], invocable: true, n: 3 });
    assert.strictEqual(body.trim(), '# Body');
  });
  t('round-trips through stringify', () => {
    const data = { name: 'x', description: 'a: b', tools: ['Read', 'Grep'], invocable: true };
    const out = fm.stringify(data, '\n# Body\n');
    assert.deepStrictEqual(fm.parse(out).data, data);
  });
  t('setKey replaces or appends one key and leaves the rest', () => {
    const doc = '---\nname: x\nvendored: []\n---\n\nbody\n';
    const a = fm.setKey(doc, 'vendored', ['create-prd']);
    assert.ok(a.includes('vendored: [create-prd]'));
    const b = fm.setKey(a, 'kiwi_version', '3.0.0');
    assert.deepStrictEqual(fm.parse(b).data, { name: 'x', vendored: ['create-prd'], kiwi_version: '3.0.0' });
    assert.ok(b.endsWith('body\n'));
  });
  t('a document without frontmatter parses to empty data', () => {
    assert.deepStrictEqual(fm.parse('# hi\n').data, {});
  });

  console.log('\nregistry:');
  const reg = registry.all(REPO);
  t('finds skills, agents and rules and skips _templates', () => {
    assert.ok(reg.skills.length >= 25, `skills: ${reg.skills.length}`);
    assert.ok(reg.agents.length >= 9);
    assert.ok(reg.rules.length >= 8);
    assert.ok(!reg.skills.some(s => s.name.startsWith('_')));
    assert.ok(!reg.agents.some(a => a.fileName.startsWith('_')));
  });
  t('every component has valid frontmatter (name = dir, description present)', () => {
    assert.deepStrictEqual(registry.validate(REPO), []);
  });
  t('kiwi-system and create-prd are invocable skills', () => {
    for (const n of ['kiwi-system', 'create-prd', 'feature-workflow', 'bugfix-workflow']) {
      const s = reg.skills.find(x => x.name === n);
      assert.ok(s && s.invocable, n);
    }
  });

  console.log('\ndetect:');
  const fixtures = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwi-fx-'));
  t('empty directory → INIT', () => {
    const d = path.join(fixtures, 'empty'); fs.mkdirSync(d);
    assert.strictEqual(detect.detect(d, '3.0.0').mode, 'INIT');
  });
  t('package.json present → ADOPT', () => {
    const d = path.join(fixtures, 'brown'); fs.mkdirSync(d);
    fs.writeFileSync(path.join(d, 'package.json'), '{}');
    assert.strictEqual(detect.detect(d, '3.0.0').mode, 'ADOPT');
  });
  t('hand-written CLAUDE.md alone → ADOPT and it is reported', () => {
    const d = path.join(fixtures, 'legacy'); fs.mkdirSync(d);
    fs.writeFileSync(path.join(d, 'CLAUDE.md'), '# rules');
    const det = detect.detect(d, '3.0.0');
    assert.strictEqual(det.mode, 'ADOPT');
    assert.strictEqual(det.entryPoints['CLAUDE.md'], 'hand-written file');
  });
  t('docs/ai without kiwi_version → UPGRADE; current version → AUDIT', () => {
    const d = path.join(fixtures, 'sys'); fs.mkdirSync(path.join(d, 'docs', 'ai'), { recursive: true });
    fs.writeFileSync(path.join(d, 'docs', 'ai', 'AGENT-CORE.md'), '# core');
    fs.writeFileSync(path.join(d, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\n---\n');
    assert.strictEqual(detect.detect(d, '3.0.0').mode, 'UPGRADE');
    fs.writeFileSync(path.join(d, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\nkiwi_version: "3.0.0"\n---\n');
    assert.strictEqual(detect.detect(d, '3.0.0').mode, 'AUDIT');
    fs.writeFileSync(path.join(d, 'docs', 'ai', 'SYSTEM.md'), '---\nkiwi_version: "2.9.0"\n---\n');
    assert.strictEqual(detect.detect(d, '3.0.0').mode, 'UPGRADE');
  });
  t('prompt names the mode and the skill', () => {
    const p = detect.prompt({ mode: 'ADOPT', evidence: ['x'] }, { globalRoot: '~/.thekiwidev' });
    assert.ok(p.startsWith("Set up this project's AI system: run `kiwi agent ADOPT`"), p);
    assert.ok(p.includes('Detected mode: ADOPT'));
  });

  console.log('\nmanaged blocks:');
  t('apply inserts, replaces, and is idempotent; user text survives', () => {
    const a = managed.apply('# mine\nkeep this\n', 'hello');
    assert.ok(a.includes('keep this') && a.includes('hello'));
    assert.strictEqual(managed.status(a, 'hello'), 'ok');
    assert.strictEqual(managed.status(a, 'changed'), 'stale');
    const b = managed.apply(a, 'changed');
    assert.ok(b.includes('changed') && !b.includes('\nhello\n') && b.includes('keep this'));
    assert.strictEqual(managed.apply(b, 'changed'), b);
    assert.strictEqual(managed.status(null, 'x'), 'missing');
  });

  console.log('\nops:');
  const opsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiwi-ops-'));
  t('symlink: missing → created → ok; wrong target → stale → updated; real file → conflict', () => {
    const target = path.join(opsDir, 'target'); fs.writeFileSync(target, 'x');
    const op = { kind: 'symlink', path: path.join(opsDir, 'link'), target, agent: 't' };
    assert.strictEqual(ops.apply(op).status, 'created');
    assert.strictEqual(ops.apply(op).status, 'ok');
    fs.unlinkSync(op.path); fs.symlinkSync(path.join(opsDir, 'other'), op.path);
    assert.strictEqual(ops.inspect(op), 'stale');
    assert.strictEqual(ops.apply(op).status, 'updated');
    fs.unlinkSync(op.path); fs.writeFileSync(op.path, 'hand-written');
    assert.strictEqual(ops.apply(op).status, 'conflict');
    assert.strictEqual(fs.readFileSync(op.path, 'utf8'), 'hand-written');
  });
  t('file: generated files are overwritten, hand-written ones are not', () => {
    const op = { kind: 'file', path: path.join(opsDir, 'gen.md'), content: `<!-- ${ops.GENERATED_MARK} -->\nv1\n`, agent: 't' };
    assert.strictEqual(ops.apply(op).status, 'created');
    const op2 = { ...op, content: `<!-- ${ops.GENERATED_MARK} -->\nv2\n` };
    assert.strictEqual(ops.apply(op2).status, 'updated');
    fs.writeFileSync(op.path, 'mine');
    assert.strictEqual(ops.apply(op2).status, 'conflict');
  });
  t('dry-run writes nothing', () => {
    const op = { kind: 'mkdir', path: path.join(opsDir, 'dry'), agent: 't' };
    assert.strictEqual(ops.apply(op, { dryRun: true }).status, 'would-be-created');
    assert.ok(!fs.existsSync(op.path));
  });
  t('copy vendors a directory with a marker and detects staleness', () => {
    const src = path.join(opsDir, 'srcskill'); fs.mkdirSync(src); fs.writeFileSync(path.join(src, 'SKILL.md'), 'a');
    const op = { kind: 'copy', path: path.join(opsDir, 'dst', 'srcskill'), source: src, agent: 't' };
    assert.strictEqual(ops.apply(op).status, 'created');
    assert.ok(fs.existsSync(path.join(op.path, ops.VENDOR_MARK)));
    assert.strictEqual(ops.apply(op).status, 'ok');
    fs.writeFileSync(path.join(src, 'SKILL.md'), 'b');
    assert.strictEqual(ops.apply(op).status, 'updated');
  });
  t('json merge backs up and is idempotent', () => {
    const p = path.join(opsDir, 'settings.json'); fs.writeFileSync(p, '{"a":1}');
    const op = { kind: 'json', path: p, merge: e => ({ ...e, b: 2 }), agent: 't' };
    assert.strictEqual(ops.apply(op).status, 'updated');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(p, 'utf8')), { a: 1, b: 2 });
    assert.ok(fs.readdirSync(opsDir).some(f => f.startsWith('settings.json.bak-')));
    assert.strictEqual(ops.apply(op).status, 'ok');
  });

  console.log('\nplans & adapters (temp HOME):');
  const ctx = plan.context();
  const gplan = plan.globalPlan(ctx);
  t('global plan covers every enabled agent with skills, managed blocks and wrappers', () => {
    const agentsSeen = new Set(gplan.map(o => o.agent));
    for (const a of ['claude', 'codex', 'gemini', 'antigravity', 'copilot']) assert.ok(agentsSeen.has(a), a);
    const skillLinks = gplan.filter(o => o.kind === 'symlink' && o.path.includes(`${path.sep}skills${path.sep}`));
    assert.strictEqual(skillLinks.length, reg.skills.length * 5, 'one link per skill per agent');
    assert.ok(gplan.some(o => o.kind === 'managed' && o.path.endsWith('CLAUDE.md') && o.inner.includes('@~/.thekiwidev/GLOBAL.md') === false && o.inner.includes('GLOBAL.md')));
    assert.ok(gplan.some(o => o.kind === 'file' && o.path.endsWith('.toml')), 'gemini wrappers');
    assert.ok(gplan.some(o => o.kind === 'file' && o.path.includes('prompts')), 'codex wrappers');
    assert.ok(gplan.every(o => o.path.startsWith(tmpHome)), 'everything under the temp HOME');
  });
  t('GEMINI.md managed block is emitted once even though two adapters share it', () => {
    assert.strictEqual(gplan.filter(o => o.kind === 'managed' && o.path.endsWith('GEMINI.md')).length, 1);
  });
  t('install into temp HOME creates everything; a second run changes nothing', () => {
    const r1 = ops.run(gplan);
    assert.ok(!r1.summary.conflict, JSON.stringify(r1.summary));
    assert.ok(r1.summary.created > 100);
    const r2 = ops.run(gplan);
    assert.deepStrictEqual(Object.keys(r2.summary), ['ok']);
    assert.ok(fs.existsSync(path.join(tmpHome, '.claude', 'skills', 'create-prd', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(tmpHome, '.agents', 'skills', 'kiwi-system', 'INITIALIZER.md')));
    assert.ok(fs.readFileSync(path.join(tmpHome, '.codex', 'AGENTS.md'), 'utf8').includes(managed.START));
  });
  t('gemini and codex wrappers reference the skill by name', () => {
    const toml = fs.readFileSync(path.join(tmpHome, '.gemini', 'commands', 'create-prd.toml'), 'utf8');
    assert.ok(toml.includes('description = ') && toml.includes('create-prd') && toml.includes('{{args}}'));
    const prompt = fs.readFileSync(path.join(tmpHome, '.codex', 'prompts', 'plan.md'), 'utf8');
    assert.ok(fm.parse(prompt).data.description && prompt.includes('$ARGUMENTS'));
  });
  t('hooks merge tags entries, rewrites plugin root, skips tmux by default', () => {
    const cfg = { ...ctx.config, hooks: { install: true, tmux: false } };
    const hop = adapters.claude.global({ ...ctx, config: cfg }).find(o => o.kind === 'json');
    const merged = hop.merge({ hooks: { PreToolUse: [{ description: 'user hook', hooks: [] }] } });
    assert.ok(merged.hooks.PreToolUse.some(e => e.description === 'user hook'));
    assert.ok(merged.hooks.PreToolUse.every(e => !/tmux/i.test(e.description) || !e.description.startsWith('[kiwi]')));
    assert.ok(merged.hooks.SessionStart[0].hooks[0].command.includes(REPO));
    assert.ok(!JSON.stringify(merged).includes('CLAUDE_PLUGIN_ROOT'));
    const again = hop.merge(merged);
    assert.strictEqual(JSON.stringify(again), JSON.stringify(merged), 'idempotent');
  });

  console.log('\nproject link & vendor:');
  const proj = path.join(fixtures, 'proj');
  fs.mkdirSync(path.join(proj, 'docs', 'ai'), { recursive: true });
  fs.writeFileSync(path.join(proj, 'docs', 'ai', 'AGENT-CORE.md'), '# core');
  fs.writeFileSync(path.join(proj, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\nkiwi_version: "3.0.0"\nvendored: []\n---\n\n# manifest\n');
  t('link creates the four entry symlinks and the Antigravity pointer; idempotent', () => {
    const p = plan.projectPlan(ctx, proj);
    const r = ops.run(p);
    assert.ok(!r.summary.conflict);
    for (const f of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']) {
      assert.strictEqual(fs.readlinkSync(path.join(proj, f)), 'docs/ai/AGENT-CORE.md');
      assert.strictEqual(fs.readFileSync(path.join(proj, f), 'utf8'), '# core');
    }
    assert.strictEqual(fs.readlinkSync(path.join(proj, '.github', 'copilot-instructions.md')), '../docs/ai/AGENT-CORE.md');
    assert.ok(fs.readFileSync(path.join(proj, '.agents', 'rules', '00-agent-core.md'), 'utf8').includes('docs/ai/AGENT-CORE.md'));
    assert.deepStrictEqual(Object.keys(ops.run(p).summary), ['ok']);
  });
  t('a hand-written CLAUDE.md is a conflict, not overwritten', () => {
    const p2 = path.join(fixtures, 'proj2'); fs.mkdirSync(path.join(p2, 'docs', 'ai'), { recursive: true });
    fs.writeFileSync(path.join(p2, 'docs', 'ai', 'AGENT-CORE.md'), '# core');
    fs.writeFileSync(path.join(p2, 'CLAUDE.md'), 'hand-written');
    const r = ops.run(plan.projectPlan(ctx, p2));
    assert.strictEqual(r.summary.conflict, 1);
    assert.strictEqual(fs.readFileSync(path.join(p2, 'CLAUDE.md'), 'utf8'), 'hand-written');
  });
  t('vendor copies named skills + all rules and Copilot adapters; SYSTEM.md records them', () => {
    const p = plan.projectPlan(ctx, proj, { vendor: true, skillNames: ['create-prd'] });
    const r = ops.run(p);
    assert.ok(!r.summary.conflict, JSON.stringify(r.summary));
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'skills', 'create-prd', 'SKILL.md')));
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'skills', 'plan')));
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'rules', 'git-workflow.md')));
    const instr = fs.readFileSync(path.join(proj, '.github', 'instructions', 'git-workflow.instructions.md'), 'utf8');
    assert.strictEqual(fm.parse(instr).data.applyTo, '**');
    const agent = fs.readFileSync(path.join(proj, '.github', 'agents', 'planner.agent.md'), 'utf8');
    assert.deepStrictEqual(fm.parse(agent).data.tools, ['Read', 'Grep', 'Glob']);
    assert.deepStrictEqual(plan.vendoredSkills(proj), ['create-prd']);
    require('../../lib/commands/link').recordVendored(proj, plan.vendoredSkills(proj));
    assert.deepStrictEqual(fm.parse(fs.readFileSync(path.join(proj, 'docs', 'ai', 'SYSTEM.md'), 'utf8')).data.vendored, ['create-prd']);
  });
  t('cursor/windsurf bridges appear only when enabled', () => {
    const off = plan.projectPlan(ctx, proj);
    assert.ok(!off.some(o => o.path.includes('.cursor')));
    const on = plan.projectPlan({ ...ctx, config: { ...ctx.config, bridges: { ...ctx.config.bridges, cursor: true, windsurf: true } } }, proj);
    assert.ok(on.some(o => o.path.endsWith('kiwi-agent-core.mdc')) && on.some(o => o.path.endsWith('.windsurfrules')));
  });

  console.log('\nCLI:');
  t('kiwi --help, list and doctor run under the temp HOME', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const bin = path.join(REPO, 'bin', 'kiwi.js');
    assert.ok(execFileSync('node', [bin], { env, encoding: 'utf8' }).includes('Global (run anywhere)'));
    assert.ok(execFileSync('node', [bin, 'list'], { env, encoding: 'utf8' }).includes('kiwi-system'));
    const doctor = execFileSync('node', [bin, 'doctor', '--global'], { env, encoding: 'utf8', cwd: REPO });
    assert.ok(doctor.includes('All clear'), doctor);
  });
  t('kiwi init in a fixture prints the detected mode and the prompt', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const out = execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'init'], { env, encoding: 'utf8', cwd: path.join(fixtures, 'brown') });
    assert.ok(out.includes('Detected mode: ADOPT') && out.includes('kiwi agent ADOPT') && out.includes('Set up this project'), out);
  });

  console.log('\ncontext & stamp:');
  const context = require('../../lib/commands/context');
  t('kiwi context gathers verified facts and renders markdown', () => {
    const brown = path.join(fixtures, 'brown');
    fs.writeFileSync(path.join(brown, 'package.json'), JSON.stringify({ name: 'brown', scripts: { test: 'vitest', build: 'tsc -b' }, workspaces: ['apps/*'] }));
    fs.writeFileSync(path.join(brown, 'bun.lock'), '');
    const c = context.gather(brown);
    assert.strictEqual(c.mode.mode, 'ADOPT');
    assert.deepStrictEqual(c.toolchain.packageManager, ['bun']);
    assert.strictEqual(c.toolchain.scripts.build, 'tsc -b');
    assert.ok(c.global.skills.includes('kiwi-system*'));
    const md = context.render(c);
    assert.ok(md.includes('# kiwi context — brown') && md.includes('`build`: `tsc -b`') && md.includes('runbooks/ADOPT.md'));
  });
  t('symlinked entry points are not reported as legacy files', () => {
    const det = detect.detect(proj, '3.1.0');
    assert.ok(!det.legacy.includes('CLAUDE.md') && !det.legacy.includes('.agents/rules'), JSON.stringify(det.legacy));
  });
  t('kiwi stamp records version/prd_dir/vendored and clears UPGRADE', () => {
    fs.writeFileSync(path.join(proj, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\ninitializer_version: "v2"\n---\n\n# m\n');
    assert.strictEqual(detect.detect(proj, paths.version()).mode, 'UPGRADE');
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const out = execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'stamp', '--prd-dir', 'docs/specs'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(out.includes('stamped'));
    const data = fm.parse(fs.readFileSync(path.join(proj, 'docs', 'ai', 'SYSTEM.md'), 'utf8')).data;
    assert.strictEqual(data.kiwi_version, paths.version());
    assert.strictEqual(data.prd_dir, 'docs/specs');
    assert.deepStrictEqual(data.vendored, ['create-prd']);
    assert.strictEqual(data.initializer_version, 'v2', 'other keys untouched');
    assert.strictEqual(detect.detect(proj, paths.version()).mode, 'AUDIT');
    const again = execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'stamp'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(again.includes('already stamped'));
  });
  t('doctor explains the two-step upgrade when links are fine but the AI half is pending', () => {
    const p3 = path.join(fixtures, 'proj3'); fs.mkdirSync(path.join(p3, 'docs', 'ai'), { recursive: true });
    fs.writeFileSync(path.join(p3, 'docs', 'ai', 'AGENT-CORE.md'), '# core');
    fs.writeFileSync(path.join(p3, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\n---\n');
    ops.run(plan.projectPlan(ctx, p3));
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    let out = '';
    try { out = execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'doctor', '--project'], { env, encoding: 'utf8', cwd: p3 }); } catch (e) { out = e.stdout; }
    assert.ok(out.includes('links are current') && out.includes('kiwi agent UPGRADE') && out.includes('kiwi stamp'), out);
  });
  t('kiwi agent assembles the full brief; spec and template give depth on demand', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const bin = path.join(REPO, 'bin', 'kiwi.js');
    const brief = execFileSync('node', [bin, 'agent'], { env, encoding: 'utf8', cwd: path.join(fixtures, 'brown') });
    for (const s of ['# kiwi agent — ADOPT', '## 1. Your tools', '### Global MEMORY.md', '## 3. Verified project context', '### S1 — Intake', '## 5. Runbook — ADOPT', '## 6. Templates', '`kiwi stamp`', 'Ready for owner review and commit']) assert.ok(brief.includes(s), s);
    const amend = execFileSync('node', [bin, 'agent', 'amend'], { env, encoding: 'utf8', cwd: path.join(fixtures, 'brown') });
    assert.ok(amend.includes('## 5. Runbook — AMEND') && !amend.includes('`kiwi stamp` (add'));
    const spec = execFileSync('node', [bin, 'spec', '22.3'], { env, encoding: 'utf8' });
    assert.ok(spec.startsWith('## 22.3') && spec.includes('Toolchain') && !spec.includes('## 22.4'));
    const whole = execFileSync('node', [bin, 'spec', '25'], { env, encoding: 'utf8' });
    assert.ok(whole.includes('## 25.3') && !whole.includes('# 26.'));
    const toc = execFileSync('node', [bin, 'spec', '--toc'], { env, encoding: 'utf8' });
    assert.ok(toc.includes('24.14') && toc.includes('0.0.4'));
    const tpl = execFileSync('node', [bin, 'template', 'SYSTEM'], { env, encoding: 'utf8' });
    assert.ok(tpl.includes('kiwi_version'));
    const prompt = detect.prompt({ mode: 'UPGRADE', evidence: [] }, { globalRoot: '~/.thekiwidev' });
    assert.ok(prompt.includes('kiwi agent UPGRADE'));
  });
  t('runbooks exist for every mode and the skill points at them', () => {
    for (const m of ['INIT', 'ADOPT', 'UPGRADE', 'AUDIT', 'AMEND', 'EXTEND']) assert.ok(fs.existsSync(path.join(REPO, 'skills', 'kiwi-system', 'runbooks', `${m}.md`)), m);
    const skill = fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'SKILL.md'), 'utf8');
    assert.ok(skill.includes('kiwi context') && skill.includes('kiwi stamp') && skill.includes('runbooks/UPGRADE.md') && skill.includes('Without the CLI'));
    assert.ok(fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'runbooks', '_shared.md'), 'utf8').includes('S2b — The rules decision'));
    assert.ok(fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'templates', 'docs-ai', 'ENGINEERING.md'), 'utf8').includes('## 0. Global rules in force'));
  });

  console.log('\ncaveman & context docs:');
  const cave = require('../../lib/caveman');
  const ctxlib = require('../../lib/ctx');
  t('caveman precedence: env > project .caveman.json > global config > full', () => {
    const d = path.join(fixtures, 'cave'); fs.mkdirSync(path.join(d, 'sub'), { recursive: true });
    const cfg = { ...ctx.config, caveman: { mode: 'lite' } };
    assert.deepStrictEqual(cave.effective(d, cfg).mode, 'lite');
    assert.strictEqual(cave.effective(d, cfg).source, 'global');
    fs.writeFileSync(path.join(d, '.caveman.json'), '{"defaultMode":"off"}');
    assert.strictEqual(cave.effective(path.join(d, 'sub'), cfg).mode, 'off', 'walks up');
    assert.strictEqual(cave.effective(d, cfg).source, 'project');
    process.env.CAVEMAN_DEFAULT_MODE = 'ultra';
    assert.strictEqual(cave.effective(d, cfg).source, 'env');
    delete process.env.CAVEMAN_DEFAULT_MODE;
    fs.writeFileSync(path.join(d, '.caveman.json'), '{"defaultMode":"bogus"}');
    assert.strictEqual(cave.effective(d, cfg).source, 'global', 'invalid project file ignored');
    assert.strictEqual(cave.effective(d, { ...ctx.config, caveman: {} }).mode, 'full');
  });
  t('managed block states the global caveman mode; off says off', () => {
    const on = adapters.claude.global({ ...ctx, config: { ...ctx.config, caveman: { mode: 'ultra' } } }).find(o => o.kind === 'managed');
    assert.ok(on.inner.includes('Caveman mode: **ultra**') && on.inner.includes('.caveman.json'));
    const off = adapters.codex.global({ ...ctx, config: { ...ctx.config, caveman: { mode: 'off' } } }).find(o => o.kind === 'managed');
    assert.ok(off.inner.includes('Caveman mode: off'));
  });
  t('kiwi caveman writes .caveman.json and regenerates the Antigravity pointer; inherit removes it', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const bin = path.join(REPO, 'bin', 'kiwi.js');
    execFileSync('node', [bin, 'caveman', 'ultra'], { env, encoding: 'utf8', cwd: proj });
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(proj, '.caveman.json'), 'utf8')), { defaultMode: 'ultra' });
    const pointer = fs.readFileSync(path.join(proj, '.agents', 'rules', '01-caveman.md'), 'utf8');
    assert.ok(pointer.includes('**ultra**') && pointer.includes('.caveman.json'));
    const st = execFileSync('node', [bin, 'caveman', 'status'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(st.includes('ultra') && st.includes('project'));
    execFileSync('node', [bin, 'caveman', 'inherit'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(!fs.existsSync(path.join(proj, '.caveman.json')));
    assert.ok(fs.readFileSync(path.join(proj, '.agents', 'rules', '01-caveman.md'), 'utf8').includes('global default'));
  });
  t('kiwi caveman --global updates config and mirrors upstream user config', () => {
    const homeCfg = path.join(tmpHome, '.config', 'caveman', 'config.json');
    const cfgFile = path.join(REPO, 'config.json');
    const before = fs.readFileSync(cfgFile, 'utf8');
    try {
      const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
      execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'caveman', 'lite', '--global'], { env, encoding: 'utf8' });
      assert.strictEqual(JSON.parse(fs.readFileSync(cfgFile, 'utf8')).caveman.mode, 'lite');
      assert.strictEqual(JSON.parse(fs.readFileSync(homeCfg, 'utf8')).defaultMode, 'lite');
      assert.ok(fs.readFileSync(path.join(tmpHome, '.claude', 'CLAUDE.md'), 'utf8').includes('Caveman mode: **lite**'));
    } finally { fs.writeFileSync(cfgFile, before); }
  });
  t('ctx: init → placeholder is stale; regenerate + stamp → current; source edit → stale', () => {
    const d = path.join(fixtures, 'ctxp'); fs.mkdirSync(path.join(d, 'docs', 'ai'), { recursive: true });
    fs.writeFileSync(path.join(d, 'docs', 'ai', 'SYSTEM.md'), '---\ndoc: SYSTEM\ncontext_docs: [MEMORY, NOTES]\n---\n');
    fs.writeFileSync(path.join(d, 'MEMORY.md'), '# M\n\nN-001 open.\n');
    assert.deepStrictEqual(ctxlib.status(d).map(r => r.state), ['missing', 'no-source']);
    ctxlib.init(d);
    assert.strictEqual(ctxlib.status(d)[0].state, 'stale', 'placeholder counts as stale');
    assert.strictEqual(ctxlib.stamp(d)[0].stamped, false, 'refuses to stamp a placeholder');
    const der = ctxlib.derivedPath(d, 'MEMORY');
    fs.writeFileSync(der, fs.readFileSync(der, 'utf8').replace(/<!-- REGENERATE -->[^\n]*\n[^\n]*\n/, 'N-001 open.\n'));
    assert.strictEqual(ctxlib.stamp(d)[0].stamped, true);
    assert.strictEqual(ctxlib.status(d)[0].state, 'current');
    assert.strictEqual(fm.parse(fs.readFileSync(der, 'utf8')).data.source_sha256, ctxlib.sha(path.join(d, 'MEMORY.md')));
    fs.appendFileSync(path.join(d, 'MEMORY.md'), 'more\n');
    assert.strictEqual(ctxlib.status(d)[0].state, 'stale');
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    let out = ''; let code = 0;
    try { out = execFileSync('node', [path.join(REPO, 'bin', 'kiwi.js'), 'ctx', 'status'], { env, encoding: 'utf8', cwd: d }); } catch (e) { out = e.stdout; code = e.status; }
    assert.strictEqual(code, 1); assert.ok(out.includes('stale') && out.includes('regenerate'));
  });
  t('templates, runbooks and skills carry the 3.2 sections', () => {
    const tpl = n => fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'templates', 'docs-ai', n), 'utf8');
    assert.ok(tpl('AGENT-CORE.md').includes('## 11. Output style') && tpl('AGENT-CORE.md').includes('RULE-DOC-011'));
    assert.ok(tpl('SYSTEM.md').includes('context_docs') && tpl('WORKFLOW.md').includes('8.4 Derived') && tpl('RULES.md').includes('RULE-DOC-011'));
    assert.ok(fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'runbooks', '_shared.md'), 'utf8').includes('S3b'));
    for (const s of ['caveman', 'caveman-commit', 'caveman-review', 'context-docs']) assert.ok(fs.existsSync(path.join(REPO, 'skills', s, 'SKILL.md')), s);
    assert.ok(!fs.existsSync(path.join(REPO, 'skills', 'caveman-compress')), 'caveman-compress must not be mirrored');
    assert.ok(fs.existsSync(path.join(REPO, 'rules', 'caveman.md')));
  });

  console.log('\nwrite scope (RULE-SCOPE-001):');
  const scope = require('../../lib/scope');
  t('inGlobal / resolvesToGlobal see through symlinks', () => {
    assert.ok(scope.inGlobal(REPO));
    assert.ok(!scope.inGlobal(fixtures));
    const link = path.join(fixtures, 'rules-link'); fs.symlinkSync(path.join(REPO, 'rules'), link);
    assert.ok(scope.resolvesToGlobal(path.join(link, 'testing.md')));
    assert.ok(!scope.resolvesToGlobal(path.join(fixtures, 'brown', 'package.json')));
  });
  t('kiwi new inside a project writes project files only; --global refuses without --yes', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const bin = path.join(REPO, 'bin', 'kiwi.js');
    const before = fs.readdirSync(path.join(REPO, 'rules')).length;
    execFileSync('node', [bin, 'new', 'rule', 'zz-scope-test', '--description', 'x'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'rules', 'zz-scope-test.md')));
    execFileSync('node', [bin, 'new', 'workflow', 'zz-flow', '--description', 'x'], { env, encoding: 'utf8', cwd: proj });
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'skills', 'zz-flow', 'SKILL.md')));
    assert.strictEqual(fs.readdirSync(path.join(REPO, 'rules')).length, before, 'nothing written globally');
    let code = 0; try { execFileSync('node', [bin, 'new', 'rule', 'zz-global', '--global'], { env, encoding: 'utf8', cwd: proj, stdio: 'pipe' }); } catch (e) { code = e.status; }
    assert.strictEqual(code, 1);
    assert.ok(!fs.existsSync(path.join(REPO, 'rules', 'zz-global.md')));
    code = 0; try { execFileSync('node', [bin, 'caveman', 'lite', '--global'], { env, encoding: 'utf8', cwd: proj, stdio: 'pipe' }); } catch (e) { code = e.status; }
    assert.strictEqual(code, 1, 'caveman --global refused from a project');
  });
  t('learned-skills dir is project-scoped inside a project, global inbox elsewhere', () => {
    const utils = require('../../lib/utils');
    assert.ok(utils.getLearnedSkillsDir(proj).startsWith(fs.realpathSync(proj)));
    assert.ok(utils.getLearnedSkillsDir(REPO).startsWith(fs.realpathSync(REPO)) || utils.getLearnedSkillsDir(REPO).startsWith(REPO));
    assert.ok(utils.getLearnedSkillsDir(os.tmpdir()).endsWith(path.join('learned', '_inbox')));
  });
  t('scope-guard hook blocks global-resolving writes from a project and allows them in the global folder', () => {
    const hook = path.join(REPO, 'scripts', 'hooks', 'scope-guard.js');
    const run = (cwd, file) => { try { execFileSync('node', [hook], { input: JSON.stringify({ cwd, tool_name: 'Edit', tool_input: { file_path: file } }), encoding: 'utf8', env: { ...process.env, THEKIWIDEV_AI_HOME: REPO }, stdio: 'pipe' }); return 0; } catch (e) { return e.status; } };
    assert.strictEqual(run(proj, path.join(fixtures, 'rules-link', 'testing.md')), 2, 'symlink into global → blocked');
    assert.strictEqual(run(proj, path.join(REPO, 'skills', 'new-thing', 'SKILL.md')), 2, 'new file under global → blocked');
    assert.strictEqual(run(proj, path.join(proj, 'docs', 'ai', 'NOTES.md')), 0, 'project file → allowed');
    assert.strictEqual(run(REPO, path.join(REPO, 'rules', 'testing.md')), 0, 'global session → allowed');
  });
  t('generated headers and vendored markers never instruct editing the global folder', () => {
    const { mdHeader } = require('../../lib/adapters/common');
    assert.ok(!/edit (the source|the global)/i.test(mdHeader()) && mdHeader().includes('DO NOT EDIT') && mdHeader().includes('RULE-SCOPE-001'));
    const opsSrc = fs.readFileSync(path.join(REPO, 'lib', 'ops.js'), 'utf8');
    assert.ok(!opsSrc.includes('Edit the global source instead'));
    assert.ok(fs.readFileSync(path.join(REPO, 'GLOBAL.md'), 'utf8').includes('RULE-SCOPE-001'));
    assert.ok(fs.readFileSync(path.join(REPO, 'skills', 'kiwi-system', 'runbooks', 'AMEND.md'), 'utf8').includes('which you do not edit from here'));
  });
  t('kiwi install always carries the scope guard hook, other hooks only with hooks.install', () => {
    const only = adapters.claude.global({ ...ctx, config: { ...ctx.config, hooks: { install: false, tmux: false } } }).find(o => o.kind === 'json').merge({});
    assert.deepStrictEqual(Object.keys(only.hooks), ['PreToolUse']);
    assert.strictEqual(only.hooks.PreToolUse.length, 1);
    assert.ok(only.hooks.PreToolUse[0].description.includes('Scope guard'));
    const all = adapters.claude.global({ ...ctx, config: { ...ctx.config, hooks: { install: true, tmux: false } } }).find(o => o.kind === 'json').merge({});
    assert.ok(all.hooks.SessionStart && all.hooks.PreToolUse.length > 1);
  });

  console.log('\nrebrand & uninstall:');
  t('rebrand plan renames the folder everywhere and the owner only in personal files, keeping credits', () => {
    const { plan: rplan } = require('../../lib/commands/rebrand');
    const { changes } = rplan({ home: '.jane', owner: 'jane' });
    const readme = changes.find(c => c.file === 'README.md');
    assert.ok(readme && readme.after.startsWith('# jane AI system') && readme.after.includes('raw.githubusercontent.com/thekiwidev/ai-system') && readme.after.includes('github.com:thekiwidev/ai-system'));
    assert.ok(!readme.after.includes('.thekiwidev'));
    assert.ok(!changes.some(c => c.file.startsWith('docs/archive') || c.file === 'CHANGELOG.md' || c.file.includes('UPSTREAM')));
    const rule = changes.find(c => c.file === 'docs/HANDBOOK.md');
    assert.ok(rule && rule.after.includes('~/.jane') && !rule.after.includes('jane\'s'), 'non-personal files only get the folder rename');
  });
  t('uninstall removes what install created (temp HOME)', () => {
    const env = { ...process.env, KIWI_TEST_HOME: tmpHome, THEKIWIDEV_AI_HOME: REPO, NO_COLOR: '1' };
    const bin = path.join(REPO, 'bin', 'kiwi.js');
    execFileSync('node', [bin, 'install'], { env, encoding: 'utf8' });
    assert.ok(fs.existsSync(path.join(tmpHome, '.claude', 'skills', 'caveman')));
    execFileSync('node', [bin, 'uninstall', '--yes'], { env, encoding: 'utf8' });
    assert.ok(!fs.existsSync(path.join(tmpHome, '.claude', 'skills', 'caveman')));
    assert.ok(!fs.readFileSync(path.join(tmpHome, '.claude', 'CLAUDE.md'), 'utf8').includes('kiwi:start'));
    const settings = JSON.parse(fs.readFileSync(path.join(tmpHome, '.claude', 'settings.json'), 'utf8'));
    assert.ok(!JSON.stringify(settings).includes('[kiwi]'));
    assert.ok(!fs.existsSync(path.join(tmpHome, '.gemini', 'commands', 'create-prd.toml')));
  });

  fs.rmSync(tmpHome, { recursive: true, force: true });
  fs.rmSync(fixtures, { recursive: true, force: true });
  fs.rmSync(opsDir, { recursive: true, force: true });

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
