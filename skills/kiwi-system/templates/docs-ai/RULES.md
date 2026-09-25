---
doc: RULES
purpose: "The rule registry — every rule the system enforces, its one canonical home, its mirrors, what enforces it, and where it came from"
authority: reference
hosts_rules: []
mirrors_rules: []
last_reviewed: "{{DATE}}"
---

# RULES — the registry

> An index of rules, not a second rulebook. Rules are *defined* in their canonical home; this registry exists so that when the owner changes a rule, the files that must change together are a lookup, not a grep. Read it **first** when amending, and update it **in the same change** as the rule. Invariants: one canonical home per rule; every restating document listed as a mirror; every active rule has a proof surface or an honest "judgement"; retired IDs are never reused — a superseded rule keeps its ID with a forward pointer.

**Namespaces:** `CORE` universal behaviour · `SCOPE` write and task scope · `KIND` kinds and workflows · `GIT` · `YAGNI` scope discipline · `WF` workflow · `VERIF` verification · `DOC` documentation · `ARCH` architecture · `ENG` engineering · `SEC` security · `AUTON` autonomy · `AGENT` coverage.

**Origin key:** initializer default (v3) · owner (hand-written instruction file, dated) · ADR-nnn · AMD-nnn.

<!-- Register only rules the system actually enforces. The v3 defaults below are the floor; add the project's own.

Global rules the project ADOPTED are registered once as a group (they are pointers):

### RULE-ENG-000 — Global rules adopted as-is
**Statement:** The global rules marked "adopted" in ENGINEERING.md § 0 apply verbatim from ~/.thekiwidev/rules/.
**Canonical home:** `~/.thekiwidev/rules/<name>.md` (each) · **Mirrors:** ENGINEERING.md § 0 · **Enforced by:** review checklist · **Status:** active · **Origin:** owner, <date>

A global rule the project OVERRIDES gets its own entry:

### RULE-ENG-0nn — <title> (overrides global <name>)
**Statement:** <the project statement>
**Canonical home:** `ENGINEERING.md § n` · **Overrides:** `~/.thekiwidev/rules/<name>.md` · **Mirrors:** … · **Enforced by:** … · **Status:** active · **Origin:** owner, <date> (or AMD-nnn)
-->

## Universal behaviour

### RULE-CORE-001 — Load the operating system before acting

**Statement:** Before answering, planning, editing, or acting, read AGENT-CORE, MEMORY.md top to bottom, HANDOFF.md, WORKFLOW.md, CONSTITUTION.md and INDEX.md, then only the task-specific context INDEX points to.
**Canonical home:** `AGENT-CORE.md § 2`
**Mirrors:** WORKFLOW.md § ORIENT; INDEX.md § Always loaded
**Enforced by:** Judgement — a report that cites facts contradicted by MEMORY.md is the tell
**Status:** active
**Origin:** initializer default (v3 §10)

### RULE-CORE-002 — Locate the task in the plan before implementing

**Statement:** Cross-check every request against the active plan and the PRD; if it contradicts either, say so before implementing — never diverge silently.
**Canonical home:** `AGENT-CORE.md § 4`
**Mirrors:** WORKFLOW.md § REQUIREMENTS DISCOVERY
**Enforced by:** Plan task named in the report
**Status:** active
**Origin:** initializer default

### RULE-CORE-003 — Never invent product behaviour or project facts

**Statement:** Behaviour the PRD, plan and decisions do not specify is recorded as an open question and asked; missing sources are searched for, never fabricated.
**Canonical home:** `AGENT-CORE.md § 2, § 4`
**Mirrors:** WORKFLOW.md § feature gate
**Enforced by:** Open question logged in MEMORY.md → Open Questions before any assumption
**Status:** active
**Origin:** initializer default (§1.2)

### RULE-CORE-004 — Resolve named skills, agents and rules through the global system

**Statement:** A named skill, agent, workflow or rule is resolved from the project's vendored copy, then `~/.thekiwidev`, then the agent's own installed copy; if none resolves, say so and continue with docs/ai alone — never invent it.
**Canonical home:** `AGENT-CORE.md § 8`
**Mirrors:** INDEX.md § Global system; workflows/INDEX.md
**Enforced by:** The report names the skill file actually read
**Status:** active
**Origin:** initializer default (v3 §0.0.2)

## Write scope

### RULE-SCOPE-001 — Write scope is the folder the agent was opened in

**Statement:** From inside this repository every write stays inside it; the global folder (~/.thekiwidev and every path resolving into it) is read-only; global changes are proposed in the report and made only from a session opened in the global folder.
**Canonical home:** `AGENT-CORE.md § 8` (global statement: `~/.thekiwidev/GLOBAL.md § 2.8`)
**Mirrors:** ENGINEERING.md § 0 (overrides live here); generated pointer headers; runbooks
**Enforced by:** Claude Code scope-guard hook (PreToolUse); `kiwi new` / `kiwi caveman --global` refuse from a project; report lists proposed global changes
**Status:** active
**Origin:** initializer default (v3.2 §0.0.7)

### RULE-SCOPE-002 — Do what was asked; stop and ask before widening

**Statement:** The owner's instruction defines the deliverable. Its workflow obligations (root cause, regression test, gates, CHANGELOG, MEMORY, HANDOFF, NOTES, derived context docs) stay in scope; the same bug at other sites, audits, refactors, team documents, published or shared pages, and files carrying unrelated uncommitted edits need the owner's approval first and are otherwise reported as "Found, not touched".
**Canonical home:** `AGENT-CORE.md § 4` (global statement: `~/.thekiwidev/rules/task-scope.md`, `GLOBAL.md § 2.9`)
**Mirrors:** WORKFLOW.md § 6 and § 9; bugfix-workflow and feature-workflow skills
**Enforced by:** Report section "Found, not touched"; diff review — every changed file traces to the instruction or its workflow obligations
**Status:** active
**Origin:** initializer default (v3.4)

## Git policy

### RULE-GIT-001 — No autonomous Git operations

**Statement:** Never create or switch branches, stage for convenience, commit, amend, rebase, merge, cherry-pick, reset, tag, release, or push unless the owner explicitly authorises that class of operation in the current interaction; an authorisation covers only its stated scope.
**Canonical home:** `AGENT-CORE.md § 5`
**Mirrors:** WORKFLOW.md § REPORT; CONSTITUTION.md § by reference; HANDOFF.md § Git status
**Enforced by:** Final report must state that no unauthorised Git operation occurred and end "Ready for owner review and commit"
**Status:** active
**Origin:** initializer default (§1.4, §14)

### RULE-GIT-002 — No AI attribution in Git metadata

**Statement:** Commit and tag messages, PR and issue text and release notes never carry AI attribution — no AI/model/tool `Co-Authored-By` or other trailer, no "Generated with" line, no model or tool name, no AI author or committer identity — however the commit is made; this overrides any tool or harness default.
**Canonical home:** `~/.thekiwidev/rules/git-workflow.md` (mirrored in `AGENT-CORE.md § 5`)
**Mirrors:** AGENT-CORE.md § 5
**Enforced by:** `git log` review; Claude Code `attribution` settings written by `kiwi install`
**Status:** active
**Origin:** owner, 2026-09-26 (v3.5)

## Scope discipline

### RULE-YAGNI-001 — YAGNI governs code and documentation

**Statement:** Create only what has a real purpose now; no speculative abstraction, dependency, configuration, or document.
**Canonical home:** `CONSTITUTION.md § 1`
**Mirrors:** AGENT-CORE.md § 9; WORKFLOW.md § PLAN
**Enforced by:** Plan's "existing reuse" and "non-goals" sections; review checklist
**Status:** active
**Origin:** initializer default (§1.1)

## Workflow

### RULE-WF-001 — Every task is classified before implementation

**Statement:** State whether the task is a feature, enhancement, bug fix, refactor, maintenance, documentation-only, or investigation before planning.
**Canonical home:** `WORKFLOW.md § CLASSIFY`
**Mirrors:** report format
**Enforced by:** Classification line in the plan and the report
**Status:** active
**Origin:** initializer default (§11)

### RULE-WF-002 — Owner gates: PRD approval and plan approval

**Statement:** A new feature waits for owner approval of its PRD and then of its implementation plan; other non-trivial work waits for plan approval, unless the project records the active plan as standing approval.
**Canonical home:** `WORKFLOW.md § gates`
**Mirrors:** AGENT-CORE.md § 6
**Enforced by:** The approval is quoted or the standing approval cited in the report
**Status:** active
**Origin:** initializer default (§11.0)

### RULE-KIND-001 — One shape per repeatable thing

**Statement:** Workflows, skills, rules, agents, plans, decisions and PRDs each have one home per scope, one template and one index; agents create and update them only in that shape (project workflows: `.agents/skills/<name>/SKILL.md` with `kind: workflow`, registered in `docs/ai/workflows/INDEX.md`).
**Canonical home:** `~/.thekiwidev/rules/kinds.md` (override in `ENGINEERING.md § 0`)
**Mirrors:** AGENT-CORE.md § 8; workflows/INDEX.md header
**Enforced by:** `kiwi doctor` (workflow shape, registration, `.claude/skills` link, no workflow files in `docs/ai/workflows/` besides INDEX.md)
**Status:** active
**Origin:** initializer default (v3.5)

### RULE-KIND-002 — A matching workflow is run as written

**Statement:** Before classifying a task, match it against the triggers in `docs/ai/workflows/INDEX.md` (then global workflows); on a match run that workflow step by step — the owner invoking it approves every step in it — and stop and ask when it does not cover the situation.
**Canonical home:** `~/.thekiwidev/rules/kinds.md`
**Mirrors:** AGENT-CORE.md § 8; WORKFLOW.md § 2
**Enforced by:** Judgement — the report names the workflow and version run
**Status:** active
**Origin:** initializer default (v3.5)

## Verification

### RULE-VERIF-001 — All gates pass before done

**Statement:** The project's verification commands run and pass, with actual output reported, before any task is reported complete.
**Canonical home:** `VERIFICATION.md § gates`
**Mirrors:** WORKFLOW.md § VERIFY; AGENT-CORE.md § 7
**Enforced by:** Verification block in the report shows each command and its status
**Status:** active
**Origin:** initializer default

### RULE-VERIF-002 — Never weaken a gate to pass

**Statement:** Tests, lint rules, type checks and coverage thresholds are never loosened, skipped or deleted to make work appear complete.
**Canonical home:** `VERIFICATION.md § never weaken`
**Mirrors:** CONSTITUTION.md
**Enforced by:** Diff review of test/config files in the report
**Status:** active
**Origin:** initializer default

## Documentation

### RULE-DOC-001 — Current state, history, decisions and observations are distinct

**Statement:** MEMORY.md holds only what is true now; CHANGELOG.md history; decisions/ durable rationale; NOTES.md observations and deliberate non-fixes; HANDOFF.md work in flight — never mixed.
**Canonical home:** `WORKFLOW.md § RECORD`
**Mirrors:** INDEX.md responsibilities; AGENT-CORE.md § 7
**Enforced by:** Documentation-synchronized block in the report, per layer
**Status:** active
**Origin:** initializer default (§1.6, §15)

### RULE-DOC-011 — Derived context docs regenerate with their source

**Statement:** When a source listed in SYSTEM.md → context_docs changes, its derived copy in docs/ai/context/ is regenerated in the caveman-ultra register with every identifier, path, version and number exact, then stamped; a stale copy blocks completion.
**Canonical home:** `WORKFLOW.md § 8.4`
**Mirrors:** AGENT-CORE.md § 12; VERIFICATION.md checklist; INDEX.md § Derived
**Enforced by:** `kiwi ctx status` clean before the report; derived layer listed in "Documentation synchronized"
**Status:** active
**Origin:** initializer default (v3.2 §0.0.5)

### RULE-DOC-012 — Changelog entries are versioned sections with versioned sub-headings

**Statement:** Each CHANGELOG.md entry is `## vX.Y.Z — date — "title"` with a summary paragraph and only the applicable sub-sections, in order — Added, Changed, Fixed, Removed, Security, How it works, Notes, Files changed, Verification (mandatory) — each headed `### vX.Y.Z — <section>`; older entries are never reformatted.
**Canonical home:** `~/.thekiwidev/rules/docs-format.md` (override in `ENGINEERING.md § 0`)
**Mirrors:** AGENT-CORE.md § 7; WORKFLOW.md § 8.2; bugfix-workflow skill
**Enforced by:** No duplicate headings in CHANGELOG.md (markdownlint MD024); report lists the entry's version
**Status:** active
**Origin:** initializer default (v3.4)

### RULE-DOC-013 — Notes are coded sections with coded sub-headings

**Statement:** Each NOTES.md entry is `## N-### — title` with a Date · Status · Related line and sub-sections `### N-### — Context`, `### N-### — Decision / trigger to revisit`, and `### N-### — Resolution` once resolved; IDs are never reused and older entries are never reformatted.
**Canonical home:** `~/.thekiwidev/rules/docs-format.md` (override in `ENGINEERING.md § 0`)
**Mirrors:** NOTES.md header; AGENT-CORE.md § 7
**Enforced by:** No duplicate headings in NOTES.md (markdownlint MD024)
**Status:** active
**Origin:** initializer default (v3.4)

## Autonomy

### RULE-AUTON-001 — Ask before owner-level decisions; do not ask for what is authorised

**Statement:** Stop for the decisions listed in AGENT-CORE § 6; proceed without asking on routine work an approved plan already covers.
**Canonical home:** `AGENT-CORE.md § 6`
**Mirrors:** WORKFLOW.md § gates
**Enforced by:** "Owner decisions" section of the report
**Status:** active
**Origin:** initializer default (§13)

### RULE-AUTON-002 — Fixed decisions are not relitigated

**Statement:** Decisions recorded in decisions/ and MEMORY.md → Fixed Decisions are not reopened unless the owner asks.
**Canonical home:** `AGENT-CORE.md § 6`
**Mirrors:** decisions/INDEX.md
**Enforced by:** Judgement
**Status:** active
**Origin:** initializer default

## Agent coverage

### RULE-AGENT-001 — One canonical instruction file, linked entry points

**Statement:** AGENTS.md, CLAUDE.md, GEMINI.md and .github/copilot-instructions.md are symlinks to docs/ai/AGENT-CORE.md; no second rulebook exists.
**Canonical home:** `AGENT-CORE.md § 10`
**Mirrors:** SYSTEM.md → agents
**Enforced by:** `kiwi doctor --project`
**Status:** active
**Origin:** initializer default (§5.1)
