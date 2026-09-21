/**
 * kiwi ctx — derived context docs: status | stamp | init
 */
const fs = require('fs');
const path = require('path');
const ctx = require('../ctx');
const detect = require('../detect');
const { color, styleStatus, fail } = require('../cli');

const help = `kiwi ctx [status] | stamp [NAME,NAME] | init [NAME,NAME]

Derived context docs: agent-facing compressed copies (caveman-ultra register) of human-canonical docs,
under docs/ai/context/. Which docs: SYSTEM.md → context_docs (e.g. [MEMORY, NOTES, CHANGELOG]).
  status   current / stale / missing per doc — stale means the source changed since the derived copy
           was stamped; agents read the source instead and must regenerate. Exit 1 if anything is stale.
  stamp    after regenerating a derived copy: record the source's sha256 into its frontmatter
  init     create derived skeletons (placeholders) for configured docs that have none
Regeneration itself is the agent's job (the \`context-docs\` skill). The source is never touched.`;

const STYLE = { current: 'ok', stale: 'stale', missing: 'missing', 'no-source': 'conflict' };

function names(args) {
  const a = args._[1];
  return a ? String(a).split(',').map(s => s.trim()).filter(Boolean) : undefined;
}

async function run(args) {
  const dir = process.cwd();
  const what = args._[0] || 'status';
  if (!fs.existsSync(path.join(dir, detect.SYSTEM))) fail('no docs/ai/SYSTEM.md here — context docs are configured there (context_docs)');
  const conf = ctx.configured(dir);
  if (what === 'status') {
    if (!conf.length) { console.log(color.dim('context docs: off (SYSTEM.md → context_docs is empty or unset)')); return 0; }
    let bad = 0;
    for (const r of ctx.status(dir)) {
      if (r.state !== 'current') bad++;
      const hint = r.state === 'stale' ? `  ← source changed; regenerate from ${path.relative(dir, r.source)} then \`kiwi ctx stamp ${r.name}\`` : r.state === 'missing' ? `  ← \`kiwi ctx init ${r.name}\` then regenerate` : r.state === 'no-source' ? '  ← source file does not exist' : '';
      console.log(`  ${styleStatus(STYLE[r.state]).padEnd(18)} ${r.name.padEnd(10)} ${path.relative(dir, r.derived)}${hint}`);
    }
    console.log(bad ? color.yellow(`${bad} derived doc(s) need regeneration — agents read the sources meanwhile`) : color.green('all derived context docs current'));
    return bad ? 1 : 0;
  }
  if (what === 'stamp') {
    for (const r of ctx.stamp(dir, names(args) || conf)) {
      console.log(r.stamped ? `${color.green('stamped')}  ${r.name} ← ${path.relative(dir, r.source)} (${r.sourceSha.slice(0, 12)})` : `${styleStatus('missing')}  ${r.name}: ${r.reason || r.state}`);
    }
    return 0;
  }
  if (what === 'init') {
    for (const r of ctx.init(dir, names(args) || conf)) console.log(r.created ? `${color.green('created')}  ${path.relative(dir, r.derived)} (placeholder — regenerate, then stamp)` : `${color.dim('exists ')}  ${path.relative(dir, r.derived)}${r.reason ? ' — ' + r.reason : ''}`);
    return 0;
  }
  fail(help);
}

module.exports = { run, help };
