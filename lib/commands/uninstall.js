/**
 * kiwi uninstall — remove everything `kiwi install` put into the agents' global config.
 * Leaves the checkout, ~/.<home> link and every project untouched.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const managed = require('../managed');
const { color, confirm, fail } = require('../cli');

const help = `kiwi uninstall [--yes] [--dry-run]

Removes the symlinks, generated wrappers, managed blocks and [kiwi] hooks that \`kiwi install\` created
in ~/.claude, ~/.codex, ~/.agents, ~/.gemini and ~/.copilot. Your projects and the checkout are untouched.
To remove the system itself afterwards: delete the checkout and the ~/.<home> link.`;

async function run(args) {
  const dry = !!args.flags['dry-run'];
  const ctx = plan.context();
  const gplan = plan.globalPlan(ctx);
  console.log(color.bold(`kiwi uninstall${dry ? ' (dry run)' : ''}`) + color.dim(`  ${gplan.length} items`));
  if (!dry && !args.flags.yes && !(await confirm('Remove all kiwi links, wrappers, managed blocks and hooks from the agents\' global config?'))) return 0;
  let n = 0;
  for (const op of gplan) {
    const state = ops.inspect(op);
    if (state === 'missing') continue;
    if (op.kind === 'symlink' && ops.isSymlink(op.path)) { if (!dry) fs.unlinkSync(op.path); n++; }
    else if (op.kind === 'file' && (ops.read(op.path) || '').includes(ops.GENERATED_MARK)) { if (!dry) fs.unlinkSync(op.path); n++; }
    else if (op.kind === 'managed') {
      const text = ops.read(op.path) || '';
      const re = new RegExp(`${managed.START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${managed.END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n*`);
      if (re.test(text)) { if (!dry) fs.writeFileSync(op.path, text.replace(re, '')); n++; }
    } else if (op.kind === 'json') {
      try {
        const s = JSON.parse(ops.read(op.path));
        if (s.hooks) {
          for (const ev of Object.keys(s.hooks)) { s.hooks[ev] = s.hooks[ev].filter(e => !(e.description || '').startsWith('[kiwi]')); if (!s.hooks[ev].length) delete s.hooks[ev]; }
          if (!Object.keys(s.hooks).length) delete s.hooks;
          if (!dry) fs.writeFileSync(op.path, JSON.stringify(s, null, 2) + '\n');
          n++;
        }
      } catch { /* leave */ }
    }
  }
  console.log(color.green(`${dry ? 'would remove' : 'removed'} ${n} item(s)`));
  console.log(color.dim(`checkout and ${paths.tilde(paths.globalRoot())} link left in place; delete them yourself if you want the system gone.`));
  return 0;
}

module.exports = { run, help };
