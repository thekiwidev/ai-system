/**
 * Minimal YAML frontmatter parser/serializer — zero dependencies.
 *
 * Supports the subset used by SKILL.md / agent / rule files:
 *   key: value            (string, number, boolean, null)
 *   key: "quoted string"
 *   key: [a, b, c]        (inline list)
 *   key:                  (block list)
 *     - item
 * Anything more exotic is kept as a raw string.
 */

function parseScalar(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).replace(/\\"/g, '"');
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(s => parseScalar(s));
  }
  return v;
}

/**
 * Parse a markdown document into { data, body, raw }.
 * `data` is {} when no frontmatter block is present.
 */
function parse(text) {
  const src = text.replace(/^﻿/, '');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src, hasFrontmatter: false };

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let currentKey = null;
  let block = null; // 'fold' for `>`, 'keep' for `|` — collects indented continuation lines

  for (const line of lines) {
    if (block && /^\s+\S/.test(line)) {
      data[currentKey] = data[currentKey] ? data[currentKey] + (block === 'fold' ? ' ' : '\n') + line.trim() : line.trim();
      continue;
    }
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = line.match(/^\s+-\s*(.*)$/);
    if (listItem && currentKey !== null && !block) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(listItem[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const rest = kv[2].trim();
      if (/^[>|][-+]?$/.test(rest)) { block = rest.startsWith('>') ? 'fold' : 'keep'; data[currentKey] = ''; continue; }
      block = null;
      data[currentKey] = rest === '' ? [] : parseScalar(rest);
      continue;
    }
    // continuation of a multi-line scalar — append
    if (currentKey !== null && typeof data[currentKey] === 'string') {
      data[currentKey] += ' ' + line.trim();
    }
  }

  return { data, body: src.slice(m[0].length), hasFrontmatter: true };
}

function serializeValue(v) {
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    return '[' + v.map(serializeValue).join(', ') + ']';
  }
  if (typeof v === 'boolean' || typeof v === 'number' || v === null) return String(v);
  const s = String(v);
  if (/[:#\[\]{}"'\n|>*&!%@`,?]|^\s|\s$|^-/.test(s) || s === '' || /^(true|false|null|~|-?\d+(\.\d+)?)$/.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

/** Serialize { data, body } back into a markdown document. */
function stringify(data, body = '') {
  const keys = Object.keys(data || {});
  if (keys.length === 0) return body;
  const lines = keys.map(k => `${k}: ${serializeValue(data[k])}`);
  return `---\n${lines.join('\n')}\n---\n${body.startsWith('\n') ? body : '\n' + body}`;
}

/** Replace a single top-level frontmatter key in a document, preserving everything else. */
function setKey(text, key, value) {
  const { data, body, hasFrontmatter } = parse(text);
  if (!hasFrontmatter) return stringify({ [key]: value }, text);
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const block = m[1];
  const re = new RegExp(`^${key}:.*$`, 'm');
  const line = `${key}: ${serializeValue(value)}`;
  const newBlock = re.test(block) ? block.replace(re, line) : block + '\n' + line;
  void data; void body;
  return text.replace(m[0], `---\n${newBlock}\n---\n`);
}

module.exports = { parse, stringify, setKey, parseScalar };
