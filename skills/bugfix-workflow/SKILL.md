---
name: bugfix-workflow
description: Workflow for a bug, defect or regression — establish expected behaviour from the authoritative source, reproduce, find the root cause before changing code, write the failing regression test, apply the smallest correct fix, verify adjacent behaviour, and record symptom/cause/fix in the changelog. Use whenever existing intended behaviour is broken.
invocable: true
---

# Bug-fix workflow

The bug-fix gate from the project system (`docs/ai/WORKFLOW.md` § bug fix). Use when existing intended behaviour is broken, incorrect, inconsistent, unsafe, or has regressed.

## 0. Orient

Load the project operating system (`AGENT-CORE.md` startup protocol). Read `NOTES.md` **before** treating anything as new — the "bug" may be a recorded deliberate non-fix or a known deferral.

## 1. Establish expected behaviour

From the authoritative requirements, accepted behaviour, existing tests, or owner clarification — in that order. If none defines it, that is a product question for the owner, not a guess.

## 2. Reproduce

Reproduce the defect when practical (failing test, script, request, or manual steps against the owner-run dev server — never start a long-running server yourself unless the project allows it). Record the reproduction.

## 3. Root cause

Determine the actual cause before changing code. State it in one sentence, with evidence (file, line, data). "Why did the existing checks allow it?" is part of the root cause.

## 4. Plan (concise)

Problem · evidence · root cause · smallest correct fix (to the site the owner named) · regression test (fails before, passes after) · files expected to change · verification · documentation impact. For non-trivial fixes, wait for owner plan approval unless the project's active plan already authorises the work.

**Scope (RULE-SCOPE-002).** The owner's instruction defines what gets fixed. If the same root cause shows up at other sites, list them (file:line) and **stop and ask** before touching them — even when the fix is identical. Same for audits beyond the named defect, refactors, release notes, QA checklists and published pages. The workflow obligations below (regression test, gates, changelog, memory, handoff, notes) stay in scope.

## 5. Fix

Write the regression test first; confirm it fails; apply the smallest correct fix; confirm it passes. No opportunistic refactoring inside a bug fix. If a file you must touch already carries unrelated uncommitted edits, say so before editing it.

## 6. Verify

Run the project's verification gates (`docs/ai/VERIFICATION.md`) and the tests adjacent to the changed behaviour. Report actual results. Adjacent behaviour is verified, never edited without approval.

## 7. Record

- `CHANGELOG.md` (entry shape: `rules/docs-format.md`, the fix under `### vX.Y.Z — Fixed`): bug as experienced · who/what was affected · root cause · why existing checks allowed it · the actual fix · regression coverage · verification result. Never "fixed import issue" when the cause is known.
- `NOTES.md` (`rules/docs-format.md`): the other sites found and not touched, any remaining edge case, deliberate non-fix, or investigation context worth keeping.
- `MEMORY.md`: only if current-state knowledge changed or a durable gotcha was found.
- ADR: only if the fix changes, introduces, or reinforces a durable architectural/engineering decision.
- `HANDOFF.md`: cleared if complete; the blocker and next action if not.

## 8. Report

Classification: bug fix · symptom → cause → fix · found, not touched (other sites awaiting the owner) · verification · documentation synchronized (per layer) · remaining work · *no Git operation performed; ready for your review and commit.* With caveman on, use the labelled one-liners in `rules/caveman.md` § Reports.
