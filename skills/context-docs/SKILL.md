---
name: context-docs
description: Regenerate a project's derived, agent-facing context docs (docs/ai/context/*.md — caveman-ultra copies of MEMORY.md, NOTES.md, CHANGELOG.md) from their human-canonical sources, then stamp them; also the read protocol — read the derived copy only when `kiwi ctx status` says current. Use when a source changed, when kiwi ctx/doctor reports stale or missing, or when asked to "regenerate context docs".
invocable: true
---

# context-docs — derived, agent-facing copies

Two versions of the same knowledge: the **source** the owner reads and edits (`MEMORY.md`, `docs/ai/NOTES.md`, `CHANGELOG.md`, …) and the **derived** copy agents read (`docs/ai/context/<NAME>.md`), written in the caveman-ultra register so every session costs fewer tokens. The source is canonical and is **never** compressed, rewritten or touched by this skill. The derived copy is never edited by hand and never read by humans.

Which docs: `docs/ai/SYSTEM.md` → `context_docs` (e.g. `[MEMORY, NOTES, CHANGELOG]`). Empty = off.

## Read protocol (every session)

1. `kiwi ctx status` (or compare `source_sha256` in the derived frontmatter with `shasum -a 256 <source>`).
2. `current` → read the derived copy instead of the source. `stale` / `missing` → read the **source**, and regenerate the derived copy before the session ends (below).
3. Never trust a derived copy over its source when they disagree: the source wins, and the derived copy is stale by definition.

## Regenerate (when a source changed — part of RECORD in every task)

1. Read the source in full. Do not work from memory of it.
2. Write `docs/ai/context/<NAME>.md` from scratch (keep the existing frontmatter keys: `doc`, `purpose`, `authority: derived`, `source`, `source_sha256`, `generated_at`, `register: caveman-ultra`):
   - **Register:** caveman-ultra (the `caveman` skill's ultra level). Drop articles, filler, hedging, connectives; fragments; one fact once; no prose abbreviations, no arrows.
   - **Keep exact, always:** every identifier (`N-001`, `ADR-003`, `CUST-002`, `Q-01`, task IDs), every path, command, version, number, date, quoted error string, decision status, open question, deferred item, gotcha, and every section heading in source order. Compression is style only; nothing is omitted, summarised away, merged, or reordered.
   - **No additions:** never add facts, opinions or "helpful" context the source lacks.
   - Target: a third to a half of the source's tokens. If a section cannot get shorter without losing a fact, copy it.
3. Self-check before finishing: grep every ID and path from the source (`grep -oE 'N-[0-9]+|ADR-[0-9]+|CUST-[0-9]+|Q-[0-9]+|v[0-9]+\.[0-9]+\.[0-9]+' source | sort -u`) and confirm each appears in the derived copy. Missing one = not done.
4. `kiwi ctx stamp <NAME>` — records the source sha. Then `kiwi ctx status` must say `current`.
5. In the report's "Documentation synchronized" block list the derived copies as their own layer: `context/MEMORY — regenerated`.

Without the CLI: compute the sha with `shasum -a 256 <source>` and set `source_sha256` and `generated_at` in the derived frontmatter yourself.

## First-time (ADOPT, or after enabling)

`kiwi ctx init` creates placeholders. Regenerate each from its source as above — the first `MEMORY.md` derivation is usually the largest single token saving in the project. Add `docs/ai/context/` to `INDEX.md` under "Derived — agent-facing", and point the startup protocol at it (the `kiwi-system` templates already do).

## Never

- Never run any compression on the source files (this is the difference from upstream `caveman-compress`, which rewrites files in place).
- Never edit a derived file by hand to "fix" it — fix the source, regenerate.
- Never leave a stale derived copy at the end of a task; a stale copy is a failed completion gate (RULE-DOC-011).
