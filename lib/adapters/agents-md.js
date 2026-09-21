/**
 * The cross-vendor AGENTS.md entry point (Codex, Jules, Cursor, Windsurf, Cline, Zed, …)
 * plus the opt-in Cursor / Windsurf pointer files.
 */
const path = require('path');
const { mdHeader } = require('./common');
const { stringify } = require('../frontmatter');

const id = 'agents-md';
const name = 'AGENTS.md (Jules, Cursor, Windsurf, …)';

function global() {
  return [];
}

function project(ctx, dir) {
  const ops = [
    { kind: 'symlink', path: path.join(dir, 'AGENTS.md'), target: 'docs/ai/AGENT-CORE.md', agent: id, why: 'entry point' }
  ];
  const pointer = 'Read `docs/ai/AGENT-CORE.md` before acting — it is the canonical instruction source for every agent in this repository.\n';
  if (ctx.config.bridges.cursor) {
    ops.push({
      kind: 'file',
      path: path.join(dir, '.cursor', 'rules', 'kiwi-agent-core.mdc'),
      content: stringify({ description: 'Canonical agent instructions', alwaysApply: true }, mdHeader() + pointer),
      agent: id, why: 'Cursor rule → AGENT-CORE'
    });
  }
  if (ctx.config.bridges.windsurf) {
    ops.push({ kind: 'file', path: path.join(dir, '.windsurfrules'), content: mdHeader() + pointer, agent: id, why: 'Windsurf rules → AGENT-CORE' });
  }
  return ops;
}

module.exports = { id, name, global, project };
