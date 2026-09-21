/**
 * Derived context docs: agent-facing compressed copies of human-canonical docs, kept honest by
 * recording the sha256 of the source in the derived file's frontmatter.
 *
 *   source (canonical, human)   →   docs/ai/context/<NAME>.md (derived, agent-facing, caveman-ultra)
 *   MEMORY.md                        context/MEMORY.md
 *   docs/ai/NOTES.md                 context/NOTES.md
 *   CHANGELOG.md                     context/CHANGELOG.md
 *   any other docs/ai/<NAME>.md      context/<NAME>.md
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse, setKey, stringify } = require('./frontmatter');
const detect = require('./detect');

const CONTEXT_DIR = path.join('docs', 'ai', 'context');
const SOURCES = { MEMORY: 'MEMORY.md', CHANGELOG: 'CHANGELOG.md', NOTES: path.join('docs', 'ai', 'NOTES.md') };

function sourcePath(dir, name) {
  return path.join(dir, SOURCES[name] || path.join('docs', 'ai', `${name}.md`));
}
function derivedPath(dir, name) {
  return path.join(dir, CONTEXT_DIR, `${name}.md`);
}
function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Names configured in SYSTEM.md → context_docs (empty when off / unset). */
function configured(dir) {
  const sys = path.join(dir, detect.SYSTEM);
  if (!fs.existsSync(sys)) return [];
  const v = parse(fs.readFileSync(sys, 'utf8')).data.context_docs;
  return Array.isArray(v) ? v.map(String) : [];
}

/** @returns [{ name, source, derived, state: 'current'|'stale'|'missing'|'no-source', sourceSha, recordedSha }] */
function status(dir, names = configured(dir)) {
  return names.map(name => {
    const source = sourcePath(dir, name);
    const derived = derivedPath(dir, name);
    if (!fs.existsSync(source)) return { name, source, derived, state: 'no-source' };
    const sourceSha = sha(source);
    if (!fs.existsSync(derived)) return { name, source, derived, state: 'missing', sourceSha };
    const data = parse(fs.readFileSync(derived, 'utf8')).data;
    const recordedSha = data.source_sha256 || null;
    const placeholder = /<!-- REGENERATE -->/.test(fs.readFileSync(derived, 'utf8'));
    return { name, source, derived, state: recordedSha === sourceSha && !placeholder ? 'current' : 'stale', sourceSha, recordedSha, placeholder };
  });
}

/** Record the current source sha (and date) into the derived file's frontmatter. */
function stamp(dir, names = configured(dir)) {
  const out = [];
  for (const row of status(dir, names)) {
    if (row.state === 'no-source' || row.state === 'missing') { out.push({ ...row, stamped: false }); continue; }
    let text = fs.readFileSync(row.derived, 'utf8');
    if (row.placeholder) { out.push({ ...row, stamped: false, reason: 'placeholder body — regenerate first' }); continue; }
    text = setKey(text, 'source_sha256', row.sourceSha);
    text = setKey(text, 'generated_at', new Date().toISOString().slice(0, 10));
    fs.writeFileSync(row.derived, text);
    out.push({ ...row, state: 'current', stamped: true });
  }
  return out;
}

/** Create the derived skeleton for a source (frontmatter + regenerate marker). */
function init(dir, names = configured(dir)) {
  const out = [];
  for (const name of names) {
    const source = sourcePath(dir, name);
    const derived = derivedPath(dir, name);
    if (fs.existsSync(derived)) { out.push({ name, derived, created: false }); continue; }
    if (!fs.existsSync(source)) { out.push({ name, derived, created: false, reason: `source ${path.relative(dir, source)} missing` }); continue; }
    fs.mkdirSync(path.dirname(derived), { recursive: true });
    const rel = path.relative(path.dirname(derived), source).split(path.sep).join('/');
    const body = [
      '',
      `# ${name} — agent-facing context (derived)`,
      '',
      '<!-- REGENERATE -->',
      `Derived copy of \`${rel}\` in caveman-ultra register. Not generated yet: read the source instead, then regenerate this file with the \`context-docs\` skill and run \`kiwi ctx stamp\`.`,
      ''
    ].join('\n');
    fs.writeFileSync(derived, stringify({ doc: `context/${name}`, purpose: `Agent-facing compressed copy of ${rel}; never edited by hand`, authority: 'derived', source: rel, source_sha256: null, generated_at: null, register: 'caveman-ultra' }, body));
    out.push({ name, derived, created: true });
  }
  return out;
}

module.exports = { CONTEXT_DIR, SOURCES, sourcePath, derivedPath, configured, status, stamp, init, sha };
