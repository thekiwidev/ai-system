/**
 * kiwi new <kind> <name> — scaffold a component from its template in the one home for its kind
 * (rules/kinds.md, RULE-KIND-001).
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const kinds = require('../kinds');
const { parse, stringify } = require('../frontmatter');
const { color, fail } = require('../cli');

const help = `kiwi new <workflow|skill|agent|rule|plan|decision> <name> [--description "…"] [--global --yes]

One home, one template per kind (rules/kinds.md, RULE-KIND-001). Scope-aware (RULE-SCOPE-001):
  inside the global folder  → workflow, skill, agent, rule scaffold a GLOBAL component; then \`kiwi install\`.
  inside a project          → PROJECT-scoped: workflow/skill → .agents/skills/<name>/SKILL.md (+ .claude/skills
                              symlink, workflow registered in docs/ai/workflows/INDEX.md); rule → .agents/rules/<name>.md;
                              agent → .github/agents/<name>.agent.md; plan → docs/ai/plans/active/<name>.md;
                              decision → docs/ai/decisions/ADR-NNN-<name>.md (plans and decisions are registered).
  --global --yes            → force a global write from a project. Only the owner types this; agents never do.
A workflow is filled by the create-workflow skill; a PRD is never scaffolded — use the create-prd skill.
Names are kebab-case.`;

async function run(args) {
  const [kind, name] = args._;
  if (!kind || !name) fail(help);
  if (kind === 'prd') fail('PRDs start from an interview, not a blank file — ask your agent to use the create-prd skill.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail('name must be kebab-case, e.g. release-checklist');
  const description = args.flags.description || `TODO: one sentence on what ${name} does and when an agent should use it`;
  const scope = require('../scope');
  if (!scope.inGlobal()) {
    if (args.flags.global && args.flags.yes && !kinds.PROJECT_ONLY.includes(kind)) {
      console.log(color.yellow('writing to the global folder from a project because --global --yes was given'));
    } else if (args.flags.global) {
      fail(scope.refusal('kiwi new --global') + ' If you (the owner) really mean the global folder, add --yes.');
    } else {
      return projectScoped(kind, name, description);
    }
  }
  if (kinds.PROJECT_ONLY.includes(kind)) fail(`a ${kind} belongs to one project — run \`kiwi new ${kind}\` inside that project.`);
  return globalScoped(kind, name, description);
}

/** Fill a skill or workflow template for `name`. */
function skillContent(kind, name, description) {
  const root = paths.globalRoot();
  const tplDir = kind === 'workflow' ? '_template-workflow' : '_template';
  const { data, body } = parse(fs.readFileSync(path.join(root, 'skills', tplDir, 'SKILL.md'), 'utf8'));
  const date = kinds.today();
  const meta = kind === 'workflow'
    ? { ...data, name, description, last_reviewed: date }
    : { ...data, name, description, invocable: data.invocable === true };
  return stringify(meta, body.replace(/\{\{name\}\}/g, name).replace(/\{\{DATE\}\}/g, date));
}

/** Fill an agent or rule template for `name`. */
function fileContent(kind, name, description) {
  const { data, body } = parse(fs.readFileSync(path.join(paths.globalRoot(), `${kind}s`, '_template.md'), 'utf8'));
  return stringify({ ...data, name, description }, body.replace(/\{\{name\}\}/g, name));
}

function globalScoped(kind, name, description) {
  const root = paths.globalRoot();
  let target, content;
  if (kind === 'skill' || kind === 'workflow') {
    target = path.join(root, 'skills', name, 'SKILL.md');
    if (fs.existsSync(path.dirname(target))) fail(`${paths.tilde(path.dirname(target))} already exists`);
    content = skillContent(kind, name, description);
  } else if (kind === 'agent' || kind === 'rule') {
    target = path.join(root, `${kind}s`, `${name}.md`);
    if (fs.existsSync(target)) fail(`${paths.tilde(target)} already exists`);
    content = fileContent(kind, name, description);
  } else {
    fail(`unknown kind "${kind}" — workflow, skill, agent, rule, plan or decision`);
  }
  write(target, content);
  console.log(color.green('created ') + paths.tilde(target));
  console.log(color.dim(`next: ${kind === 'workflow' ? 'fill it with the create-workflow skill' : 'edit it'}, then \`kiwi install\` to link it into every agent, \`kiwi publish\` to push, \`kiwi upgrade\` in projects that vendor it.`));
  return 0;
}

function write(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

/** .claude/skills/<name> → ../../.agents/skills/<name>, so Claude Code discovers project skills too. */
function linkForClaude(dir, name) {
  const link = path.join(dir, '.claude', 'skills', name);
  if (fs.existsSync(link)) return null;
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(path.join('..', '..', '.agents', 'skills', name), link);
  return path.relative(dir, link);
}

/** Add a row to an index table; returns a note for the output. */
function register(dir, rel, heading, row) {
  const file = path.join(dir, rel);
  if (!fs.existsSync(file)) return `register it in ${rel} (file not found)`;
  const text = fs.readFileSync(file, 'utf8');
  const updated = kinds.insertTableRow(text, heading, row) || kinds.insertTableRow(text, null, row);
  if (!updated) return `register it in ${rel} (no table found)`;
  fs.writeFileSync(file, updated);
  return `registered in ${rel}`;
}

/** Project template for plans/decisions: the project's own copy first, then the initializer's. */
function projectTemplate(dir, rel) {
  const own = path.join(dir, 'docs', 'ai', rel);
  if (fs.existsSync(own)) return fs.readFileSync(own, 'utf8');
  return fs.readFileSync(path.join(paths.globalRoot(), 'skills', 'kiwi-system', 'templates', 'docs-ai', rel), 'utf8');
}

function scaffoldProject(kind, name, description, dir) {
  const date = kinds.today();
  if (kind === 'skill' || kind === 'workflow') {
    const target = path.join(dir, '.agents', 'skills', name, 'SKILL.md');
    return { target, content: skillContent(kind, name, description), after: () => {
      const notes = [];
      const link = linkForClaude(dir, name);
      if (link) notes.push(`linked ${link}`);
      notes.push(kind === 'workflow'
        ? register(dir, 'docs/ai/workflows/INDEX.md', '## Workflows', `| \`${name}\` | project | TODO: trigger phrases | TODO: parameters |`)
        : 'list it in docs/ai/workflows/INDEX.md § Skills');
      return notes;
    } };
  }
  if (kind === 'rule') {
    return { target: path.join(dir, '.agents', 'rules', `${name}.md`), content: fileContent('rule', name, description),
      after: () => ['register it in docs/ai/RULES.md (origin: owner) and the relevant ENGINEERING.md section'] };
  }
  if (kind === 'agent') {
    const { data, body } = parse(fs.readFileSync(path.join(paths.globalRoot(), 'agents', '_template.md'), 'utf8'));
    const tools = String(data.tools || '').split(',').map(s => s.trim()).filter(Boolean);
    return { target: path.join(dir, '.github', 'agents', `${name}.agent.md`),
      content: stringify({ name, description, ...(tools.length ? { tools } : {}) }, body.replace(/\{\{name\}\}/g, name)),
      after: () => ['list it in docs/ai/INDEX.md'] };
  }
  if (kind === 'plan') {
    const content = projectTemplate(dir, 'plans/PLAN-TEMPLATE.md').replace(/\{\{NAME\}\}/g, name).replace(/\{\{DATE\}\}/g, date);
    return { target: path.join(dir, 'docs', 'ai', 'plans', 'active', `${name}.md`), content,
      after: () => [register(dir, 'docs/ai/plans/INDEX.md', '## Active', `| [${name}](active/${name}.md) | TODO: role |`)] };
  }
  if (kind === 'decision') {
    const num = kinds.nextAdrNumber(path.join(dir, 'docs', 'ai', 'decisions'));
    const content = projectTemplate(dir, 'decisions/ADR-TEMPLATE.md').replace(/\{\{NNN\}\}/g, num).replace(/\{\{title\}\}/g, name).replace(/\{\{DATE\}\}/g, date);
    const file = `ADR-${num}-${name}.md`;
    return { target: path.join(dir, 'docs', 'ai', 'decisions', file), content,
      after: () => [register(dir, 'docs/ai/decisions/INDEX.md', null, `| [ADR-${num}](${file}) | TODO: decision | Accepted |`)] };
  }
  return fail(`unknown kind "${kind}" — workflow, skill, agent, rule, plan or decision`);
}

/** Project-scoped scaffold: writes only inside the current repository. */
function projectScoped(kind, name, description) {
  const dir = process.cwd();
  const { target, content, after } = scaffoldProject(kind, name, description, dir);
  if (fs.existsSync(target)) fail(`${path.relative(dir, target)} already exists`);
  write(target, content);
  console.log(color.green('created (project scope) ') + path.relative(dir, target));
  for (const note of after()) console.log(color.dim(`  ${note}`));
  if (kind === 'workflow') console.log(color.dim('next: fill it with the create-workflow skill; `kiwi doctor` checks its shape.'));
  console.log(color.dim(`Nothing was written to ${paths.tilde(paths.globalRoot())}.`));
  return 0;
}

module.exports = { run, help, projectScoped };
