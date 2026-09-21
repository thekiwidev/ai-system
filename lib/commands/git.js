/**
 * kiwi sync / kiwi publish — the only commands that touch Git, and only on the global folder, and only after asking.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const paths = require('../paths');
const { color, confirm, fail } = require('../cli');

const helpSync = `kiwi sync [--yes]
Pull the latest global folder (git pull --ff-only in ~/.thekiwidev), then re-run \`kiwi install\`. Asks first.`;
const helpPublish = `kiwi publish [--yes]
Push the global folder's current branch (git push in ~/.thekiwidev). Never commits — commit yourself first. Asks first.`;

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, stdio: 'inherit' });
  return r.status || 0;
}

async function sync(args) {
  const root = fs.realpathSync(paths.globalRoot());
  console.log(`git pull --ff-only in ${paths.tilde(root)}`);
  if (!args.flags.yes && !(await confirm('Proceed?'))) return 0;
  const code = git(['pull', '--ff-only'], root);
  if (code) fail('pull failed — resolve it in the folder and re-run', code);
  console.log(color.dim('\nre-linking…'));
  return require('./install').run({ _: [], flags: {} });
}

async function publish(args) {
  const root = fs.realpathSync(paths.globalRoot());
  const dirty = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  if (dirty) {
    console.log(color.yellow('uncommitted changes in the global folder — kiwi never commits for you:'));
    console.log(dirty);
    fail('commit first, then `kiwi publish`');
  }
  console.log(`git push in ${paths.tilde(root)}`);
  if (!args.flags.yes && !(await confirm('Proceed?'))) return 0;
  return git(['push'], root);
}

module.exports = { sync, publish, helpSync, helpPublish };
