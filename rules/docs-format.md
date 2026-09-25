---
name: docs-format
description: RULE-DOC-012 / RULE-DOC-013 — the shape of CHANGELOG.md and NOTES.md entries; every entry is versioned or coded, and every sub-heading carries that version or code so headings stay unique.
applyTo: "**"
---

# Changelog and notes format (RULE-DOC-012, RULE-DOC-013)

## The rule

Every changelog entry is a version section; every note is a coded section. Each sub-heading repeats the version or code, so no two headings in the file are the same (markdownlint MD024). New entries only: existing history is never reformatted.

## Why

The changelog is a verification record for the owner, not release publicity: it says what changed, how it works, what files moved and what was actually verified. Repeated plain headings (`### How it works` in every version) trip the linter and make links ambiguous; `### v0.17.0 — How it works` does neither.

## Changelog entry (RULE-DOC-012)

```markdown
## v0.17.0 — 2026-09-15 — "Short title of the change"

One paragraph: what changed and why, from the owner's point of view.

### v0.17.0 — Added
### v0.17.0 — Changed
### v0.17.0 — Fixed
### v0.17.0 — Removed
### v0.17.0 — Security
### v0.17.0 — How it works
### v0.17.0 — Notes
### v0.17.0 — Files changed
### v0.17.0 — Verification
```

- Newest version first. `##` = the version; `###` = its sub-sections, always prefixed with the same version.
- Use only the sub-sections that have content, in the order above. **Verification is mandatory.**
- Not released yet: keep the target version and put `unreleased` in the date slot; replace it with the date on release.
- A project without semantic versions uses its own identifier in the same slot (for example `## 2026-09-15.1 — …`), consistently.
- **Fixed** carries, per defect: bug as experienced · who or what was affected · root cause · why existing checks allowed it · the fix · regression coverage.
- **How it works** explains the mechanism a future reader needs, not a narrative of the session.
- **Files changed** lists paths (brace groups are fine: `src/{a,b}.ts`).
- **Verification** names every gate run and its result, and states plainly what was **not** run and why.

## Note entry (RULE-DOC-013)

```markdown
## N-012 — Short title

**Date:** 2026-09-15 · **Status:** open · **Related:** CHANGELOG v0.17.0, `src/file.ts`

### N-012 — Context
### N-012 — Decision / trigger to revisit
### N-012 — Resolution
```

- IDs are sequential and never reused: `N-###` in a project, `G-###` in the global `NOTES.md`.
- Status: `open` · `deferred` · `deliberate non-fix` · `resolved`. Add **Resolution** only when resolved, and update the status line then.
- Every sub-heading carries the note ID.

## How to apply

- Before writing an entry, read the file's latest entry and continue its numbering.
- A project may override this format in `docs/ai/ENGINEERING.md § 0`; the override wins.
- Never rewrite older entries to match this format.
