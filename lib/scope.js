/**
 * Write scope (RULE-SCOPE-001): an agent — or the CLI on its behalf — writes only inside the folder it
 * was opened in. From a project, the global folder and everything that resolves into it is read-only.
 */
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

function real(p) {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
}

/** True when `dir` (default cwd) is the global folder or inside it. */
function inGlobal(dir = process.cwd()) {
  const root = real(paths.globalRoot());
  const d = real(dir);
  return d === root || d.startsWith(root + path.sep);
}

/** True when `file` resolves (through symlinks) to somewhere inside the global folder. */
function resolvesToGlobal(file) {
  const root = real(paths.globalRoot());
  const f = real(file);
  return f === root || f.startsWith(root + path.sep);
}

/** Message used by every guard, so the wording is identical everywhere. */
function refusal(what) {
  return `${what} would write into the global folder (${paths.tilde(paths.globalRoot())}) from a project. ` +
    'Write scope is the folder you are in (RULE-SCOPE-001): make the project-scoped change here, and make global changes only from the global folder itself ' +
    `(cd ${paths.tilde(paths.globalRoot())}).`;
}

module.exports = { inGlobal, resolvesToGlobal, refusal, real };
