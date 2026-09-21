#!/usr/bin/env node
/**
 * First-time setup for a new person or a new machine. Cross-platform (macOS, Linux, Windows; Node >= 18).
 *
 *   node bin/setup.js                       interactive
 *   node bin/setup.js --owner jane --home .jane --yes       non-interactive
 *   node bin/setup.js --mine --yes          the original owner on a new machine: no rebrand, no fresh memory
 *
 * What it does, in order:
 *   1. checks Node >= 18 and that this is a checkout of the system
 *   2. asks owner handle + global folder name (default: .<owner>)
 *   3. rebrands the checkout if the folder/owner differ from the defaults (kiwi rebrand)
 *   4. writes fresh personal MEMORY.md / NOTES.md for a new owner (yours are not inherited)
 *   5. links ~/.<folder> → this checkout (or moves it there with --move)
 *   6. runs kiwi install (--shell on macOS/Linux adds bin/ to PATH)
 * It never runs Git.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? undefined : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const YES = !!flag('yes');

function die(msg) { console.error('setup: ' + msg); process.exit(1); }
function ask(q, def) {
  if (YES) return Promise.resolve(def);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(`${q}${def !== undefined ? ` [${def}]` : ''}: `, a => { rl.close(); res(a.trim() || def); }));
}
function kiwi(...a) { execFileSync(process.execPath, [path.join(ROOT, 'bin', 'kiwi.js'), ...a], { stdio: 'inherit' }); }

async function main() {
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 18) die(`Node 18+ required (found ${process.versions.node})`);
  if (!fs.existsSync(path.join(ROOT, 'GLOBAL.md')) || !fs.existsSync(path.join(ROOT, 'bin', 'kiwi.js'))) die('run this from a checkout of the AI system (bin/setup.js)');

  const current = fs.readFileSync(path.join(ROOT, 'lib', 'paths.js'), 'utf8').match(/'\.([a-z0-9-]+)'\)/i);
  const currentFolder = current ? current[1] : 'thekiwidev';
  console.log(`\nthekiwidev AI system — setup (${os.platform()}, node ${process.versions.node})\n`);

  let owner, folder;
  if (flag('mine')) { owner = null; folder = currentFolder; }
  else {
    owner = flag('owner') || await ask('Your handle (used in GLOBAL.md / memory; letters, digits, dashes)', os.userInfo().username.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(owner)) die('handle must be letters, digits, dashes');
    folder = String(flag('home') || await ask('Global folder name in your home directory', `.${owner}`)).replace(/^\./, '');
  }
  const home = path.join(os.homedir(), `.${folder}`);
  const rebrand = folder !== currentFolder || (owner && owner !== 'thekiwidev');

  if (rebrand) {
    console.log(`\n→ rebranding checkout: folder ~/.${folder}${owner ? `, owner ${owner}` : ''}`);
    kiwi('rebrand', '--home', `.${folder}`, ...(owner ? ['--owner', owner] : []));
  }
  if (owner && owner !== 'thekiwidev') {
    console.log('→ writing fresh personal MEMORY.md and NOTES.md (the original owner\'s are not inherited)');
    fs.writeFileSync(path.join(ROOT, 'MEMORY.md'), freshMemory(owner, folder));
    fs.writeFileSync(path.join(ROOT, 'NOTES.md'), freshNotes());
    // config: caveman default asked once
    const mode = String(flag('caveman') || await ask('Caveman output style by default (off | lite | full | ultra)', 'full')).toLowerCase();
    if (!['off', 'lite', 'full', 'ultra'].includes(mode)) die('caveman mode must be off, lite, full or ultra');
    const cfgPath = path.join(ROOT, 'config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); cfg.caveman = { ...(cfg.caveman || {}), mode };
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  }

  // link the home folder
  if (fs.existsSync(home)) {
    let real = null; try { real = fs.realpathSync(home); } catch { /* broken */ }
    if (real !== fs.realpathSync(ROOT)) die(`${home} already exists and is not this checkout. Remove it or choose another folder name (--home).`);
    console.log(`→ ${home} already points here`);
  } else {
    console.log(`→ linking ${home} → ${ROOT}`);
    fs.symlinkSync(ROOT, home, process.platform === 'win32' ? 'junction' : undefined);
  }

  console.log('\n→ kiwi install\n');
  kiwi('install', ...(process.platform === 'win32' ? [] : ['--shell']), ...(YES ? [] : []));

  console.log(`
Done. Next:
  1. Open a new terminal so \`kiwi\` is on your PATH${process.platform === 'win32' ? ' (add ' + path.join(home, 'bin') + ' to PATH first — see above)' : ''}.
  2. Read ~/.${folder}/GLOBAL.md and make it yours — it is loaded by every agent.
  3. In any project, open your agent and say: "set up this project's AI system".
  4. Keep it in your own Git: cd ~/.${folder} && git remote set-url origin <your repo>   (kiwi never commits for you)
Docs: ~/.${folder}/docs/HANDBOOK.md · kiwi --help
`);
}

function freshMemory(owner, folder) {
  return `# MEMORY — global (cross-project) current state

> What is true about **me and my environment across every project**. Project facts never go here — they live in that project's \`MEMORY.md\`. Rewritten when reality changes; never a diary; no secrets. Agents: read at session start (via \`GLOBAL.md\`); propose an addition only for a durable, cross-project fact, and never write here from a project session (RULE-SCOPE-001).

## Who I am

- \`${owner}\`. The global AI system is \`~/.${folder}\`; the \`kiwi\` CLI is on my PATH.

## Environment defaults

- <!-- OS, shell, package managers, "dev servers are mine to run", anything every project shares -->

## Projects with a \`docs/ai/\` system

<!-- One line per project: path · kiwi_version · one-phrase description. -->

## Preferences agents keep getting wrong

<!-- Durable, cross-project corrections only. -->
`;
}
function freshNotes() {
  return `# NOTES — global (cross-project) observations

> Gotchas, workarounds and lessons that apply across projects or to the tools themselves — not to one codebase (those go in that project's \`docs/ai/NOTES.md\`). Each note: ID (\`G-###\`, never reused), date, status (\`open\` · \`deferred\` · \`deliberate\` · \`resolved\`), context. Agents propose additions; they are written only from the global folder.
`;
}

main().catch(e => die(e.message));
