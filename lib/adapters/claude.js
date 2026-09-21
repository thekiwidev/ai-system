const path = require('path');
const fs = require('fs');
const { linkEach, globalBlock } = require('./common');

const id = 'claude';
const name = 'Claude Code';

function global(ctx) {
  const home = ctx.homes.claude;
  const ops = [
    ...linkEach(ctx.registry.skills, path.join(home, 'skills'), { agent: id }),
    ...linkEach(ctx.registry.agents, path.join(home, 'agents'), { agent: id, ext: '.md' }),
    ...linkEach(ctx.registry.rules, path.join(home, 'rules'), { agent: id, ext: '.md' }),
    { kind: 'managed', path: path.join(home, 'CLAUDE.md'), inner: globalBlock(ctx, { importSyntax: true }), agent: id, why: 'global CLAUDE.md → GLOBAL.md' }
  ];
  // The scope guard is always installed (RULE-SCOPE-001); the other hooks only with hooks.install.
  ops.push(hooksOp(ctx, home, { onlyGuard: !ctx.config.hooks.install }));
  return ops;
}

/** Merge hooks/hooks.json into ~/.claude/settings.json, tagging every entry so re-runs replace rather than duplicate. */
function hooksOp(ctx, home, { onlyGuard = false } = {}) {
  const src = JSON.parse(fs.readFileSync(path.join(ctx.root, 'hooks', 'hooks.json'), 'utf8')).hooks;
  const tag = '[kiwi]';
  return {
    kind: 'json',
    path: path.join(home, 'settings.json'),
    agent: id,
    why: onlyGuard ? 'scope guard hook in settings.json (tagged [kiwi]; backup written)' : 'merge kiwi hooks into settings.json (tagged [kiwi]; backup written)',
    merge(existing) {
      const out = { ...existing, hooks: { ...(existing.hooks || {}) } };
      for (const event of Object.keys(src)) {
        const kept = (out.hooks[event] || []).filter(e => !(e.description || '').startsWith(tag));
        const mine = src[event]
          .filter(e => !onlyGuard || /Scope guard/.test(e.description || ''))
          .filter(e => ctx.config.hooks.tmux || !/tmux/i.test(e.description || ''))
          .map(e => ({
            ...e,
            description: `${tag} ${e.description || ''}`.trim(),
            hooks: e.hooks.map(h => ({ ...h, command: h.command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, ctx.root) }))
          }));
        out.hooks[event] = [...kept, ...mine];
        if (!out.hooks[event].length) delete out.hooks[event];
      }
      return out;
    }
  };
}

function project(ctx, dir) {
  return [{ kind: 'symlink', path: path.join(dir, 'CLAUDE.md'), target: 'docs/ai/AGENT-CORE.md', agent: id, why: 'entry point' }];
}

module.exports = { id, name, global, project };
