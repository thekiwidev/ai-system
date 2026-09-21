const path = require('path');
const fs = require('fs');
const { linkEach, globalBlock, corePointer, cavemanPointer } = require('./common');

const id = 'antigravity';
const name = 'Google Antigravity';

function global(ctx) {
  const ops = [
    ...linkEach(ctx.registry.skills, path.join(ctx.homes.antigravityConfig, 'skills'), { agent: id }),
    // GEMINI.md is shared with Gemini CLI; the planner dedupes this op when both adapters are enabled.
    { kind: 'managed', path: path.join(ctx.homes.gemini, 'GEMINI.md'), inner: globalBlock(ctx), agent: id, why: 'global GEMINI.md → GLOBAL.md (shared with Gemini CLI)' }
  ];
  if (fs.existsSync(ctx.homes.antigravityCli)) {
    ops.push(...linkEach(ctx.registry.skills, path.join(ctx.homes.antigravityCli, 'skills'), { agent: id, why: 'Antigravity CLI skill' }));
  }
  return ops;
}

/** Antigravity reads workspace rules from .agents/rules/ — drop a pointer to the canonical core. GEMINI.md is linked by the gemini adapter. */
function project(ctx, dir) {
  return [
    { kind: 'file', path: path.join(dir, '.agents', 'rules', '00-agent-core.md'), content: corePointer(ctx), agent: id, why: 'workspace rule → AGENT-CORE' },
    { kind: 'file', path: path.join(dir, '.agents', 'rules', '01-caveman.md'), content: cavemanPointer(ctx, dir), agent: id, why: 'workspace rule → caveman mode' }
  ];
}

module.exports = { id, name, global, project };
