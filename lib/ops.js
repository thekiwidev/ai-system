/**
 * Declarative filesystem ops with dry-run, idempotence and conflict reporting.
 *
 * Op kinds:
 *   { kind: 'mkdir',   path }
 *   { kind: 'symlink', path, target }                     ensure `path` → `target`
 *   { kind: 'managed', path, inner }                      ensure managed block in file (create if absent)
 *   { kind: 'file',    path, content }                    generated file; only overwrites files carrying GENERATED_MARK
 *   { kind: 'copy',    path, source }                     vendored copy (dir or file); overwrites only kiwi-vendored copies
 *   { kind: 'json',    path, merge(existing) → next }     JSON file merge with backup
 *
 * Every op carries `why` (short label) and `agent` (which adapter produced it).
 * Results: created | updated | ok | conflict | skipped(+reason)
 */
const fs = require('fs');
const path = require('path');
const managed = require('./managed');

const GENERATED_MARK = 'generated-by: kiwi';
const VENDOR_MARK = '.kiwi-vendored';

function exists(p) {
  try { fs.lstatSync(p); return true; } catch { return false; }
}
function isSymlink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}
function readlink(p) {
  try { return fs.readlinkSync(p); } catch { return null; }
}
function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

/** Inspect one op against the filesystem without changing anything. */
function inspect(op) {
  switch (op.kind) {
    case 'mkdir':
      return exists(op.path) ? 'ok' : 'missing';
    case 'symlink': {
      if (!exists(op.path)) return 'missing';
      if (!isSymlink(op.path)) return 'conflict';
      const cur = readlink(op.path);
      const want = op.target;
      const same = cur === want || path.resolve(path.dirname(op.path), cur) === path.resolve(path.dirname(op.path), want);
      if (!same) return 'stale';
      return fs.existsSync(op.path) ? 'ok' : 'broken';
    }
    case 'managed':
      return managed.status(read(op.path), op.inner);
    case 'file': {
      const cur = read(op.path);
      if (cur === null) return 'missing';
      if (cur === op.content) return 'ok';
      return cur.includes(GENERATED_MARK) ? 'stale' : 'conflict';
    }
    case 'copy': {
      if (!exists(op.path)) return 'missing';
      const markPath = fs.statSync(op.source).isDirectory() ? path.join(op.path, VENDOR_MARK) : op.path + VENDOR_MARK;
      if (!exists(markPath)) return 'conflict';
      return sameTree(op.source, op.path) ? 'ok' : 'stale';
    }
    case 'json': {
      const cur = read(op.path);
      let parsed = {};
      try { parsed = cur ? JSON.parse(cur) : {}; } catch { return 'conflict'; }
      const next = op.merge(parsed);
      return JSON.stringify(next) === JSON.stringify(parsed) ? 'ok' : (cur === null ? 'missing' : 'stale');
    }
    default:
      throw new Error(`unknown op kind ${op.kind}`);
  }
}

function sameTree(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(src)) {
      if (!exists(path.join(dst, e)) || !sameTree(path.join(src, e), path.join(dst, e))) return false;
    }
    return true;
  }
  return read(src) === read(dst);
}

function copyTree(src, dst, top = true) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src)) copyTree(path.join(src, e), path.join(dst, e), false);
    if (top) fs.writeFileSync(path.join(dst, VENDOR_MARK), 'Vendored copy managed by `kiwi vendor` — do not edit. To change behaviour for THIS project, add an override in docs/ai/ENGINEERING.md § 0 (rules) or a project skill in .agents/skills/. Never edit ~/.thekiwidev from a project (RULE-SCOPE-001).\n');
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    // A vendored single file (a rule) carries a sibling marker; files inside a vendored directory do not.
    if (top) fs.writeFileSync(dst + VENDOR_MARK, 'vendored by kiwi — do not edit; override in docs/ai/ENGINEERING.md § 0 (RULE-SCOPE-001)\n');
  }
}

/** Apply one op. Returns { status, detail }. */
function apply(op, { dryRun = false } = {}) {
  const state = inspect(op);
  if (state === 'ok') return { status: 'ok' };
  if (state === 'conflict') return { status: 'conflict', detail: conflictDetail(op) };
  const would = state === 'missing' ? 'created' : 'updated';
  if (dryRun) return { status: `would-be-${would}` };

  fs.mkdirSync(path.dirname(op.path), { recursive: true });
  switch (op.kind) {
    case 'mkdir':
      fs.mkdirSync(op.path, { recursive: true });
      break;
    case 'symlink': {
      if (exists(op.path)) fs.unlinkSync(op.path);
      let type;
      if (process.platform === 'win32') {
        // junctions need no privilege for directories; file symlinks need Developer Mode or admin
        try { type = fs.statSync(path.resolve(path.dirname(op.path), op.target)).isDirectory() ? 'junction' : 'file'; } catch { type = 'file'; }
      }
      try {
        fs.symlinkSync(op.target, op.path, type);
      } catch (err) {
        if (err.code === 'EPERM' && process.platform === 'win32') {
          throw new Error(`cannot create symlink ${op.path}: on Windows enable Developer Mode (Settings → For developers) or run once from an elevated terminal, then re-run kiwi install`);
        }
        throw err;
      }
      break;
    }
    case 'managed':
      fs.writeFileSync(op.path, managed.apply(read(op.path), op.inner));
      break;
    case 'file':
      fs.writeFileSync(op.path, op.content);
      break;
    case 'copy':
      if (exists(op.path)) fs.rmSync(op.path, { recursive: true, force: true });
      copyTree(op.source, op.path);
      break;
    case 'json': {
      const cur = read(op.path);
      if (cur !== null) fs.copyFileSync(op.path, `${op.path}.bak-${stamp()}`);
      const next = op.merge(cur ? JSON.parse(cur) : {});
      fs.writeFileSync(op.path, JSON.stringify(next, null, 2) + '\n');
      break;
    }
  }
  return { status: would };
}

function conflictDetail(op) {
  switch (op.kind) {
    case 'symlink': return `${op.path} exists and is not a symlink — a hand-written file is in the way`;
    case 'file': return `${op.path} exists and was not generated by kiwi`;
    case 'copy': return `${op.path} exists and is not a kiwi-vendored copy`;
    case 'json': return `${op.path} is not valid JSON`;
    default: return 'conflict';
  }
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/** Apply a whole plan; returns per-op results plus a summary. */
function run(plan, opts = {}) {
  const results = plan.map(op => ({ op, ...apply(op, opts) }));
  const summary = {};
  for (const r of results) summary[r.status] = (summary[r.status] || 0) + 1;
  return { results, summary };
}

/** Inspect a whole plan; returns [{ op, state }]. */
function check(plan) {
  return plan.map(op => ({ op, state: inspect(op) }));
}

/**
 * Find symlinks inside `dir` that point into `root` but whose target no longer exists
 * (e.g. a skill was renamed or removed from the global folder).
 */
function brokenLinksInto(dir, root) {
  if (!exists(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    if (!isSymlink(p)) continue;
    const target = path.resolve(path.dirname(p), readlink(p));
    if (target.startsWith(root) && !fs.existsSync(p)) out.push({ path: p, target });
  }
  return out;
}

module.exports = { inspect, apply, run, check, brokenLinksInto, GENERATED_MARK, VENDOR_MARK, exists, isSymlink, read };
