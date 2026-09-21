#!/usr/bin/env node
/**
 * kiwi — thekiwidev's universal AI system CLI.
 * Zero dependencies. Node >= 18.
 */
const path = require('path');
const { parseArgs, color, fail } = require('../lib/cli');
const paths = require('../lib/paths');

const COMMANDS = {
  install: () => require('../lib/commands/install'),
  doctor: () => require('../lib/commands/doctor'),
  init: () => require('../lib/commands/init'),
  link: () => require('../lib/commands/link'),
  vendor: () => ({ run: (a) => require('../lib/commands/link').run(a, { vendor: true }), help: require('../lib/commands/link').help }),
  export: () => ({ run: (a) => require('../lib/commands/link').run(a, { vendor: true }), help: require('../lib/commands/link').help }),
  upgrade: () => require('../lib/commands/upgrade'),
  agent: () => require('../lib/commands/agent'),
  context: () => require('../lib/commands/context'),
  spec: () => require('../lib/commands/spec'),
  template: () => require('../lib/commands/template'),
  stamp: () => require('../lib/commands/stamp'),
  caveman: () => require('../lib/commands/caveman'),
  ctx: () => require('../lib/commands/ctx'),
  rebrand: () => require('../lib/commands/rebrand'),
  uninstall: () => require('../lib/commands/uninstall'),
  new: () => require('../lib/commands/new'),
  list: () => require('../lib/commands/list'),
  sync: () => ({ run: require('../lib/commands/git').sync, help: require('../lib/commands/git').helpSync }),
  publish: () => ({ run: require('../lib/commands/git').publish, help: require('../lib/commands/git').helpPublish })
};

const USAGE = `${color.bold('kiwi')} — thekiwidev's universal AI system  ${color.dim('v' + paths.version())}

Global (run anywhere)
  install    wire ~/.thekiwidev into every agent's global config (idempotent)
  doctor     check links, managed blocks, frontmatter; report drift (read-only)
  list       show every skill, agent and rule
  new        scaffold a skill | workflow | agent | rule
  caveman    show or set the caveman output-style mode: off|lite|full|ultra (--global) or per project (inherit)
  rebrand    make it yours: --home .<name> [--owner <handle>] (run once, before install)
  uninstall  remove everything install put into the agents' global config
  sync       git pull the global folder, then re-install
  publish    git push the global folder (never commits)

Project (inside a repo — normally the AGENT runs these via the kiwi-system skill)
  init       detect mode and print what to say to your agent (optional — saying it in the agent suffices)
  link       create/repair AGENTS.md, CLAUDE.md, GEMINI.md, Copilot + Antigravity adapters
  vendor     link + copy global skills/rules into the repo for cloud agents / teammates (alias: export)
  upgrade    repair links + vendored copies, print what to say to your agent (optional — the agent does it)
  agent      FOR AI AGENTS: the complete brief for the detected mode — run it and follow the output
  context    verified project brief (read-only); spec <n> / template <name>: depth on demand
  stamp      record kiwi_version/prd_dir/vendored in docs/ai/SYSTEM.md — the agent's last step
  ctx        derived context docs: status | stamp | init (agent-facing copies of MEMORY/NOTES/CHANGELOG)

kiwi <command> --help for details.  Global root: ${paths.tilde(paths.globalRoot())}${process.env.THEKIWIDEV_AI_HOME ? ' (THEKIWIDEV_AI_HOME)' : ''}`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args._.shift();
  if (!name || name === 'help' || args.flags.help && !name) {
    console.log(USAGE);
    return 0;
  }
  const load = COMMANDS[name];
  if (!load) fail(`unknown command "${name}"\n\n${USAGE}`);
  const cmd = load();
  if (args.flags.help || args.flags.h) {
    console.log(cmd.help);
    return 0;
  }
  return cmd.run(args);
}

main().then(code => process.exit(typeof code === 'number' ? code : 0)).catch(err => {
  console.error(color.red('error: ') + (err.stack || err.message));
  process.exit(1);
});
