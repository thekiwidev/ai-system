/**
 * kiwi rebrand — make this system yours: rename the global folder (~/.thekiwidev → ~/.<name>) and the
 * owner handle across the checkout. Used by bin/setup.js for new adopters; safe to run again.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const { color, fail } = require('../cli');

const help = `kiwi rebrand --home <folder> [--owner <handle>] [--dry-run]

Rewrites the checkout so the global folder is ~/.<folder> instead of ~/.thekiwidev and the owner's
handle replaces "thekiwidev" in the personal files (GLOBAL.md, MEMORY.md, NOTES.md, README title,
package.json). Skips docs/archive, CHANGELOG.md, mirrored upstream files and the credits line.
Run it from inside the checkout, before \`kiwi install\`. Example: kiwi rebrand --home .jane --owner jane`;

const SKIP = [/^docs\/archive\//, /^CHANGELOG\.md$/, /^node_modules\//, /^\.git\//, /UPSTREAM/, /^skills\/caveman(-commit|-review)?\/SKILL\.md$/];
const OWNER_FILES = ['GLOBAL.md', 'MEMORY.md', 'NOTES.md', 'AGENTS.md', 'README.md', 'package.json'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(paths.REPO_ROOT, p);
    if (SKIP.some(re => re.test(rel))) continue;
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(md|js|json|toml|cmd|sh|ps1)$/.test(e.name)) out.push(p);
  }
  return out;
}

function plan({ home, owner }) {
  const folder = home.replace(/^\./, '');
  const changes = [];
  for (const file of walk(paths.REPO_ROOT)) {
    const rel = path.relative(paths.REPO_ROOT, file);
    const before = fs.readFileSync(file, 'utf8');
    let after = before.split('.thekiwidev').join(`.${folder}`);
    if (owner && OWNER_FILES.includes(rel)) {
      // owner handle, but never the credits / upstream references
      // keep repo/credit references (github.com/thekiwidev/…, github:thekiwidev/…, @thekiwidev/…) intact
      after = after.replace(/(?<![/:@])thekiwidev/g, owner);
    }
    if (after !== before) changes.push({ file: rel, count: (before.match(/thekiwidev/g) || []).length });
    if (after !== before) changes[changes.length - 1].after = after;
  }
  return { folder, changes };
}

async function run(args) {
  const home = args.flags.home;
  if (!home) fail(help);
  if (!/^\.?[a-z0-9][a-z0-9-]*$/i.test(home)) fail('folder name must be like .jane or jane (letters, digits, dashes)');
  const owner = args.flags.owner ? String(args.flags.owner) : null;
  const { folder, changes } = plan({ home, owner });
  console.log(color.bold(`kiwi rebrand${args.flags['dry-run'] ? ' (dry run)' : ''}`) + color.dim(`  folder ~/.${folder}${owner ? ` · owner ${owner}` : ''} · ${changes.length} file(s)`));
  for (const c of changes) {
    if (!args.flags['dry-run']) fs.writeFileSync(path.join(paths.REPO_ROOT, c.file), c.after);
    console.log(`  ${args.flags['dry-run'] ? 'would update' : 'updated'}  ${c.file}`);
  }
  if (!changes.length) console.log(color.dim('  nothing to change'));
  else if (!args.flags['dry-run']) console.log(color.dim(`\nnext: link the folder — ln -s "${paths.REPO_ROOT}" ~/.${folder} (setup.js does this) — then kiwi install`));
  return 0;
}

module.exports = { run, help, plan };
