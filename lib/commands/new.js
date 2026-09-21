/**
 * kiwi new skill|agent|rule|workflow <name> — scaffold a component from its _template.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const { parse, stringify } = require('../frontmatter');
const { color, fail } = require('../cli');

const help = `kiwi new <skill|workflow|agent|rule> <name> [--description "…"] [--global --yes]

Scope-aware (RULE-SCOPE-001):
  inside the global folder  → scaffolds a GLOBAL component from its _template; then \`kiwi install\`.
  inside a project          → scaffolds a PROJECT-scoped component: .agents/rules/<name>.md or
                              .agents/skills/<name>/SKILL.md (agents: .github/agents/<name>.agent.md),
                              and reminds you to register it in docs/ai/RULES.md / workflows/INDEX.md.
  --global --yes            → force a global write from a project. Only the owner types this; agents never do.
A workflow is a skill whose body is a multi-step procedure (invocable: true). Names are kebab-case.`;

async function run(args) {
  const [kind, name] = args._;
  if (!kind || !name) fail(help);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail('name must be kebab-case, e.g. release-checklist');
  const description = args.flags.description || `TODO: one sentence on what ${name} does and when an agent should use it`;
  const scope = require('../scope');
  if (!scope.inGlobal()) {
    if (args.flags.global && args.flags.yes) {
      console.log(color.yellow('writing to the global folder from a project because --global --yes was given'));
    } else if (args.flags.global) {
      fail(scope.refusal('kiwi new --global') + ' If you (the owner) really mean the global folder, add --yes.');
    } else {
      return projectScoped(kind, name, description);
    }
  }
  const root = paths.globalRoot();

  let target, content;
  if (kind === 'skill' || kind === 'workflow') {
    target = path.join(root, 'skills', name, 'SKILL.md');
    if (fs.existsSync(path.dirname(target))) fail(`${paths.tilde(path.dirname(target))} already exists`);
    const tpl = fs.readFileSync(path.join(root, 'skills', '_template', 'SKILL.md'), 'utf8');
    const { data, body } = parse(tpl);
    content = stringify({ ...data, name, description, invocable: kind === 'workflow' ? true : data.invocable === true }, body.replace(/\{\{name\}\}/g, name));
  } else if (kind === 'agent' || kind === 'rule') {
    target = path.join(root, `${kind}s`, `${name}.md`);
    if (fs.existsSync(target)) fail(`${paths.tilde(target)} already exists`);
    const tpl = fs.readFileSync(path.join(root, `${kind}s`, '_template.md'), 'utf8');
    const { data, body } = parse(tpl);
    content = stringify({ ...data, name, description }, body.replace(/\{\{name\}\}/g, name));
  } else {
    fail(`unknown kind "${kind}" — skill, workflow, agent or rule`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  console.log(color.green('created ') + paths.tilde(target));
  console.log(color.dim('next: edit it, then `kiwi install` to link it into every agent, `kiwi publish` to push, `kiwi upgrade` in projects that vendor it.'));
  return 0;
}

/** Project-scoped scaffold: writes only inside the current repository. */
function projectScoped(kind, name, description) {
  const dir = process.cwd();
  const root = paths.globalRoot();
  let target, content, register;
  if (kind === 'skill' || kind === 'workflow') {
    target = path.join(dir, '.agents', 'skills', name, 'SKILL.md');
    const { data, body } = parse(fs.readFileSync(path.join(root, 'skills', '_template', 'SKILL.md'), 'utf8'));
    content = stringify({ ...data, name, description, invocable: kind === 'workflow' ? true : data.invocable === true }, body.replace(/\{\{name\}\}/g, name));
    register = 'docs/ai/workflows/INDEX.md (and INDEX.md if agents should find it)';
  } else if (kind === 'rule') {
    target = path.join(dir, '.agents', 'rules', `${name}.md`);
    const { data, body } = parse(fs.readFileSync(path.join(root, 'rules', '_template.md'), 'utf8'));
    content = stringify({ ...data, name, description }, body.replace(/\{\{name\}\}/g, name));
    register = 'docs/ai/RULES.md (origin: owner) and the relevant ENGINEERING.md section';
  } else if (kind === 'agent') {
    target = path.join(dir, '.github', 'agents', `${name}.agent.md`);
    const { data, body } = parse(fs.readFileSync(path.join(root, 'agents', '_template.md'), 'utf8'));
    const tools = String(data.tools || '').split(',').map(s => s.trim()).filter(Boolean);
    content = stringify({ name, description, ...(tools.length ? { tools } : {}) }, body.replace(/\{\{name\}\}/g, name));
    register = 'docs/ai/INDEX.md';
  } else {
    fail(`unknown kind "${kind}" — skill, workflow, agent or rule`);
  }
  if (fs.existsSync(target)) fail(`${path.relative(dir, target)} already exists`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  console.log(color.green('created (project scope) ') + path.relative(dir, target));
  console.log(color.dim(`next: fill it in, then register it in ${register}. Nothing was written to ${paths.tilde(root)}.`));
  return 0;
}

module.exports = { run, help, projectScoped };
