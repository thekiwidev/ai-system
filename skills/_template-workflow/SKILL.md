---
name: {{name}}
description: One sentence — what this workflow does and the requests that should run it. Agents match on this text, so include the trigger words (for example "production build", "OTA update", "push to Expo Go").
invocable: true
kind: workflow
version: 1
last_reviewed: "{{DATE}}"
---

# {{name}}

<!-- A workflow is run exactly as written, step by step, every time. Invoking it is the owner's approval for every step, so every step must say precisely what to do, what success looks like, and what to do when it fails. Written by the create-workflow skill; keep every section below. -->

## Purpose

One paragraph: the outcome this workflow produces and why it exists.

## Triggers

Run this workflow when the request says or implies:

- "…" — exact phrases the owner uses.
- Situations (for example: a native dependency changed and a release is requested).

Do **not** use it for: …

## Parameters

| Parameter | Allowed values | Default | How to infer from the request | If missing |
| --- | --- | --- | --- | --- |
| `example` | `a` \| `b` | `a` | "…" means `b` | ask / use default |

Echo the resolved parameters in one line before step 1.

## Variants

Which steps run for which parameter combination. Every step appears in at least one row.

| Variant (parameters) | Steps |
| --- | --- |
| `example=a` | 1, 2, 3, 5 |
| `example=b` | 1, 2, 4, 5 |

## Pre-flight checks

Run all of them before any step that changes something. Any failure stops the run: report which check failed, the evidence, and the fix; change nothing.

1. **Check** — how to check (command or file) · **passes when** … · **on fail:** stop, report, suggested fix.

## Steps

Chronological. One action per step.

### 1. Step title

- **Do:** exact action or command.
- **Expect:** what success looks like (output, file state).
- **On failure:** retry once / fix and continue / stop and report — and exactly what to report.
- **Records:** values produced that later steps use (for example the new build number).

## On failure (general)

- Never skip a failed step and continue.
- Never weaken a check to make it pass.
- Leave the working tree in a known state: say which files this run changed and whether they should be reverted.
- A situation this workflow does not cover: stop, report, and offer to update the workflow.

## Verification

How to prove the run succeeded (URLs, IDs, versions, command output).

## Report

The labelled lines to return at the end: parameters used · values changed (old and new) · commands run and results · links or IDs · anything the owner must do next.

## Change history

- v1 — {{DATE}} — created.
