const paths = require('../paths');
const registry = require('../registry');
const { color } = require('../cli');

const help = `kiwi list [--json]

Lists every skill, agent and rule in the global folder. ● = invocable (gets a slash-command wrapper).`;

async function run(args) {
  const root = paths.globalRoot();
  const reg = registry.all(root);
  if (args.flags.json) { console.log(JSON.stringify(reg, null, 2)); return 0; }
  const row = (n, d, mark = ' ') => `  ${mark} ${n.padEnd(26)} ${color.dim(d.length > 90 ? d.slice(0, 87) + '…' : d)}`;
  console.log(color.bold(`skills (${reg.skills.length})`));
  for (const s of reg.skills) console.log(row(s.name, s.description, s.invocable ? '●' : ' '));
  console.log(color.bold(`\nagents (${reg.agents.length})`));
  for (const a of reg.agents) console.log(row(a.name, a.description));
  console.log(color.bold(`\nrules (${reg.rules.length})`));
  for (const r of reg.rules) console.log(row(r.name, r.description));
  return 0;
}

module.exports = { run, help };
