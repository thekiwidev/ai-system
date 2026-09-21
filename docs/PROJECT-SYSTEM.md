# The project system — `docs/ai/` in every repository

Each project carries its own repository-native AI operating system so that any agent can enter, read the entry point plus the current-state documents, and continue correctly **without the previous agent's conversation**. The specification is [`skills/kiwi-system/INITIALIZER.md`](../skills/kiwi-system/INITIALIZER.md) (v3); this page is the short version.

## Shape

```text
<repo>/
├── AGENTS.md · CLAUDE.md · GEMINI.md · .github/copilot-instructions.md   → symlinks to docs/ai/AGENT-CORE.md
├── .agents/rules/00-agent-core.md                                       → pointer (Antigravity)
├── .agents/skills/, .agents/rules/                                      → vendored copies, only with `kiwi vendor`
├── MEMORY.md            current state — never a diary
├── CHANGELOG.md         history
└── docs/ai/
    ├── AGENT-CORE.md    the one canonical instruction file (rules, startup, hierarchy, git, autonomy, global system)
    ├── INDEX.md         the map
    ├── SYSTEM.md        manifest: kiwi_version, modules present/pruned, customizations, open confirmations
    ├── RULES.md         registry: every rule → canonical home + mirrors
    ├── CONSTITUTION.md · WORKFLOW.md · VERIFICATION.md · ARCHITECTURE.md · ENGINEERING.md
    ├── HANDOFF.md · NOTES.md
    ├── prd/             PRDs (default location; ADOPT keeps the existing one)
    ├── decisions/       ADRs      ├── plans/{active,completed}/      ├── domains/      ├── workflows/
    └── archive/         superseded docs, never deleted
```

## Modes

| Mode | When | Who starts it |
| --- | --- | --- |
| **INIT** | greenfield | "set up this project's AI system" |
| **ADOPT** | real code, no system (or a hand-written `CLAUDE.md`/`AGENT.md`) — the code is the description; derive facts first, present a confirmation table, migrate existing instruction files (never discard) | "set up this project's AI system" |
| **UPGRADE** | a system exists and is older than the current `kiwi_version` — dry-run delta table, owner approval, additive only, project knowledge untouched | "upgrade this project's AI system" |
| **AUDIT** | no change requested — report drift, fix only trivially safe structure | "audit this project's AI system" |
| **AMEND** | the owner states a new/changed rule — normalize, cascade to every mirror and executable artifact, orphan check | "AMEND: …" in chat |
| **EXTEND** | add a module previously pruned | "EXTEND: …" in chat |

## The hand-off between CLI and agent

Open the project in any agent and say **"set up this project's AI system"** (or *upgrade* / *audit*). The `kiwi-system` skill runs `kiwi agent`, gets the full brief, asks you what the repo cannot answer, writes `docs/ai/`, then runs `kiwi link` → `kiwi stamp` → `kiwi doctor --project`, and reports `Ready for owner review and commit` — it never commits. `kiwi init` / `kiwi upgrade` from a terminal are optional: they only detect the mode and print that same sentence.

## Global ↔ project

`GLOBAL.md` and the global rules sit at 6a in the project's source-of-truth hierarchy: **below** the project's own PRD, plan, decisions, memory and engineering rules, **above** notes and history. A project's `ENGINEERING.md` overrides a global rule on the same topic; where the project is silent, the global rule applies. Named skills resolve: vendored copy → `~/.thekiwidev` → the agent's own installed copy → "not available, continuing with docs/ai alone".

## Upgrading a v2-built project (e.g. one initialized before this system existed)

Say "upgrade this project's AI system" to the agent; it runs `kiwi link` and applies INITIALIZER §24.14: add the "Global system" section to `AGENT-CORE.md`, the `kiwi_version` / `global_system` / `prd_dir` / `vendored` fields to `SYSTEM.md`, register `RULE-CORE-004`, reference the global workflows in `workflows/INDEX.md`, repair entry points. Nothing in memory, notes, changelog, decisions, plans or domains changes.
