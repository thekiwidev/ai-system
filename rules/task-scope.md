---
name: task-scope
description: RULE-SCOPE-002 — do what the owner asked and nothing more; the workflow obligations of that change stay in scope, everything else (other sites, audits, refactors, team documents, published pages) waits for the owner's approval.
applyTo: "**"
---

# Task scope (RULE-SCOPE-002)

## The rule

The owner's instruction defines the deliverable. Do that, plus the workflow obligations of that change. For anything beyond it, stop and ask first.

## Why

An agent that "helpfully" widens a task spends the owner's review time on changes they did not ask for, mixes unrelated edits into one diff, and can publish things the owner has not seen. RULE-SCOPE-001 fixes *where* an agent may write; this rule fixes *what* it may do there.

## How to apply

In scope without asking — the workflow of the asked change:

- root cause and evidence for the named defect;
- the fix to the site the owner named;
- the regression test for that fix, and the project's verification gates;
- `CHANGELOG.md`, `MEMORY.md`, `HANDOFF.md`, `NOTES.md`, derived context docs — as the project workflow requires for that change.

Stop and ask before any of these, even when the fix looks identical or cheap:

- the same bug or pattern at other sites;
- audits, sweeps or scans beyond the named problem;
- refactors, renames, dependency changes;
- team or shared documents: release notes, QA checklists, guides, roadmaps;
- anything published, shared or outward-facing (artifact pages, links, tickets, messages);
- files that already carry unrelated uncommitted edits.

Report what you found and did not touch:

- list each finding with `file:line` under **Found, not touched** in the final report;
- when it is worth keeping past this session, add a `NOTES.md` entry (status `open`);
- the owner decides; a "yes" covers only the scope it names.

Exceptions: an exposed secret or active security hole is reported at once (it is not fixed beyond scope without approval either). An approved plan that already names the wider work counts as the owner's instruction.
