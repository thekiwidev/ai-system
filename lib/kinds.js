/**
 * Kinds (RULE-KIND-001): the one home, template and index of each repeatable thing, plus the checks
 * `kiwi doctor` runs on workflows. Pure helpers — callers decide what to write.
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('./frontmatter');

const WORKFLOW_SECTIONS = [
  'Purpose', 'Triggers', 'Parameters', 'Variants', 'Pre-flight checks',
  'Steps', 'On failure (general)', 'Verification', 'Report', 'Change history'
];

const PROJECT_ONLY = ['plan', 'decision', 'prd'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Level-2 headings of a markdown body, trimmed. */
function h2(body) {
  return body.split('\n').filter(l => /^## /.test(l)).map(l => l.slice(3).trim());
}

/** Problems with a workflow file's shape: [] when it conforms. */
function workflowProblems(text) {
  const { data, body } = parse(text);
  const problems = [];
  if (data.kind !== 'workflow') problems.push('frontmatter `kind: workflow` missing');
  if (data.invocable !== true) problems.push('frontmatter `invocable: true` missing');
  if (data.version === undefined) problems.push('frontmatter `version` missing');
  const have = h2(body);
  const missing = WORKFLOW_SECTIONS.filter(s => !have.includes(s));
  if (missing.length) problems.push(`missing section(s): ${missing.join(', ')}`);
  if (!/^### \d+\. /m.test(body)) problems.push('no numbered steps (`### 1. …`) under Steps');
  return problems;
}

/** True when a SKILL.md declares itself a workflow. */
function isWorkflow(file) {
  try { return parse(fs.readFileSync(file, 'utf8')).data.kind === 'workflow'; } catch { return false; }
}

/** Project workflows: [{ name, file }] from .agents/skills/<name>/SKILL.md with kind: workflow. */
function projectWorkflows(dir) {
  const root = path.join(dir, '.agents', 'skills');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .map(e => ({ name: e.name, file: path.join(root, e.name, 'SKILL.md') }))
    .filter(w => fs.existsSync(w.file) && isWorkflow(w.file));
}

/** Files other than INDEX.md in docs/ai/workflows/ — the retired second home (V3-13). */
function strayWorkflowDocs(dir) {
  const d = path.join(dir, 'docs', 'ai', 'workflows');
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(f => f.endsWith('.md') && f !== 'INDEX.md').map(f => path.join(d, f));
}

/**
 * Insert `row` after the last line of the first markdown table that follows `heading`
 * (or the first table in the file when heading is null). Returns the new text, or null when no table.
 */
function insertTableRow(text, heading, row) {
  const lines = text.split('\n');
  let i = 0;
  if (heading) {
    i = lines.findIndex(l => l.trim() === heading);
    if (i < 0) return null;
  }
  const start = lines.findIndex((l, k) => k >= i && /^\|.*\|\s*$/.test(l));
  if (start < 0) return null;
  let end = start;
  while (end + 1 < lines.length && /^\|.*\|\s*$/.test(lines[end + 1])) end++;
  return [...lines.slice(0, end + 1), row, ...lines.slice(end + 1)].join('\n');
}

/** Next ADR number in a decisions directory, zero-padded to three digits. */
function nextAdrNumber(decisionsDir) {
  const nums = fs.existsSync(decisionsDir)
    ? fs.readdirSync(decisionsDir).map(f => (f.match(/^ADR-(\d+)/) || [])[1]).filter(Boolean).map(Number)
    : [];
  return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
}

module.exports = {
  WORKFLOW_SECTIONS, PROJECT_ONLY, today, workflowProblems, isWorkflow,
  projectWorkflows, strayWorkflowDocs, insertTableRow, nextAdrNumber
};
