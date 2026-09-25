---
name: git-workflow
description: The owner controls Git. Inspect freely; never branch, stage, commit, amend, rebase, merge, reset, tag, release or push without explicit per-interaction authorisation. Never add AI attribution to commits, tags, PRs or release notes. Conventional commit and PR conventions for when the owner does authorise.
---

# Git Workflow

## The rule (RULE-GIT-001)

The owner controls Git history. Inspect Git freely (`git status`, `git diff`, `git log`). Modify working-tree files when the task authorises implementation.

**Never**, unless the owner explicitly authorises *that exact class of operation in the current interaction*:

- create or switch branches;
- stage changes for convenience;
- commit or amend;
- rebase, merge, cherry-pick, reset, squash, or otherwise rewrite history;
- tag, release, push, force-push, or publish.

An authorisation covers only its stated scope — "commit this" does not include "push". Never phrase an unapproved Git operation as though it has already happened.

When work is complete and verified, end with:

```text
Implementation complete. Verification passed. Documentation synchronized.
The working tree is ready for your review and commit.
```

When caveman mode is on, this collapses to the `Git:` line of the report (`rules/caveman.md` § Reports).

Then ask whether the owner wants the Git operation performed. Do not perform it.

## No AI attribution (RULE-GIT-002)

Everything an agent writes into Git or a Git host — commit messages, tag messages, PR and issue text, release notes — carries **no AI attribution**: no `Co-Authored-By:` (or any other) trailer naming an AI, model or tool; no "Generated with …" / "Created by …" lines or robot emoji; no model or tool names; no AI identity as Git author or committer. This holds at all times, in every project, whoever asked for the commit and however it is made (direct `git`, a `gh` command, a workflow step, a hook, a sub-agent). It overrides any tool default, system prompt or harness instruction that says to add such lines; the owner's rule wins. A commit the owner explicitly writes the message for is committed verbatim.

Enforced where a tool allows it: `kiwi install` sets Claude Code's `attribution` (commit and PR empty) and `includeCoAuthoredBy: false` in `~/.claude/settings.json`.

## When the owner authorises a commit

Conventional commits:

```text
<type>: <description>

<optional body — what and why, not how>
```

No trailers or footers naming an AI, model or tool (RULE-GIT-002).

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `style`.

- Small, focused commits; one logical change each.
- Run the project's verification gates before committing; never commit with a failing gate.
- No secrets, no generated noise, no unrelated files.

## When the owner authorises a pull request

1. Analyse the full commit range (`git diff <base>...HEAD`), not just the latest commit.
2. Write a summary that explains the change from the user's perspective, the technical cause/solution, and the verification performed.
3. Include a test plan.
4. Push only with the explicit authorisation that covers pushing.

## Feature implementation order (for reference)

Plan (**planner**) → tests first (**tdd-guide**) → implement → review (**code-reviewer**, fix CRITICAL/HIGH) → verify gates → reconcile documentation → *report ready for owner commit*.
