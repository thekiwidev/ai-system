/**
 * kiwi init — detect the project's mode and hand the initializer to an agent.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const { color, fail } = require('../cli');

const help = `kiwi init [--mode MODE]

Run inside a project. Detects the mode (INIT / ADOPT / UPGRADE / AUDIT) from the filesystem and
prints the evidence plus the one sentence to say to your agent. The agent then runs \`kiwi agent\`
itself and follows the brief. You never need to drive the setup from the terminal — inside any
agent, "set up / upgrade / audit this project's AI system" does the same thing.

  --mode X    override the detected mode (INIT, ADOPT, UPGRADE, AMEND, AUDIT, EXTEND)`;

async function run(args) {
  const dir = process.cwd();
  if (fs.realpathSync(dir) === fs.realpathSync(paths.REPO_ROOT)) fail('run kiwi init inside a project, not inside the AI system itself');
  if (!fs.existsSync(paths.globalRoot())) fail(`global system not installed at ${paths.tilde(paths.globalRoot())} — run \`kiwi install\` first`);

  const det = detect.detect(dir, paths.version());
  if (args.flags.mode) det.mode = String(args.flags.mode).toUpperCase();
  const prompt = detect.prompt(det, { globalRoot: paths.tilde(paths.globalRoot()) });

  console.log(color.bold(`Detected mode: ${det.mode}`));
  for (const e of det.evidence) console.log(color.dim(`  - ${e}`));
  const hand = Object.entries(det.entryPoints).filter(([, v]) => v === 'hand-written file').map(([k]) => k);
  if (hand.length) console.log(color.yellow(`  hand-written entry points (${hand.join(', ')}) will be migrated by the skill, not overwritten`));

  console.log('\n' + color.bold('Now tell your agent (Claude Code, Codex, Gemini CLI, Antigravity, Copilot) — any of these works:') + '\n');
  console.log(`  "Set up this project's AI system"   ·   "/kiwi-system"   ·   "run kiwi agent and follow it"`);
  console.log(color.dim(`\nIt runs \`kiwi agent ${det.mode}\` itself and follows the brief. Or paste this:`) + '\n');
  console.log(prompt);
  console.log(color.dim('\nThe agent asks you what the repository cannot answer, writes docs/ai/, and finishes with `kiwi stamp` so `kiwi doctor` clears.'));
  return 0;
}

module.exports = { run, help };
