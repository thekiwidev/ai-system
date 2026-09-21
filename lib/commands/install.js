/**
 * kiwi install — wire the global root into every enabled agent's global config.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const registry = require('../registry');
const { color, printResults, printSummary, fail } = require('../cli');

const help = `kiwi install [--dry-run] [--hooks] [--no-hooks] [--shell] [--verbose]

Wires ~/.thekiwidev (or $THEKIWIDEV_AI_HOME) into the global config of every enabled agent:
symlinks for skills/agents/rules, generated slash-command wrappers, and a managed block in
each agent's global instruction file pointing at GLOBAL.md. Idempotent — run it after every
change to the global folder.

  --dry-run   show what would change, write nothing
  --hooks     also merge hooks/hooks.json into ~/.claude/settings.json (backup written)
  --shell     append a PATH line for bin/ to your shell rc (asks first)
  --verbose   list unchanged items too`;

async function ensureGlobalRoot(dryRun) {
  const root = paths.globalRoot();
  if (fs.existsSync(root)) {
    if (!fs.existsSync(path.join(root, 'GLOBAL.md'))) {
      fail(`${paths.tilde(root)} exists but does not look like the AI system (no GLOBAL.md). Point THEKIWIDEV_AI_HOME at the right folder or remove it.`);
    }
    return root;
  }
  // First run from a checkout that is not yet the global root: link the root to this repo.
  console.log(`${paths.tilde(root)} does not exist — linking it to this checkout (${paths.REPO_ROOT}).`);
  if (!dryRun) fs.symlinkSync(paths.REPO_ROOT, root);
  return root;
}

async function run(args) {
  const dryRun = !!args.flags['dry-run'];
  const rootExisted = fs.existsSync(paths.globalRoot());
  await ensureGlobalRoot(dryRun);
  // On a dry run the root symlink is not created yet, so scan the checkout directly.
  const scanRoot = rootExisted || !dryRun ? paths.globalRoot() : paths.REPO_ROOT;

  const problems = registry.validate(scanRoot);
  if (problems.length) {
    console.log(color.yellow(`${problems.length} frontmatter problem(s) — fix these first (kiwi doctor --global lists them).`));
    for (const p of problems.slice(0, 10)) console.log(`  ${paths.tilde(p.file)}: ${p.problem}`);
    if (problems.length > 10) console.log(`  … and ${problems.length - 10} more`);
    fail('refusing to install components with invalid frontmatter');
  }

  const config = paths.loadConfig();
  if (args.flags.hooks) config.hooks.install = true;
  if (args.flags['no-hooks']) config.hooks.install = false;
  const ctx = plan.context({ config, registry: registry.all(scanRoot) });
  const gplan = plan.globalPlan(ctx);

  console.log(color.bold(`kiwi install${dryRun ? ' (dry run)' : ''}`) + color.dim(`  root ${paths.tilde(ctx.root)} · v${ctx.version} · ${ctx.registry.skills.length} skills, ${ctx.registry.agents.length} agents, ${ctx.registry.rules.length} rules`));
  const { results, summary } = ops.run(gplan, { dryRun });
  printResults(results, { verbose: !!args.flags.verbose, tilde: paths.tilde });
  printSummary(summary);

  if (summary.conflict) {
    console.log(color.red('\nConflicts were left untouched. Move the hand-written file aside (or merge it into the global folder) and re-run.'));
  }
  if (args.flags.shell) await addToShell(dryRun);
  else if (!process.env.PATH.split(path.delimiter).includes(path.join(ctx.root, 'bin'))) {
    console.log(color.dim(`\nTip: add ${paths.tilde(path.join(ctx.root, 'bin'))} to your PATH (kiwi install --shell does it) so \`kiwi\` works everywhere.`));
  }
  return summary.conflict ? 2 : 0;
}

async function addToShell(dryRun) {
  const { confirm } = require('../cli');
  if (process.platform === 'win32') {
    const bin = path.join(paths.globalRoot(), 'bin');
    console.log(`On Windows add the bin folder to your user PATH once (then open a new terminal):\n  PowerShell:  [Environment]::SetEnvironmentVariable('Path', $env:Path + ';${bin}', 'User')\n  or: setx PATH "%PATH%;${bin}"`);
    return;
  }
  const rc = process.env.SHELL && process.env.SHELL.endsWith('zsh') ? path.join(paths.home(), '.zshrc') : path.join(paths.home(), '.bashrc');
  const line = `export PATH="${paths.tilde(path.join(paths.globalRoot(), 'bin')).replace('~', '$HOME')}:$PATH" # kiwi`;
  const cur = fs.existsSync(rc) ? fs.readFileSync(rc, 'utf8') : '';
  if (cur.includes('# kiwi')) return console.log(color.dim(`PATH line already present in ${paths.tilde(rc)}`));
  if (dryRun) return console.log(`would append to ${paths.tilde(rc)}: ${line}`);
  if (await confirm(`Append to ${paths.tilde(rc)}: ${line}`)) {
    fs.appendFileSync(rc, `\n${line}\n`);
    console.log(color.green(`added — restart your shell or run: source ${paths.tilde(rc)}`));
  }
}

module.exports = { run, help };
