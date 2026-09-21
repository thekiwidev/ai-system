/**
 * kiwi template — list or print the docs/ai templates the agent writes from.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const { fail } = require('../cli');

const help = `kiwi template [name]

Without a name: list every template under skills/kiwi-system/templates/docs-ai with its path.
With a name (e.g. AGENT-CORE, SYSTEM, decisions/ADR-TEMPLATE): print it.`;

function dir() {
  return paths.g('skills', 'kiwi-system', 'templates', 'docs-ai');
}

function list() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md')) out.push(path.relative(dir(), p));
    }
  })(dir());
  return out.sort();
}

async function run(args) {
  const name = args._[0];
  if (!name) {
    for (const t of list()) console.log(`${t.replace(/\.md$/, '').padEnd(28)} ${paths.tilde(path.join(dir(), t))}`);
    return 0;
  }
  const file = path.join(dir(), name.endsWith('.md') ? name : `${name}.md`);
  if (!fs.existsSync(file)) fail(`no template "${name}" — \`kiwi template\` lists them`);
  process.stdout.write(fs.readFileSync(file, 'utf8'));
  return 0;
}

module.exports = { run, help, list, dir };
