/**
 * Managed blocks: a region inside a user-owned file that kiwi owns and rewrites idempotently.
 * Everything outside the markers is never touched.
 */
const START = '<!-- kiwi:start (managed by ~/.thekiwidev — do not edit inside this block) -->';
const END = '<!-- kiwi:end -->';

function render(inner) {
  return `${START}\n${inner.trim()}\n${END}`;
}

/** Return the file text with the managed block set to `inner` (inserted at the top if absent). */
function apply(text, inner) {
  const block = render(inner);
  const re = new RegExp(`${escape(START)}[\\s\\S]*?${escape(END)}`);
  if (text && re.test(text)) return text.replace(re, block);
  if (!text || !text.trim()) return block + '\n';
  return block + '\n\n' + text.replace(/^\n+/, '');
}

/** 'ok' | 'stale' | 'missing' */
function status(text, inner) {
  if (!text) return 'missing';
  const re = new RegExp(`${escape(START)}[\\s\\S]*?${escape(END)}`);
  const m = text.match(re);
  if (!m) return 'missing';
  return m[0] === render(inner) ? 'ok' : 'stale';
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { START, END, render, apply, status };
