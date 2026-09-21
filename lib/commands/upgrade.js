/**
 * kiwi upgrade — bring a project's system up to the current kiwi version.
 * Deterministic part: repair links, refresh vendored copies. Intelligent part: the AI's UPGRADE mode.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const link = require('./link');
const { color, fail } = require('../cli');

const help = `kiwi upgrade [--dry-run]

Two steps. Step 1 (this command, deterministic): repair entry points and refresh any vendored
skills/rules from the global folder. Step 2 (an agent): the kiwi-system skill in UPGRADE mode
computes the scaffolding delta (never touching project knowledge), asks for approval, applies it,
and runs \`kiwi stamp\` — only then does \`kiwi doctor\` stop reporting UPGRADE.
You do not need this command from the terminal: inside any agent, "upgrade this project's AI system"
makes the agent run both steps itself.
To update the global folder itself, use \`kiwi sync\`.`;

async function run(args) {
  const dir = process.cwd();
  if (!fs.existsSync(path.join(dir, detect.CORE))) fail('no docs/ai/AGENT-CORE.md here — use `kiwi init` for a project without a system');
  const det = detect.detect(dir, paths.version());
  console.log(color.bold(`Project system: ${det.kiwiVersion ? 'kiwi ' + det.kiwiVersion : 'pre-kiwi (v2 initializer)'} → kiwi ${det.currentVersion}`));

  const code = await link.run(args, { vendor: false });
  if (args.flags['dry-run']) return code;

  det.mode = 'UPGRADE';
  const prompt = detect.prompt(det, { globalRoot: paths.tilde(paths.globalRoot()) });
  console.log('\n' + color.bold('Step 1 of 2 done (links). Step 2 is the agent\'s — tell it: "upgrade this project\'s AI system"') + '\n');
  console.log(color.dim('It runs `kiwi agent UPGRADE` itself and follows the brief. Or paste this:') + '\n');
  console.log(prompt);
  console.log(color.dim('\nThe agent shows you the delta table, waits for approval, applies it, and finishes with `kiwi stamp`; `kiwi doctor` clears after that.'));
  return code;
}

module.exports = { run, help };
