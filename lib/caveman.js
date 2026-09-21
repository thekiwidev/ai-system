/**
 * Caveman mode resolution — the same precedence upstream's hooks use, so both agree:
 *   CAVEMAN_DEFAULT_MODE env → project .caveman.json / .caveman/config.json (walking up) → global config → 'full'
 */
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const MODES = ['off', 'lite', 'full', 'ultra'];
const PROJECT_FILE = '.caveman.json';

function readMode(file) {
  try {
    if (!fs.lstatSync(file).isFile()) return null;
    const m = JSON.parse(fs.readFileSync(file, 'utf8')).defaultMode;
    return typeof m === 'string' && MODES.includes(m.toLowerCase()) ? m.toLowerCase() : null;
  } catch { return null; }
}

/** Project-level file that sets the mode, searched upward from dir (upstream semantics). */
function projectFile(dir) {
  let d = path.resolve(dir);
  for (let i = 0; i < 64; i++) {
    for (const rel of ['.caveman/config.json', PROJECT_FILE]) {
      const f = path.join(d, rel);
      if (readMode(f)) return f;
    }
    const parent = path.dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

/** Upstream's user config path (mirrored by `kiwi caveman --global`). */
function userConfigPath() {
  if (process.env.XDG_CONFIG_HOME) return path.join(process.env.XDG_CONFIG_HOME, 'caveman', 'config.json');
  return path.join(paths.home(), '.config', 'caveman', 'config.json');
}

/** @returns {{ mode, source: 'env'|'project'|'global'|'default', file }} */
function effective(dir, config = paths.loadConfig()) {
  const env = process.env.CAVEMAN_DEFAULT_MODE;
  if (env && MODES.includes(env.toLowerCase())) return { mode: env.toLowerCase(), source: 'env', file: null };
  const pf = dir ? projectFile(dir) : null;
  if (pf) return { mode: readMode(pf), source: 'project', file: pf };
  const g = config.caveman && MODES.includes(config.caveman.mode) ? config.caveman.mode : null;
  if (g) return { mode: g, source: 'global', file: paths.g('config.json') };
  return { mode: 'full', source: 'default', file: null };
}

/** One-line statement agents can act on, used in managed blocks, pointers and briefs. */
function statement(mode, { scope = 'global' } = {}) {
  const root = paths.tilde(paths.globalRoot());
  if (mode === 'off') {
    return `Caveman mode: off${scope === 'global' ? ' by default' : ' for this project'} — answer in normal prose; \`/caveman lite|full|ultra\` turns it on for a session (skill: ${root}/skills/caveman/SKILL.md).`;
  }
  const level = { lite: 'lite: no filler, hedging or pleasantries; keep articles and full sentences, stay tight.', full: 'full: drop articles (a/an/the), filler, pleasantries, hedging; fragments OK; short synonyms; no preamble, no tool-call narration, no decorative tables/emoji.', ultra: 'ultra: as full, plus drop excess conjunctions; one word when one word enough; each fact once.' }[mode];
  return [
    `Caveman mode: **${mode}**${scope === 'global' ? ' by default' : ' for this project'}${scope === 'global' ? " (a project's `.caveman.json` overrides this)" : ''}. Apply it to every chat reply, this one included, until "/caveman off" or "normal mode":`,
    `- ${level}`,
    '- Pattern: [thing] [action] [reason]. [next step]. Not "Sure! I\'d be happy to help…" — yes "Bug in auth middleware. Fix:".',
    '- Technical terms, code, commands, paths, numbers and exact error strings stay verbatim. No invented abbreviations, no arrows.',
    '- Auto-clarity: full clear sentences for security warnings, irreversible actions, multi-step sequences that could be misread, or when the owner seems confused; then resume.',
    `- Chat only: code, comments, commits, PR text, docs, memory, notes, PRDs — everything persisted — stay normal prose. Full rulebook and levels: ${root}/skills/caveman/SKILL.md (\`/caveman lite|full|ultra\`).`
  ].join('\n');
}

module.exports = { MODES, PROJECT_FILE, effective, projectFile, userConfigPath, statement, readMode };
