/**
 * kiwi stamp — record in docs/ai/SYSTEM.md that this project's system is current with the global
 * system: kiwi_version, global_system, prd_dir, vendored. The agent runs it as the last step of
 * INIT / ADOPT / UPGRADE, after the documents have actually landed. Touches only those four keys.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const plan = require('../plan');
const { setKey, parse } = require('../frontmatter');
const { color, fail } = require('../cli');

const help = `kiwi stamp [--prd-dir <path>]

Writes kiwi_version, global_system, prd_dir and vendored into docs/ai/SYSTEM.md's frontmatter.
Run it LAST, after the AI half of INIT / ADOPT / UPGRADE has landed — it is what makes
\`kiwi doctor\` report the project as current. Refuses to run without docs/ai/SYSTEM.md.`;

async function run(args) {
  const dir = process.cwd();
  const sys = path.join(dir, detect.SYSTEM);
  if (!fs.existsSync(path.join(dir, detect.CORE))) fail('docs/ai/AGENT-CORE.md is missing — nothing to stamp');
  if (!fs.existsSync(sys)) fail('docs/ai/SYSTEM.md is missing — create it from ~/.thekiwidev/skills/kiwi-system/templates/docs-ai/SYSTEM.md first, then stamp');
  const before = fs.readFileSync(sys, 'utf8');
  const data = parse(before).data;
  const prdDir = args.flags['prd-dir'] || data.prd_dir || paths.loadConfig().prdDir;
  let text = before;
  text = setKey(text, 'kiwi_version', paths.version());
  text = setKey(text, 'global_system', process.env.THEKIWIDEV_AI_HOME || '~/.thekiwidev');
  text = setKey(text, 'prd_dir', prdDir);
  text = setKey(text, 'vendored', plan.vendoredSkills(dir));
  if (text === before) { console.log(color.dim(`${detect.SYSTEM} already stamped at kiwi ${paths.version()}`)); return 0; }
  fs.writeFileSync(sys, text);
  console.log(color.green('stamped ') + `${detect.SYSTEM}: kiwi_version ${paths.version()}, prd_dir ${prdDir}, vendored [${plan.vendoredSkills(dir).join(', ')}]`);
  console.log(color.dim('Now run `kiwi doctor --project` — it should be clear.'));
  return 0;
}

module.exports = { run, help };
