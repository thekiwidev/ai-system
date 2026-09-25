---
doc: WORKFLOW
purpose: "The task state machine: intake, classification, gates, planning, implementation, verification, documentation reconciliation, reporting, session end"
authority: canonical
hosts_rules: [RULE-WF-001, RULE-WF-002, RULE-DOC-001]
mirrors_rules: [RULE-CORE-001, RULE-CORE-002, RULE-VERIF-001, RULE-GIT-001, RULE-KIND-002]
last_reviewed: "{{DATE}}"
---

# WORKFLOW — {{PROJECT}}

## 0. The lifecycle at a glance (RULE-WF-001, RULE-WF-002)

```text
INTAKE → ORIENT → CLASSIFY → REQUIREMENTS DISCOVERY
   ↓
┌─────────────────────────────────────────────────────────────┐
│ Feature → create-prd skill → OWNER PRD APPROVAL → plan      │
│ Other non-trivial work → implementation plan                │
│ Trivial → micro-plan (problem → change → verify → doc impact)│
└─────────────────────────────────────────────────────────────┘
   ↓
OWNER PLAN APPROVAL {{STANDING_APPROVAL_NOTE}}
   ↓
IMPLEMENT → VERIFY → DOCUMENTATION IMPACT REVIEW → RECONCILE DOCS → FINAL REVIEW → REPORT → READY FOR OWNER COMMIT
```

Failure states — a blocked task is never a completed task; record the blocker and the exact next decision in `HANDOFF.md`:

```text
BLOCKED — missing owner decision · missing requirement · verification failure · documentation conflict · unauthorised Git operation requested
```

## 1. ORIENT

`AGENT-CORE.md` § 2, exactly. Then read `NOTES.md` before treating anything as new.

## 2. CLASSIFY (RULE-WF-001)

**First, match a workflow (RULE-KIND-002).** If the request fits the triggers of a workflow in [`workflows/INDEX.md`](./workflows/INDEX.md) (or a global workflow), run it as written and report under its own Report section; the classification is `workflow: <name> v<version>`. Otherwise classify:

Feature · enhancement · bug fix · refactor · maintenance · documentation-only · investigation. State it in the plan and the report.

## 3. REQUIREMENTS DISCOVERY (RULE-CORE-002)

Locate the task in {{PRD_PATH}} and the active plan. Contradiction → say so before implementing. Unspecified product behaviour → open question, ask.

## 4. Gates

- **Feature:** run the global `feature-workflow` skill (`create-prd` → owner PRD approval → plan → owner plan approval). PRDs go to `{{PRD_DIR}}`.
- **Bug fix:** run the global `bugfix-workflow` skill (expected behaviour → reproduce → root cause → regression test → smallest fix).
- **Enhancement / refactor / maintenance:** plan proportional to risk; owner plan approval for non-trivial work.
- **Trivial:** micro-plan — `Problem → Change → Verification → Documentation impact`. Never a bypass for verification or documentation.

## 5. PLAN

Problem · evidence · classification · scope · non-goals · proposed solution (smallest correct) · existing reuse · files expected to change · tests and verification · documentation impact (which layers will change) · owner decisions. Plans live in `plans/active/`; a plan is not a licence for speculative architecture.

## 6. IMPLEMENT

Within the approved scope. Reuse first. Tests with the logic. Conventions from `ENGINEERING.md`.

**Task scope (RULE-SCOPE-002).** Change only what the instruction names, plus its workflow obligations. The same bug at other sites, audits, refactors, team documents, published or shared pages, and files with unrelated uncommitted edits: stop, list them, ask.

## 7. VERIFY (RULE-VERIF-001)

Every gate in `VERIFICATION.md`, with the real commands, actual output reported. A failing gate = in progress.

## 8. RECORD — documentation impact review and reconciliation (RULE-DOC-001)

### 8.1 Inspect reality

Files changed · tests · schema/migrations · contracts · UI flows · architecture · config/env · defects resolved · dependencies · plan status · owner decisions made.

### 8.2 Reconcile every affected layer

For each layer state **UPDATED / VERIFIED-NO-CHANGE / NOT APPLICABLE / BLOCKED**:

| Change observed | Documentation action |
| --- | --- |
| New product capability | PRD + plan + MEMORY + CHANGELOG + domain docs; ADR only if a durable decision exists |
| Bug fixed | CHANGELOG `### vX.Y.Z — Fixed` (symptom / cause / why checks allowed it / fix / regression) + `### vX.Y.Z — Verification`; MEMORY if current state changed; NOTES for a gotcha or deliberate non-fix |
| Architecture or technology changed | ADR + ARCHITECTURE + MEMORY + ENGINEERING if practice changes + CHANGELOG |
| Convention changed | ENGINEERING + CHANGELOG |
| Schema / API contract changed | plan + ARCHITECTURE/domain + MEMORY + CHANGELOG (+ ADR if durable) |
| Planned work added/removed/reordered | plan + MEMORY → Current Position |
| Concern found, not fixed | NOTES + HANDOFF; do not claim completion |
| Out-of-scope finding (RULE-SCOPE-002) | report "Found, not touched"; NOTES entry (`open`) when it outlives the session |
| Durable decision | ADR + current-state docs + CHANGELOG |

CHANGELOG and NOTES entries use the versioned shape of RULE-DOC-012 / RULE-DOC-013 (`~/.thekiwidev/rules/docs-format.md`).

### 8.3 Memory, handoff, plan

`MEMORY.md` is rewritten where reality changed — never old and new side by side. `HANDOFF.md` carries unfinished work or is cleared. Plan tasks are marked done only when their acceptance criteria were verified.

### 8.4 Derived context docs (RULE-DOC-011)

If this task changed any source listed in `SYSTEM.md` → `context_docs` (`MEMORY.md`, `docs/ai/NOTES.md`, `CHANGELOG.md`, …), regenerate its derived copy in `docs/ai/context/` with the `context-docs` skill and run `kiwi ctx stamp`. `kiwi ctx status` must report every copy current before the task is reported complete.

### 8.5 The self-healing question

*"If a completely new agent opened this repository tomorrow, what would it need to know that the documentation does not yet say?"* Fix stale paths, statements, decisions, gotchas, plan status.

## 9. REPORT and hand back (RULE-GIT-001)

```text
Classification · What changed · Found, not touched (RULE-SCOPE-002) · Verification (commands + results) · Documentation synchronized (per layer, derived context copies listed as their own layer)
Remaining work · Owner decisions · Git: no unauthorised operation performed — ready for your review and commit.
```

With caveman on (`.caveman.json`), the report is the labelled one-liners of `rules/caveman.md` § Reports — same facts, no paragraphs.

Then ask whether the owner wants the Git operation performed.

## 10. Ending a session

`HANDOFF.md` is accurate or cleared; `MEMORY.md` describes reality; nothing is left half-written.
