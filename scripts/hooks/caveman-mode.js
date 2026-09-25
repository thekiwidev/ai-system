#!/usr/bin/env node
/**
 * Claude Code SessionStart / UserPromptSubmit hook: state the effective caveman mode for the session's
 * working directory (CAVEMAN_DEFAULT_MODE env -> project .caveman.json -> global config -> full).
 * Stdout of these events is added to the model's context, so the project level reaches the agent even
 * when the global instructions state a different default.
 *
 *   node caveman-mode.js session   full mode statement (session start)
 *   node caveman-mode.js prompt    one-line reminder (every prompt, stops drift in long sessions)
 *
 * Prints nothing when the effective mode is off. Never blocks: any error exits 0 silently.
 */
const caveman = require('../../lib/caveman');

const SOURCES = { env: 'CAVEMAN_DEFAULT_MODE', project: '.caveman.json', global: 'global default', default: 'default' };

function output(kind, cwd) {
  const eff = caveman.effective(cwd);
  if (eff.mode === 'off') return '';
  const source = SOURCES[eff.source];
  if (kind === 'prompt') {
    return `Caveman: ${eff.mode} (${source}). Terse reply, no tool-call narration, report as labelled one-liners (rules/caveman.md § Reports).`;
  }
  return `${caveman.statement(eff.mode, { scope: eff.source === 'project' ? 'project' : 'global' })}\nEffective level source: ${source}.`;
}

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { data += c; });
process.stdin.on('end', () => {
  try {
    let input = {};
    try { input = JSON.parse(data || '{}'); } catch { /* no input */ }
    const text = output(process.argv[2] === 'prompt' ? 'prompt' : 'session', input.cwd || process.cwd());
    if (text) process.stdout.write(text + '\n');
  } catch { /* never block a session */ }
  process.exit(0);
});
