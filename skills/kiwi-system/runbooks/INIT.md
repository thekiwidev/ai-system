# INIT — greenfield

**Use when** `kiwi context` says INIT: no `docs/ai/AGENT-CORE.md`, no real code, no manifests, no hand-written instruction files. If any of those exist, this is ADOPT — switch runbooks.

**Spec:** INITIALIZER §1–§21 (plus §0.0 for the global system). **Output:** a Tier-0 + Tier-1 system built from the owner's supplied documents and answers.

## Steps

1. **Intake** — `_shared.md` S1. Ask the owner for anything they meant to supply: PRD, spec, README draft, architecture notes, a PRD-creation workflow of their own. Read what they give you (§2).
2. **Agent coverage** (§4) — default is all: Claude Code, Codex, Gemini CLI/Antigravity, Copilot, plus `AGENTS.md` for the rest. Confirm in one question only if the owner has hinted otherwise.
3. **Questions** (§7) — ask in batches, lettered options, only what the supplied documents do not answer:
   - identity and purpose (§7.1–7.2): name, owner, kind of project, problem, users, current goals, out of scope, which document is the product source of truth;
   - technology (§7.3): only what is not decided by supplied documents — languages, framework, package manager, mono/single, boundaries, where schema / contracts / tests will live;
   - architecture rules and engineering standards (§7.4–7.5): fixed decisions, prohibitions, security non-negotiables, type-safety, naming, lint/format, validation, testing expectations;
   - YAGNI specifics and autonomy (§7.6–7.7): what must not be generalised, when to stop and ask, what "done" means, what to update before ending a session;
   - documentation behaviour (§7.8): changelog style, anything owner-specific;
   - **the rules decision** (`_shared.md` S2b): for every global rule — adopt / override / not applicable — and any project-only rules (custom security, testing, git, style…);
   - which global skills this project relies on beyond the defaults (`create-prd`, `feature-workflow`, `bugfix-workflow`), and whether to vendor them for cloud agents (default no);
   - memory/notes: anything the owner wants recorded globally (cross-project) versus in this project.
   Also confirm: PRD location (default `docs/ai/prd/`), and whether to vendor global skills for cloud agents (default no).
4. **STOP** — present the answers back as the confirmation table (`_shared.md` S2) and the list of files you will create. Wait.
5. **Write, in this order** (§21): `docs/ai/AGENT-CORE.md` → `INDEX.md` → `CONSTITUTION.md` → `WORKFLOW.md` → `ENGINEERING.md` → `VERIFICATION.md` (only commands that will genuinely exist; if none yet, say so in the file) → `ARCHITECTURE.md` (intended shape, clearly marked as intended until code exists) → `MEMORY.md` at the repo root → `HANDOFF.md` ("no active work") → `NOTES.md` → `CHANGELOG.md` (empty, in the chosen style) → `workflows/INDEX.md` (global `create-prd`, `feature-workflow`, `bugfix-workflow`, `kiwi-system` by name) → `plans/`, `decisions/`, `domains/` only if there is real content (§9.15–9.17; otherwise record as pruned) → `RULES.md` (register every rule you wrote) → `SYSTEM.md` **last** (§23; `mode_history` INIT; pruned modules with reasons; `open_confirmations`).
6. **Global system section** — `AGENT-CORE.md` § 8 exactly per the template (§9.1.1). If the owner chose to vendor: `kiwi vendor <names>`.
7. **Derived context docs** — `_shared.md` S3b if enabled.
8. **Finish** — `_shared.md` S4: `kiwi link` → `kiwi stamp [--prd-dir …]` → `kiwi doctor --project` → INIT report (§18): created · reused/migrated · agent coverage · canonical source · linking strategy · decisions captured · questions still open · next use · Git status.
