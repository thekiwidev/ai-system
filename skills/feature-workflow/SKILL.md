---
name: feature-workflow
description: End-to-end workflow for a NEW product capability or feature — classify, product definition (create-prd) and owner PRD approval, implementation plan and owner plan approval, implement with tests, verify gates, documentation impact review, report ready for owner commit. Use whenever a request introduces new product behaviour.
invocable: true
---

# Feature workflow

The feature gate from the project system (`docs/ai/WORKFLOW.md` § feature). Use this when a request introduces new product behaviour — a new flow, screen, endpoint group, integration, or domain capability. For a small extension of an existing capability, use the enhancement path in the project's `WORKFLOW.md` instead; for a defect, use `bugfix-workflow`.

Two gates are owner-controlled and cannot be skipped: **PRD approval** and **plan approval**.

## 0. Orient

Load the project operating system first (its `AGENT-CORE.md` startup protocol): `MEMORY.md`, `HANDOFF.md`, `WORKFLOW.md`, `CONSTITUTION.md`, `INDEX.md`. Locate the authoritative PRD/spec and the active plan. Check the request against them: is it already planned, already specified, or contradicting either? Say so before anything else.

## 1. Classify

State the classification explicitly: **new feature**. If the repository's product process says a PRD may be skipped for genuinely tiny features, document why the gate does not apply — otherwise continue.

## 2. Product definition → owner PRD approval

Run the **`create-prd`** skill. Reuse everything the repository and the owner already established; ask only the 3–10 questions the repository cannot answer; never resolve a product decision yourself. Write the PRD to the project's PRD location, index it, then **stop**:

> PRD written at `<path>`. Please review and approve it (or tell me what to change) before I plan the implementation.

## 3. Implementation plan → owner plan approval

From the approved PRD and its acceptance criteria, create the plan in `docs/ai/plans/active/` using the project's plan template: objective · scope · non-goals · dependencies · ordered tasks (with the PRD's task IDs) · acceptance criteria · verification · documentation impact · owner decisions required · files expected to change · existing code to reuse. Then **stop** for approval. If the project's `SYSTEM.md` records that the active plan is the standing approval (a customization), say so and proceed under it.

## 4. Implement

Smallest correct change; reuse before creation; tests ship with the logic (the `tdd-workflow` skill). Stay inside the approved scope — anything discovered that changes scope goes back to the plan and, if product-level, to the owner.

## 5. Verify

Run every gate in `docs/ai/VERIFICATION.md` with the project's real commands. Report actual results. A failing gate means the task is still in progress; never weaken a gate to pass.

## 6. Documentation impact review

Against the actual diff, reconcile every affected layer per `WORKFLOW.md`'s decision matrix — PRD/spec, plan (mark tasks done only when their acceptance criteria were verified), `MEMORY.md`, `HANDOFF.md`, `NOTES.md`, ADRs (only for durable decisions), architecture/domain docs, `CHANGELOG.md`. For each layer state UPDATED / VERIFIED-NO-CHANGE / NOT APPLICABLE / BLOCKED.

## 7. Report

Classification · what changed · verification run and results · documentation synchronized (per layer) · remaining work · owner decisions · Git status: *no Git operation performed; ready for your review and commit.* Then ask whether the owner wants a commit made.

## Failure states

`BLOCKED — missing owner decision` · `BLOCKED — missing requirement` · `BLOCKED — verification failure` · `BLOCKED — documentation conflict`. A blocked task is recorded in `HANDOFF.md` with the exact next decision required; it is never reported as complete.
