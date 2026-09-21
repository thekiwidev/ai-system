/**
 * Scans the global root for skills, agents and rules and returns their metadata.
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('./frontmatter');

function isHidden(name) {
  return name.startsWith('.') || name.startsWith('_');
}

function readMd(file) {
  const text = fs.readFileSync(file, 'utf8');
  const { data, body } = parse(text);
  return { data, body, text };
}

/** skills/<name>/SKILL.md → [{ name, dir, file, description, invocable, data }] */
function skills(root) {
  const dir = path.join(root, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !isHidden(e.name) && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
    .map(e => {
      const file = path.join(dir, e.name, 'SKILL.md');
      const { data } = readMd(file);
      return {
        kind: 'skill',
        name: data.name || e.name,
        dirName: e.name,
        dir: path.join(dir, e.name),
        file,
        description: data.description || '',
        invocable: data.invocable === true,
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** agents/<name>.md → [{ name, file, description, tools, model, data }] */
function agents(root) {
  const dir = path.join(root, 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !isHidden(f))
    .map(f => {
      const file = path.join(dir, f);
      const { data } = readMd(file);
      return {
        kind: 'agent',
        name: data.name || f.replace(/\.md$/, ''),
        fileName: f,
        file,
        description: data.description || '',
        tools: data.tools || '',
        model: data.model || '',
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** rules/<name>.md → [{ name, file, description, data }] */
function rules(root) {
  const dir = path.join(root, 'rules');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !isHidden(f))
    .map(f => {
      const file = path.join(dir, f);
      const { data } = readMd(file);
      return {
        kind: 'rule',
        name: data.name || f.replace(/\.md$/, ''),
        fileName: f,
        file,
        description: data.description || '',
        applyTo: data.applyTo || '**',
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function all(root) {
  return { skills: skills(root), agents: agents(root), rules: rules(root) };
}

/** Validate frontmatter contracts. Returns [{ file, problem }]. */
function validate(root) {
  const problems = [];
  const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const s of skills(root)) {
    if (!s.data.name) problems.push({ file: s.file, problem: 'missing `name` in frontmatter' });
    else if (s.data.name !== s.dirName) problems.push({ file: s.file, problem: `name "${s.data.name}" != directory "${s.dirName}"` });
    else if (!kebab.test(s.data.name)) problems.push({ file: s.file, problem: 'name must be kebab-case' });
    if (!s.description) problems.push({ file: s.file, problem: 'missing `description` in frontmatter' });
  }
  for (const a of agents(root)) {
    if (!a.data.name) problems.push({ file: a.file, problem: 'missing `name`' });
    if (!a.description) problems.push({ file: a.file, problem: 'missing `description`' });
  }
  for (const r of rules(root)) {
    if (!r.description) problems.push({ file: r.file, problem: 'missing `description`' });
  }
  return problems;
}

module.exports = { skills, agents, rules, all, validate };
