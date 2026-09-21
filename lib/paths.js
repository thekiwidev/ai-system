/**
 * Where things live: the global root, the source repo, per-agent homes, and config.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');

function home() {
  return process.env.KIWI_TEST_HOME || os.homedir();
}

/** The global root: $THEKIWIDEV_AI_HOME, else ~/.thekiwidev */
function globalRoot() {
  return process.env.THEKIWIDEV_AI_HOME || path.join(home(), '.thekiwidev');
}

/** True when the global root resolves to this very repository. */
function globalRootIsRepo() {
  try {
    return fs.realpathSync(globalRoot()) === fs.realpathSync(REPO_ROOT);
  } catch {
    return false;
  }
}

/** Absolute paths inside the global root (used as symlink targets so links stay stable). */
function g(...parts) {
  return path.join(globalRoot(), ...parts);
}

/** Per-agent global homes. */
function agentHomes() {
  const h = home();
  return {
    claude: path.join(h, '.claude'),
    codex: path.join(h, '.codex'),
    agents: path.join(h, '.agents'),            // cross-vendor (Codex, Copilot)
    gemini: path.join(h, '.gemini'),
    antigravityConfig: path.join(h, '.gemini', 'config'),
    antigravityCli: path.join(h, '.gemini', 'antigravity-cli'),
    copilot: path.join(h, '.copilot')
  };
}

const DEFAULT_CONFIG = {
  agents: { claude: true, codex: true, gemini: true, antigravity: true, copilot: true },
  hooks: { install: false, tmux: false },
  wrappers: { codex: true, gemini: true },
  bridges: { cursor: false, windsurf: false, copilotPrompts: false },
  prdDir: 'docs/ai/prd',
  caveman: { mode: 'full' },            // off | lite | full | ultra — global default; project .caveman.json overrides
  contextDocs: ['MEMORY', 'NOTES', 'CHANGELOG']  // default derived-context set offered to new projects
};

function deepMerge(base, over) {
  const out = { ...base };
  for (const k of Object.keys(over || {})) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], over[k]);
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

/** config.json from the global root (falls back to the repo copy, then defaults). */
function loadConfig() {
  const candidates = [g('config.json'), path.join(REPO_ROOT, 'config.json')];
  for (const c of candidates) {
    try {
      return deepMerge(DEFAULT_CONFIG, JSON.parse(fs.readFileSync(c, 'utf8')));
    } catch { /* try next */ }
  }
  return { ...DEFAULT_CONFIG };
}

function version() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')).version;
}

/** Display a path with ~ for the home dir. */
function tilde(p) {
  const h = home();
  return p.startsWith(h) ? '~' + p.slice(h.length) : p;
}

module.exports = { REPO_ROOT, home, globalRoot, globalRootIsRepo, g, agentHomes, loadConfig, DEFAULT_CONFIG, version, tilde };
