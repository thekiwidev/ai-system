---
name: git-workflow
description: The owner controls Git. Inspect freely; never branch, stage, commit, amend, rebase, merge, reset, tag, release or push without explicit per-interaction authorisation. Conventional commit and PR conventions for when the owner does authorise.
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

Then ask whether the owner wants the Git operation performed. Do not perform it.

## When the owner authorises a commit

Conventional commits:

```text
<type>: <description>

<optional body — what and why, not how>
```

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
