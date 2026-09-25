---
name: kinds
description: Every repeatable thing the system holds (workflow, skill, rule, agent, plan, decision, PRD) has exactly one kind, one home per scope, one template and one index; agents create and update them only in that shape, and run a matching workflow when a request fits its triggers.
applyTo: "**"
---

# Kinds — one shape per repeatable thing (RULE-KIND-001, RULE-KIND-002)

## The rule

**RULE-KIND-001.** Anything the owner may ask to "set up", "create", "add" or "update" is one of the kinds below. It lives in the one home for its scope, starts from the one template for its kind, and is registered in the one index for its kind. There are no alternative homes and no free-form variants: two agents asked for the same thing produce the same file in the same place.

**RULE-KIND-002.** Before classifying any task, check whether it matches a workflow's triggers (project workflows first, then global ones). When it does, run that workflow exactly as written; the owner naming or triggering a workflow is the approval for every step in it — including Git or publishing steps, but only those the owner wrote into the workflow; nothing beyond its steps is approved. A workflow that does not cover the situation is not improvised around: stop and ask, then offer to update the workflow.

## The kinds

| Kind | Global home (edit only in `~/.thekiwidev`) | Project home | Template | Registered in | Create / update with |
| --- | --- | --- | --- | --- | --- |
| **workflow** — a repeatable operational procedure run the same way every time (release, build, deploy, migrate) | `skills/<name>/SKILL.md` with `kind: workflow` | `.agents/skills/<name>/SKILL.md` with `kind: workflow` (+ `.claude/skills/<name>` symlink) | `skills/_template-workflow/SKILL.md` | project: `docs/ai/workflows/INDEX.md`; global: the skill list | `create-workflow` skill; `kiwi new workflow <name>` |
| **skill** — reusable know-how or a procedure that is not a fixed operational run | `skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` (+ `.claude/skills/<name>` symlink) | `skills/_template/SKILL.md` | project: `docs/ai/workflows/INDEX.md` § Skills | `kiwi-author` skill; `kiwi new skill <name>` |
| **rule** — always-on convention, short and verifiable | `rules/<name>.md` | canonical section of `docs/ai/ENGINEERING.md` / `CONSTITUTION.md`; a rule file for rule-directory agents in `.agents/rules/<name>.md` | `rules/_template.md` | project: `docs/ai/RULES.md` | project: "AMEND: …" (`kiwi-system` AMEND runbook); global: `kiwi new rule <name>` |
| **agent** — specialist sub-agent definition | `agents/<name>.md` | `.github/agents/<name>.agent.md` | `agents/_template.md` | project: `docs/ai/INDEX.md` | `kiwi-author` skill; `kiwi new agent <name>` |
| **plan** — what will be done, in what order, and what "done" means | — (project only) | `docs/ai/plans/active/<name>.md`, moved to `completed/` when done | `docs/ai/plans/PLAN-TEMPLATE.md` | `docs/ai/plans/INDEX.md` | `kiwi-author` skill; `kiwi new plan <name>` |
| **decision** — a durable choice and its reasoning (ADR) | — (project only) | `docs/ai/decisions/ADR-NNN-<name>.md` | `docs/ai/decisions/ADR-TEMPLATE.md` | `docs/ai/decisions/INDEX.md` | `kiwi-author` skill; `kiwi new decision <name>` |
| **PRD** — product requirements for a new capability | — (project only) | `SYSTEM.md` → `prd_dir` (default `docs/ai/prd/`), `prd-<name>.md` | structure inside the `create-prd` skill | `docs/ai/INDEX.md` | `create-prd` skill (interview first — never a blank scaffold) |

## Scope — global or project

- Opened in a project: the project home, always (RULE-SCOPE-001). If the thing belongs everywhere, write the project version and propose the global one in the report.
- Opened in `~/.thekiwidev`: the global home.
- A named thing resolves project first, then global. "Update the X workflow" from a project, when X is global: copy it into the project home, change the copy, register it — the project copy now wins. Never edit the global file from a project.

## Updating an existing one

1. Resolve it by name (project, then global). Read all of it before changing anything.
2. Change it in place, in its home, keeping its template's section structure.
3. Bump `version` (workflows) and `last_reviewed` where the kind has them; keep its index row accurate.
4. Record the change where the scope records changes: project `CHANGELOG.md`, or the global `CHANGELOG.md`.

## How to apply

- Asked to create or update any kind: use the skill in the table; do not hand-roll a new shape.
- Found a second file for the same thing, or a file in a non-home location (for example `docs/ai/workflows/<NAME>.md`, `docs/<NAME>_WORKFLOW.md`): report it; migration happens through UPGRADE with the owner's approval, never silently.
- `kiwi doctor` checks workflow structure and project workflow registration; a failing check means the workflow is not ready to run.
