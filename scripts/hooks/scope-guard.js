#!/usr/bin/env node
/**
 * Claude Code PreToolUse guard (RULE-SCOPE-001): block Edit/Write/MultiEdit/NotebookEdit whose target
 * resolves — through any symlink such as ~/.claude/rules/x.md — into the global folder, unless the
 * session itself runs inside the global folder. Exit 2 = block with the message on stderr.
 * Set KIWI_SCOPE_GUARD=off to disable for one session (owner only).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

function real(p) { try { return fs.realpathSync(p); } catch { return path.resolve(p); } }
const root = real(process.env.THEKIWIDEV_AI_HOME || path.join(os.homedir(), '.thekiwidev'));
const inside = p => p === root || p.startsWith(root + path.sep);

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { data += c; });
process.stdin.on('end', () => {
  if (process.env.KIWI_SCOPE_GUARD === 'off') return process.exit(0);
  let input = {};
  try { input = JSON.parse(data || '{}'); } catch { return process.exit(0); }
  const cwd = real(input.cwd || process.cwd());
  if (inside(cwd)) return process.exit(0); // opened in the global folder: global edits are in scope
  const ti = input.tool_input || {};
  const target = ti.file_path || ti.notebook_path || ti.path;
  if (!target) return process.exit(0);
  // resolve the deepest existing ancestor so new files under a symlinked dir are caught too
  let probe = path.resolve(cwd, target);
  let rest = '';
  while (!fs.existsSync(probe) && path.dirname(probe) !== probe) { rest = path.join(path.basename(probe), rest); probe = path.dirname(probe); }
  const resolved = path.join(real(probe), rest);
  if (!inside(resolved)) return process.exit(0);
  process.stderr.write(
    `[kiwi scope guard] Blocked: ${target} resolves to ${resolved}, inside the global AI system, but this session runs in ${cwd}.\n` +
    'Write scope is the folder you were opened in (RULE-SCOPE-001). Make the project-scoped change instead — a rule override goes in docs/ai/ENGINEERING.md § 0, a note in docs/ai/NOTES.md, a skill in .agents/skills/ — and put the global suggestion in your report. Global files are edited only from a session opened in ~/.thekiwidev.\n'
  );
  process.exit(2);
});
