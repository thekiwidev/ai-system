const path = require('path');
const { linkEach, globalBlock, mdHeader } = require('./common');
const { stringify } = require('../frontmatter');

const id = 'codex';
const name = 'OpenAI Codex';

function wrapper(ctx, skill) {
  const root = ctx.tilde(ctx.root);
  const body = mdHeader('kiwi install') +
    `Use the \`${skill.name}\` skill: read \`${root}/skills/${skill.name}/SKILL.md\` (also installed at \`~/.agents/skills/${skill.name}\`) in full and follow it exactly.\n\nTask: $ARGUMENTS\n`;
  return stringify({ description: skill.description }, body);
}

function global(ctx) {
  const ops = [
    ...linkEach(ctx.registry.skills, path.join(ctx.homes.agents, 'skills'), { agent: id }),
    { kind: 'managed', path: path.join(ctx.homes.codex, 'AGENTS.md'), inner: globalBlock(ctx), agent: id, why: 'global AGENTS.md → GLOBAL.md' }
  ];
  if (ctx.config.wrappers.codex) {
    for (const s of ctx.registry.skills.filter(s => s.invocable)) {
      ops.push({ kind: 'file', path: path.join(ctx.homes.codex, 'prompts', `${s.name}.md`), content: wrapper(ctx, s), agent: id, why: `/prompts:${s.name}` });
    }
  }
  return ops;
}

// AGENTS.md at the project root is owned by the agents-md adapter (shared by Codex, Jules, Cursor…).
function project() {
  return [];
}

module.exports = { id, name, global, project, wrapper };
