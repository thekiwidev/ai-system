/**
 * Tiny argv parser + output helpers. No dependencies.
 */
const readline = require('readline');

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) args.flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('-')) args.flags[k] = argv[++i];
      else args.flags[k] = true;
    } else if (a.startsWith('-') && a.length > 1) {
      args.flags[a.slice(1)] = true;
    } else {
      args._.push(a);
    }
  }
  return args;
}

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const color = {
  bold: s => c('1', s),
  dim: s => c('2', s),
  green: s => c('32', s),
  yellow: s => c('33', s),
  red: s => c('31', s),
  cyan: s => c('36', s)
};

const STATUS_STYLE = {
  ok: s => color.dim(s),
  created: s => color.green(s),
  updated: s => color.green(s),
  'would-be-created': s => color.cyan(s),
  'would-be-updated': s => color.cyan(s),
  conflict: s => color.red(s),
  missing: s => color.yellow(s),
  stale: s => color.yellow(s),
  broken: s => color.red(s)
};

function styleStatus(s) {
  return (STATUS_STYLE[s] || (x => x))(s);
}

function printSummary(summary) {
  const parts = Object.entries(summary).map(([k, v]) => `${styleStatus(k)} ${v}`);
  console.log(parts.join(color.dim(' · ')));
}

/** Print op results grouped by agent, hiding `ok` rows unless verbose. */
function printResults(results, { verbose = false, tilde = x => x } = {}) {
  const groups = {};
  for (const r of results) (groups[r.op.agent] = groups[r.op.agent] || []).push(r);
  for (const [agent, rows] of Object.entries(groups)) {
    const shown = rows.filter(r => verbose || r.status !== 'ok');
    const okCount = rows.length - shown.length;
    console.log(color.bold(agent) + (okCount ? color.dim(`  (${okCount} ok)`) : ''));
    for (const r of shown) {
      console.log(`  ${styleStatus(r.status).padEnd(useColor ? 30 : 18)} ${tilde(r.op.path)}${r.detail ? color.red('  ← ' + r.detail) : ''}`);
    }
  }
}

function confirm(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`${question} [y/N] `, ans => {
      rl.close();
      resolve(/^y(es)?$/i.test(ans.trim()));
    });
  });
}

function fail(msg, code = 1) {
  console.error(color.red('error: ') + msg);
  process.exit(code);
}

module.exports = { parseArgs, color, styleStatus, printSummary, printResults, confirm, fail };
