---
doc: INDEX
purpose: "The map of the AI system: what each document is for, what is always loaded, what is loaded per task, where state and history live"
authority: reference
hosts_rules: []
mirrors_rules: [RULE-CORE-001]
last_reviewed: "{{DATE}}"
---

# INDEX — the map of the {{PROJECT}} AI system

> A navigation map, not a copy of any document. If a document is not listed here it does not exist or is not authoritative.

## Always loaded, in this order (RULE-CORE-001)

| Document | Responsibility |
| --- | --- |
| [`AGENT-CORE.md`](./AGENT-CORE.md) | Universal rules, startup, hierarchy, Git policy, autonomy, global system |
| [`../../MEMORY.md`](../../MEMORY.md) | What is true **now** — never a diary |
| [`HANDOFF.md`](./HANDOFF.md) | Work in flight and the next action; "no active work" when clear |
| [`WORKFLOW.md`](./WORKFLOW.md) | The task state machine: classify → gates → implement → verify → record → report |
| [`CONSTITUTION.md`](./CONSTITUTION.md) | Enduring principles |

## Loaded when the task calls for it

| Document | Read it when |
| --- | --- |
| {{PRD_PATH}} | the task touches product behaviour — the authoritative product text |
| [`plans/INDEX.md`](./plans/INDEX.md) | starting any task — find the active plan and its acceptance criteria |
| [`decisions/INDEX.md`](./decisions/INDEX.md) | a choice feels open — it may already be decided |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | changing structure, boundaries, persistence, integrations |
| [`ENGINEERING.md`](./ENGINEERING.md) | writing any code — the conventions that actually apply |
| [`VERIFICATION.md`](./VERIFICATION.md) | before declaring anything done |
| [`domains/INDEX.md`](./domains/INDEX.md) *(if applicable)* | working inside a specific domain |
| [`NOTES.md`](./NOTES.md) | before treating anything as new — deferrals, non-fixes, gotchas (entries: `## N-###`, coded sub-headings, RULE-DOC-013) |
| [`workflows/INDEX.md`](./workflows/INDEX.md) | before classifying any task — the request may match a workflow's triggers (RULE-KIND-002); also PRD creation, feature, bug fix |
| [`../../CHANGELOG.md`](../../CHANGELOG.md) | history matters to the task — never read whole for a small task (entries: `## vX.Y.Z`, versioned sub-headings, RULE-DOC-012) |

## The system about itself

| Document | Responsibility |
| --- | --- |
| [`SYSTEM.md`](./SYSTEM.md) | Manifest: version, modules present/pruned, customizations, open confirmations |
| [`RULES.md`](./RULES.md) | Registry: every rule, canonical home, mirrors, proof surface |
| `UPGRADES.md` / `AMENDMENTS.md` | Append-only logs — created on the first upgrade / amendment |

## Global system

`~/.thekiwidev` (or `$THEKIWIDEV_AI_HOME`): `GLOBAL.md`, `MEMORY.md` + `NOTES.md` (cross-project only), `skills/`, `agents/`, `rules/` — resolution order and fallback in [`AGENT-CORE.md`](./AGENT-CORE.md) § 8. This project's own memory and notes are `../../MEMORY.md` and [`NOTES.md`](./NOTES.md). Vendored copies, when any: `.agents/skills/`, `.agents/rules/`.

## Derived — agent-facing *(when `context_docs` is set)*

| Derived copy | Source (canonical) | Rule |
| --- | --- | --- |
| [`context/MEMORY.md`](./context/MEMORY.md) | `../../MEMORY.md` | read the copy when current (`kiwi ctx status`), else the source; regenerate with the source |
| [`context/NOTES.md`](./context/NOTES.md) | `NOTES.md` | same |
| [`context/CHANGELOG.md`](./context/CHANGELOG.md) | `../../CHANGELOG.md` | same |

Humans never read or edit these; `authority: derived`.

## Historical — non-authoritative *(if applicable)*

| Document | What it was |
| --- | --- |
| `archive/…` | superseded documents, retained with a header saying what replaced them |

## What is not in `docs/ai/` on purpose

<!-- List modules deliberately pruned, one line each, pointing at SYSTEM.md → modules.pruned. -->
