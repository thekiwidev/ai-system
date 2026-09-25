# AUDIT — drift detection, read-only

**Use when** no change is requested, or `kiwi context` says AUDIT (system current). **Spec:** INITIALIZER §27. Report; fix only trivially safe structural repairs (dead link with an unambiguous target, an `INDEX.md` entry for a file that plainly exists, a symlink repair) and only say so.

## Steps

1. **Intake** — `_shared.md` S1; declare *"AUDIT — no changes without approval"*.
2. **Mechanical checks** (§27.3) — run what is deterministic before reasoning: `kiwi doctor --project` (links, adapters, version); resolve every internal link in `docs/ai/`; confirm every path named in `MEMORY.md` and `ARCHITECTURE.md` exists; confirm every command in `VERIFICATION.md` exists in the package scripts (`kiwi context` lists them); compare `INDEX.md` and `SYSTEM.md` module lists to the real tree; grep for duplicated rule statements; compare code markers (`kiwi context` count; `git grep -n -E "TODO|FIXME|HACK"`) against `NOTES.md` coverage; compare `open_confirmations` with later documents; compare the working tree with `HANDOFF.md`'s claim; list every workflow outside `.agents/skills/` and every pair of workflows covering the same job (RULE-KIND-001 — `kiwi doctor` flags shape and registration, you flag duplicates).
3. **Assess each drift class** (§27.2): structural · rule · state · lifecycle · history · specification (`kiwi_version` older → recommend UPGRADE; pruned module whose reason no longer holds → recommend EXTEND) · manifest.
4. **Severity** (§27.4): CRITICAL (will mislead an agent) · HIGH · MEDIUM · LOW.
5. **Report** as the table `| ID | Severity | Class | Finding | Evidence | Proposed fix | Safe to auto-apply |`, highest severity first, then the one-line summary (`Audit clean. 0 critical …` or the counts). `NEEDS OWNER INPUT` is a valid outcome — never fabricate a fix.
6. Apply only the rows marked safe, list exactly what was touched, and end with the Git line. Anything touching project knowledge waits for the owner.
