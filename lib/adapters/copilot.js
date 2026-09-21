const path = require('path');
const { linkEach, mdHeader } = require('./common');
const { stringify } = require('../frontmatter');

const id = 'copilot';
const name = 'GitHub Copilot';

function global(ctx) {
  return linkEach(ctx.registry.skills, path.join(ctx.homes.copilot, 'skills'), { agent: id });
}

/** Rule → .github/instructions/<name>.instructions.md */
function instruction(rule) {
  const body = mdHeader('kiwi vendor') + rule.body;
  return stringify({ applyTo: rule.applyTo || '**', description: rule.description }, body);
}

/** Claude agent → .github/agents/<name>.agent.md */
function agentFile(agent) {
  const tools = Array.isArray(agent.tools) ? agent.tools : String(agent.tools || '').split(',').map(s => s.trim()).filter(Boolean);
  const fm = { name: agent.name, description: agent.description };
  if (tools.length) fm.tools = tools;
  return stringify(fm, mdHeader('kiwi vendor') + agent.body);
}

/** Invocable skill → .github/prompts/<name>.prompt.md */
function promptFile(skill) {
  const body = mdHeader('kiwi vendor') +
    `Use the \`${skill.name}\` skill: read \`.agents/skills/${skill.name}/SKILL.md\` (or \`~/.thekiwidev/skills/${skill.name}/SKILL.md\`) in full and follow it exactly.\n\nTask: \${input}\n`;
  return stringify({ description: skill.description, agent: 'agent' }, body);
}

function project(ctx, dir, { vendor = false } = {}) {
  const ops = [
    { kind: 'symlink', path: path.join(dir, '.github', 'copilot-instructions.md'), target: '../docs/ai/AGENT-CORE.md', agent: id, why: 'entry point' }
  ];
  if (vendor) {
    for (const r of ctx.registry.rules) {
      const item = withBody(r);
      if (r.name === 'caveman') {
        const eff = require('../caveman').effective(dir, ctx.config);
        item.body = `> Effective mode for this repository: **${eff.mode}** (${eff.source}).\n\n` + item.body;
      }
      ops.push({ kind: 'file', path: path.join(dir, '.github', 'instructions', `${r.name}.instructions.md`), content: instruction(item), agent: id, why: `instruction ${r.name}` });
    }
    for (const a of ctx.registry.agents) {
      ops.push({ kind: 'file', path: path.join(dir, '.github', 'agents', `${a.name}.agent.md`), content: agentFile(withBody(a)), agent: id, why: `custom agent ${a.name}` });
    }
    if (ctx.config.bridges.copilotPrompts) {
      for (const s of ctx.registry.skills.filter(s => s.invocable)) {
        ops.push({ kind: 'file', path: path.join(dir, '.github', 'prompts', `${s.name}.prompt.md`), content: promptFile(s), agent: id, why: `prompt ${s.name}` });
      }
    }
  }
  return ops;
}

function withBody(item) {
  const { parse } = require('../frontmatter');
  const text = require('fs').readFileSync(item.file, 'utf8');
  return { ...item, body: parse(text).body.replace(/^\n+/, '') };
}

module.exports = { id, name, global, project, instruction, agentFile, promptFile };
