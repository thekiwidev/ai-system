/**
 * kiwi agent — the one command an AI agent runs. Its output is the complete brief for the
 * detected (or given) mode: tools, verified project context, the shared steps, the mode
 * runbook, the global memory/notes, templates, and how to finish. The agent follows it.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const context = require('./context');
const template = require('./template');
const { fail } = require('../cli');

const MODES = ['INIT', 'ADOPT', 'UPGRADE', 'AUDIT', 'AMEND', 'EXTEND'];

const help = `kiwi agent [MODE] [--brief]

For AI agents. Run it inside a project and follow the output top to bottom. It contains:
the mode (detected, or the one you pass — AMEND / EXTEND must be passed), the tools you may
run, the verified project context, the shared steps, the runbook for the mode, the owner's
global memory and notes, the templates, and the finishing checklist. Read-only.
  --brief   omit the project context (you already ran \`kiwi context\`)`;

function read(p) { return fs.readFileSync(p, 'utf8'); }
function runbook(name) { return read(paths.g('skills', 'kiwi-system', 'runbooks', name)); }
function stripTitle(md) { return md.replace(/^# .*\n+/, ''); }
/** Push every heading down one level so embedded documents nest under the brief's sections. */
function demote(md) { return md.replace(/^(#{1,5})\s/gm, '#$1 '); }

async function run(args) {
  const dir = process.cwd();
  if (!fs.existsSync(paths.globalRoot())) fail(`global system not installed at ${paths.tilde(paths.globalRoot())} — run \`kiwi install\` from the checkout first`);
  const det = detect.detect(dir, paths.version());
  const mode = args._[0] ? String(args._[0]).toUpperCase() : det.mode;
  if (!MODES.includes(mode)) fail(`unknown mode "${mode}" — one of ${MODES.join(', ')}`);
  const root = paths.tilde(paths.globalRoot());
  const kiwi = 'kiwi';
  const L = [];

  L.push(`# kiwi agent — ${mode} on ${path.basename(dir)}`, '');
  L.push(`You are the **AI Project System Initializer** (the \`kiwi-system\` skill, v${paths.version()}). This document is your complete brief. Follow it **top to bottom**; stop at every **STOP** and wait for the owner; never perform a Git operation; never guess a project fact; never overwrite existing knowledge. When you need more depth than this brief gives, pull it with the tools below rather than reading the whole specification.`, '');
  if (mode !== det.mode) L.push(`> Mode **${mode}** was requested explicitly; the filesystem alone would say ${det.mode}. ${mode === 'AMEND' || mode === 'EXTEND' ? 'That is expected — this mode comes from the owner\'s intent.' : 'Confirm with the owner that the override is intended before writing anything.'}`, '');

  L.push('## 1. Your tools', '', 'All safe: read-only or idempotent, none touches Git. If `kiwi` is not on PATH use `~/.thekiwidev/bin/kiwi`.', '');
  L.push('| Command | Use it for |', '| --- | --- |');
  L.push(`| \`${kiwi} context\` | re-read the verified project brief (already included below) |`);
  L.push(`| \`${kiwi} spec <n>\` · \`${kiwi} spec --toc\` · \`${kiwi} spec --find <text>\` | print one section of the initializer specification (e.g. \`${kiwi} spec 22.3\`) — depth on demand |`);
  L.push(`| \`${kiwi} template\` · \`${kiwi} template <NAME>\` | list / print a docs/ai template to write from |`);
  L.push(`| \`${kiwi} list\` | every global skill (● invocable), agent and rule |`);
  L.push(`| \`${kiwi} link\` | after docs/ai/AGENT-CORE.md exists: entry-point symlinks + adapters (reports hand-written files as conflicts, never overwrites) |`);
  L.push(`| \`${kiwi} vendor <a,b>\` | only if the owner wants cloud agents / teammates covered: copy global skills + rules into .agents/ |`);
  L.push(`| \`${kiwi} stamp [--prd-dir P]\` | **last step of INIT / ADOPT / UPGRADE** — records kiwi_version etc. in SYSTEM.md; until it runs, \`kiwi doctor\` reports the project as behind |`);
  L.push(`| \`${kiwi} doctor --project\` | end of every mode; paste its output into your report |`);
  L.push('');

  const eff = require('../caveman').effective(dir);
  L.push('## 2. The owner\'s global layer  — READ-ONLY from this project (RULE-SCOPE-001)', '');
  L.push('Nothing in this section, and nothing under `~/.thekiwidev` or the agent skills/rules directories that link to it, is edited from this repository. Cross-project facts you discover go into your report as proposals; project facts go into this project\'s files.', '');
  L.push(`Output style right now: ${require('../caveman').statement(eff.mode, { scope: eff.source === 'project' ? 'project' : 'global' })}`, '');
  L.push(`Constitution: \`${root}/GLOBAL.md\` (already in your global instructions; re-read § 2 non-negotiables and § 7 two layers if unsure). Global skills/agents/rules: \`${root}/{skills,agents,rules}/\`. Project documents win on conflict; the global layer fills gaps. Project facts never go into the global files — propose them in your report instead.`, '');
  const reg = require('../registry').all(paths.globalRoot());
  L.push('### Global rules (for the rules decision — adopt / override / not applicable, per project)', '');
  for (const r of reg.rules) L.push(`- \`${r.name}\` — ${r.description}`);
  L.push('');
  for (const f of ['MEMORY.md', 'NOTES.md']) {
    const p = paths.g(f);
    if (fs.existsSync(p)) L.push(`### Global ${f}`, '', demote(demote(stripTitle(read(p)))).trim(), '');
  }

  if (!args.flags.brief) {
    L.push('## 3. Verified project context', '');
    L.push(demote(stripTitle(context.render(context.gather(dir))).replace(/\n---\nNext:.*\n?$/s, '')).trim(), '');
  } else {
    L.push('## 3. Verified project context', '', `(omitted — run \`${kiwi} context\`)`, '');
  }

  L.push('## 4. Shared steps (every mode)', '', demote(stripTitle(runbook('_shared.md'))).trim(), '');
  L.push(`## 5. Runbook — ${mode}`, '', demote(stripTitle(runbook(`${mode}.md`))).trim(), '');

  L.push('## 6. Templates', '', `Write every document from its template (\`${kiwi} template <NAME>\`); keep the frontmatter contract; replace every \`{{placeholder}}\`; delete guidance comments and inapplicable headings.`, '');
  for (const t of template.list()) L.push(`- \`${t.replace(/\.md$/, '')}\``);
  L.push('');

  L.push('## 7. Finish', '');
  L.push(`1. \`${kiwi} link\` — resolve any conflict by migrating the hand-written file (spec §22.9), never by overwriting.`);
  if (['INIT', 'ADOPT', 'UPGRADE'].includes(mode)) L.push(`2. \`${kiwi} stamp\` (add \`--prd-dir <path>\` if PRDs live elsewhere than \`docs/ai/prd/\`).`);
  L.push(`${['INIT', 'ADOPT', 'UPGRADE'].includes(mode) ? 3 : 2}. \`${kiwi} doctor --project\` — must be clean; include its output.`);
  L.push(`${['INIT', 'ADOPT', 'UPGRADE'].includes(mode) ? 4 : 3}. Report in the mode's format (spec ${({ INIT: '§18', ADOPT: '§22.13', UPGRADE: '§24.13', AUDIT: '§27.4', AMEND: '§25.14', EXTEND: '§24.9 step 8' })[mode]}), list any global MEMORY/NOTES entries you propose, and end with: **No branch, stage, commit or history operation was performed. Ready for owner review and commit.** Then ask whether the owner wants a commit made.`);
  L.push('');
  console.log(L.join('\n'));
  return 0;
}

module.exports = { run, help, MODES };
