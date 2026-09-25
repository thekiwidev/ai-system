# ADOPT — existing codebase, no coherent system

**Use when** `kiwi context` says ADOPT: real code, manifests or history exist and there is no `docs/ai/AGENT-CORE.md` — or only hand-written instruction files (`AGENT.md`, `CLAUDE.md`, `.cursorrules`…). Those files are high-value project knowledge: **mine them, migrate them, never discard them.**

**Spec:** INITIALIZER §22 first, then §1–§21. **Principle:** the code is the description; owner documents may be aspirational. Document reality; record intent separately as a gap (§22.1).

## Steps

1. **Intake** — `_shared.md` S1. `kiwi context` already gives lockfiles, scripts, workspaces, CI, TS strictness, marker counts, in-flight changes. Note the working tree: uncommitted changes go into `HANDOFF.md` as `[inferred]` in-flight work (§22.12) — never tidy, stash, or commit.
2. **Reverse-engineering sweep** (§22.3) — read, in this order of trust (§22.2): source and its import graph → schema/migrations/generated types → lockfiles/manifests → executing config (CI, build, lint, tsconfig) → passing tests → env examples/deploy config → history → existing docs → owner prose. Establish: toolchain and real commands; type posture; structure and boundaries; data and contracts; quality enforcement; operational reality; latent knowledge (`TODO/FIXME/HACK`, long comments, skipped tests, workarounds).
3. **Mine existing instruction files** — every still-valid rule in `AGENT.md` / `CLAUDE.md` / `.cursorrules` / `.github/copilot-instructions.md` etc. is carried into the new system and registered in `RULES.md` with origin `owner`. Build the migration ledger (§22.9): `KEEP · CANONICALIZE · MERGE · SUPERSEDE · INDEX · SPLIT · OWNER-DECISION` per file. Nothing is deleted; `SUPERSEDE` means `docs/ai/archive/` with a header.
4. **Convention conflicts** (§22.6) — where the code does the same thing two ways, number them `C-01…`, state locations and prevalence. Do not document both as acceptable.
5. **STOP — present, then ask** (§22.5, §22.13 items 2–4):
   - the derived-facts confirmation table with `[verified]` / `[inferred]` / `[unconfirmed]` tags;
   - the numbered convention conflicts, asking which is canonical and whether touched legacy code is migrated opportunistically or left alone;
   - the migration ledger, asking approval for anything beyond `KEEP`;
   - the questions code cannot answer: product intent and priorities, out of scope, prohibited technologies/patterns going forward, what is legacy/deprecated, intentional vs tolerated vs defective behaviour, stable vs in-flux areas, non-negotiable security/compliance/performance, deliberate non-fixes, the authoritative product document, autonomy boundaries, documentation/reporting preferences;
   - **the rules decision** (`_shared.md` S2b): for every global rule — adopt / override / not applicable — plus project-only rules mined from existing instruction files or requested now (custom security, testing, git, style…);
   - which global skills this project relies on beyond the defaults, and whether to vendor them (default no);
   - the adoption tier (§22.7): propose Tier 0 + 1; list Tier 2 items individually with a justification each;
   - PRD location (keep the existing one if any; else default `docs/ai/prd/`); vendoring (default no).
   Wait for answers.
6. **Write Tier 0** (§22.7): `AGENT-CORE.md` (with § 8 Global system), `INDEX.md`, `WORKFLOW.md`, `VERIFICATION.md` (the repository's real commands from `kiwi context`), `MEMORY.md` at root seeded from the sweep (§22.11 — Current Position, Fixed Decisions, Architecture, Features incl. partial ones, Environment, Gotchas, Deferred Work, Deviations, Open Questions), `HANDOFF.md` with in-flight work, `RULES.md`, `SYSTEM.md` last.
7. **Write Tier 1**: `CONSTITUTION.md`, `ARCHITECTURE.md` (as it is), `ENGINEERING.md` (canonical patterns from step 5; legacy patterns to `NOTES.md` with status), `NOTES.md` (markers, conflicts, deferrals), integrate the existing `CHANGELOG.md` (never replace; adopt its style).
8. **Tier 2 only where approved**: `domains/` (highest-risk first; §22.10 — never a directory listing), retro-ADRs (§22.8; 5–10 max; rationale `[inferred]` or "not recorded" — never fabricated), `plans/` for real planned work, project workflows for real reusable procedures — each in `.agents/skills/<name>/SKILL.md` via the `create-workflow` skill (RULE-KIND-001), registered in `workflows/INDEX.md`, which also references the global workflows by name. Existing workflow guides are listed and migrated only on the owner's yes (as UPGRADE `V3-13`).
9. **Archive** superseded documents with headers; update `INDEX.md` → Historical.
10. **Derived context docs** — `_shared.md` S3b if enabled (after the sources are final).
11. **Finish** — `_shared.md` S4: `kiwi link` (hand-written entry points you migrated are now replaced by symlinks — only after their content is carried over and archived) → `kiwi stamp [--prd-dir …]` → `kiwi doctor --project` → ADOPT report (§22.13, ten items, including the owner confirmation queue and any security findings such as committed secrets).
