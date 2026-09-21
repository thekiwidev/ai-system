---
doc: AGENT-CORE
purpose: "Canonical agent instruction source: universal rules, startup, source-of-truth hierarchy, Git policy, autonomy boundaries, global system, navigation"
authority: canonical
hosts_rules: [RULE-CORE-001, RULE-CORE-002, RULE-CORE-003, RULE-CORE-004, RULE-GIT-001, RULE-AUTON-001, RULE-AUTON-002, RULE-AGENT-001]
mirrors_rules: [RULE-YAGNI-001, RULE-VERIF-001, RULE-DOC-001, RULE-WF-002]
last_reviewed: "{{DATE}}"
---

# AGENT-CORE — {{PROJECT}}

> This is the **one** canonical instruction source for every coding agent working in this repository — Claude Code, Codex, Gemini CLI / Antigravity, GitHub Copilot, Jules, Cursor and whatever comes next. `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` are symlinks to this file. There is no second rulebook.
>
> The repository is the durable source of truth. Nothing here depends on any model's private memory or on a chat transcript.

## 1. What this project is

<!-- Two or three sentences: product, owner, what it is for, the vocabulary agents must use and where it is defined (PRD §). Point to ARCHITECTURE.md for shape and MEMORY.md for current state. No invented facts. -->

## 2. Startup — the context-loading protocol (RULE-CORE-001)

Before answering a project question, planning, editing code, or acting on the repository, load the operating system, in this order:

0. `GLOBAL.md` from the global system (§ 8) — normally already loaded by your own global config.
1. This file.
2. [`MEMORY.md`](../../MEMORY.md) — current state, top to bottom, every session — read it through its derived copy [`context/MEMORY.md`](./context/MEMORY.md) when `kiwi ctx status` says current, otherwise the source (see § 12).
3. [`HANDOFF.md`](./HANDOFF.md) — if it reports active work, that is where you are.
4. [`WORKFLOW.md`](./WORKFLOW.md) — the task state machine you operate.
5. [`CONSTITUTION.md`](./CONSTITUTION.md) — the enduring principles.
6. [`INDEX.md`](./INDEX.md) — the map of everything else.

Then load **only** the task-specific context [`INDEX.md`](./INDEX.md) points you to: the PRD section, the active plan and its acceptance criteria, the relevant decisions, domain document, notes and — above all — the code, schema, migrations and tests that actually implement the behaviour. Read [`NOTES.md`](./NOTES.md) before raising something as new or "fixing" something deliberately left alone. If a source cannot be found, search the repository before asking; if it genuinely does not exist, do not invent it (RULE-CORE-003).

## 3. Source-of-truth hierarchy

When documents disagree, resolve in this order; if the hierarchy cannot resolve it, ask the owner, then fix the losing document so the conflict does not recur.

```text
1. Explicit owner instruction in the current task
2. PRD / specification — {{PRD_PATH}}
3. Active plan and its acceptance criteria — docs/ai/plans/active/
4. Accepted decisions — docs/ai/decisions/
5. MEMORY.md — current state
6. WORKFLOW.md · ENGINEERING.md · VERIFICATION.md · CONSTITUTION.md — how we operate
6a. GLOBAL.md and the global rules in ~/.thekiwidev — fill gaps, never override the above
7. NOTES.md — observations, deferrals, deliberate non-fixes
8. CHANGELOG.md — history
9. Agent assumptions
```

For **what is currently true**, the code, schema, migrations and passing tests outrank every document. For **what should be true**, the owner and the PRD outrank the code.

## 4. Locate the task before you act (RULE-CORE-002)

Every request is cross-checked against the active plan: is it in scope now, does it already have acceptance criteria, does it contradict the PRD or the plan? If it contradicts either, say so before implementing — never diverge silently. Product behaviour that none of the PRD, plan, or decisions specify is not yours to invent: record the question in `MEMORY.md` → Open Questions and ask (RULE-CORE-003).

## 5. Git — the owner controls history (RULE-GIT-001)

Inspect Git freely. Modify working-tree files when the task authorises implementation. **Never** create or switch branches, stage for convenience, commit, amend, rebase, merge, cherry-pick, reset, tag, release, push, or otherwise rewrite or publish history unless the owner explicitly authorises *that class of operation in the current interaction*. An authorisation covers only its stated scope — "commit this" does not mean "push". Never phrase an unapproved Git operation as though it has already happened.

When work is complete and verified, say so and stop:

```text
Implementation complete. Verification passed. Documentation synchronized.
The working tree is ready for your review and commit.
```

## 6. Autonomy and owner-approval boundaries (RULE-AUTON-001)

Proceed autonomously through routine implementation that this system or an approved plan already authorises. **Ask first**, and wait, before: changing product behaviour the PRD, plan, or decisions do not define · overriding an accepted decision or a fixed technology choice · resolving an unprovided product decision inside a PRD or plan · accepting a significant trade-off the documentation does not resolve · any destructive or irreversible data operation · spending money · any Git operation in § 5 · deleting or materially replacing project documentation.

**Fixed decisions are not relitigated** (RULE-AUTON-002): everything under `MEMORY.md` → Fixed Decisions and `docs/ai/decisions/`.

## 7. What "done" means

Nothing is done until [`VERIFICATION.md`](./VERIFICATION.md)'s gates pass, the documentation impact review in [`WORKFLOW.md`](./WORKFLOW.md) § Record has been run against the actual diff, and `MEMORY.md`, `CHANGELOG.md`, `NOTES.md` and `HANDOFF.md` say what is now true. A task with a failing gate, or with stale memory, is an in-progress task however complete the code looks.

## 8. The global system (RULE-CORE-004)

The owner keeps a personal, agent-agnostic system at **`~/.thekiwidev`** (or `$THEKIWIDEV_AI_HOME`): `GLOBAL.md` (the owner's constitution, ranked 6a above), `MEMORY.md` and `NOTES.md` (cross-project state and gotchas — read them; project facts never go there), `skills/<name>/SKILL.md`, `agents/<name>.md`, `rules/<name>.md`. It is installed into every agent's own global configuration.

When a skill, agent, workflow or rule is named — by the owner or by this system — resolve it in this order and stop at the first hit:

1. this repository's vendored copy: `.agents/skills/<name>/SKILL.md`, `.agents/rules/<name>.md`;
2. the global folder: `~/.thekiwidev/{skills,agents,rules}/<name>`;
3. your own installed copy of that name (the same files, linked there).

If none resolves (CI, a cloud agent, a machine without the global folder), say so and continue with `docs/ai/` alone — never invent the skill.

**The global folder is read-only from here (RULE-SCOPE-001).** Every write you make in this session stays inside this repository. A rule you are asked to change is changed as this project's override in [`ENGINEERING.md`](./ENGINEERING.md) § 0; something to remember goes in this project's `MEMORY.md` or [`NOTES.md`](./NOTES.md); a new skill goes in `.agents/skills/`. If the change belongs to every project, write the project version and propose the global one in your report — never edit `~/.thekiwidev` (or a path that resolves into it, such as `~/.claude/rules/*.md`) from this repository.

This project relies on these global skills by name: `create-prd` (product definition), `feature-workflow`, `bugfix-workflow`, `kiwi-system` (this system's initializer/upgrader){{EXTRA_GLOBAL_SKILLS}}. Vendored into the repo: {{VENDORED_OR_NONE}} (see [`SYSTEM.md`](./SYSTEM.md) → `vendored`). Project documents win on conflict; global rules fill gaps.

## 9. The principles, in one breath

YAGNI governs every line and every document; reuse before creation; the smallest correct change; validation and authorisation at every boundary; tests ship with the logic they test; documentation describes reality. Each has a canonical home — [`CONSTITUTION.md`](./CONSTITUTION.md), [`ENGINEERING.md`](./ENGINEERING.md), [`VERIFICATION.md`](./VERIFICATION.md) — and this section only points at them.

## 10. Agent entry points (RULE-AGENT-001)

One physical file. `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` are symlinks to `docs/ai/AGENT-CORE.md` (`kiwi link` maintains them; `.agents/rules/00-agent-core.md` points Antigravity here). Never create a second, independent rulebook for any agent; agent-specific needs that cannot be expressed here are recorded in [`SYSTEM.md`](./SYSTEM.md).

## 11. Output style

Caveman mode (the global `caveman` skill and rule): effective level = `CAVEMAN_DEFAULT_MODE` env → this repository's `.caveman.json` (`{"defaultMode": "off|lite|full|ultra"}`, currently {{CAVEMAN_SETTING}}) → the global default stated in your global instructions. `/caveman <level>`, `/caveman off` or "normal mode" change it for the session. It never applies to code, commits, or any document in this repository; use full clear sentences for security warnings and irreversible actions.

## 12. Derived context docs (RULE-DOC-011)

`docs/ai/context/<NAME>.md` are agent-facing copies of {{CONTEXT_DOCS_LIST}} in the caveman-ultra register — same facts, every ID/path/version exact, fewer tokens. Read the derived copy when `kiwi ctx status` reports it current; otherwise read the source. Whenever a task changes a source, regenerate its derived copy (`context-docs` skill) and `kiwi ctx stamp` before reporting done; a stale derived copy is a failed completion gate. Never edit a derived copy by hand; never compress a source.

## 13. This system describes itself

[`SYSTEM.md`](./SYSTEM.md) is the manifest — which initializer version built this (`kiwi_version`), which modules exist, which were deliberately not created, which defaults the owner overrode. [`RULES.md`](./RULES.md) is the registry — every rule, its one canonical home, every mirror. When the owner changes a rule, the registry is what tells you which files must change together; a rule changed in prose but not in the checklist, gate, or report format that operationalises it has not been changed.
