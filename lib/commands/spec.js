/**
 * kiwi spec — print a numbered section of INITIALIZER.md (depth on demand for the agent).
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const { fail } = require('../cli');

const help = `kiwi spec <section> | --toc | --find <text>

Prints one section of the initializer specification so an agent can read depth on demand
instead of the whole document.  Examples:
  kiwi spec 22.3        the reverse-engineering sweep
  kiwi spec 24          all of UPGRADE mode, subsections included
  kiwi spec --toc       every numbered heading
  kiwi spec --find prd  headings whose title contains "prd"`;

function specPath() {
  return paths.g('skills', 'kiwi-system', 'INITIALIZER.md');
}

/** [{ number, level, title, start, end }] over the numbered headings. */
function sections(text) {
  const lines = text.split('\n');
  const heads = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(#{1,4})\s+(\d+(?:\.\d+)*)\.?\s+(.*)$/);
    if (m) heads.push({ level: m[1].length, number: m[2], title: m[3].trim(), start: i });
  });
  heads.forEach((h, idx) => {
    let end = lines.length;
    for (let j = idx + 1; j < heads.length; j++) {
      if (heads[j].level <= h.level || !heads[j].number.startsWith(h.number + '.')) { end = heads[j].start; break; }
    }
    // a subsection ends at the next heading of the same or higher level
    for (let j = idx + 1; j < heads.length; j++) {
      if (heads[j].level <= h.level) { end = Math.min(end, heads[j].start); break; }
    }
    h.end = end;
  });
  return { lines, heads };
}

function section(text, number) {
  const { lines, heads } = sections(text);
  const h = heads.find(x => x.number === number);
  if (!h) return null;
  return lines.slice(h.start, h.end).join('\n').trim() + '\n';
}

async function run(args) {
  const text = fs.readFileSync(specPath(), 'utf8');
  const { heads } = sections(text);
  if (args.flags.toc) {
    for (const h of heads) console.log(`${'  '.repeat(h.level - 1)}${h.number}  ${h.title}`);
    return 0;
  }
  if (args.flags.find) {
    const q = String(args.flags.find).toLowerCase();
    for (const h of heads.filter(h => h.title.toLowerCase().includes(q))) console.log(`${h.number}  ${h.title}`);
    return 0;
  }
  const num = args._[0];
  if (!num) fail(help);
  const out = section(text, String(num).replace(/^§/, ''));
  if (!out) fail(`no section ${num} — try \`kiwi spec --toc\``);
  console.log(out);
  return 0;
}

module.exports = { run, help, sections, section, specPath };
