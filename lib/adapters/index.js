const claude = require('./claude');
const codex = require('./codex');
const gemini = require('./gemini');
const antigravity = require('./antigravity');
const copilot = require('./copilot');
const agentsMd = require('./agents-md');

const ALL = [claude, codex, gemini, antigravity, copilot, agentsMd];

/** Adapters enabled by config (agents-md is always on — it is the vendor-neutral entry point). */
function enabled(config) {
  return ALL.filter(a => a.id === 'agents-md' || config.agents[a.id] !== false);
}

module.exports = { ALL, enabled, claude, codex, gemini, antigravity, copilot, agentsMd };
