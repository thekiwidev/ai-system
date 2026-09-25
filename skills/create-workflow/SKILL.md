---
name: create-workflow
description: Create or update a repeatable workflow (release, production build, OTA update, deploy, migration, publish to Expo Go, any "every time I do X I must do these steps") in the standard shape — interviews the owner for triggers, parameters, variants, pre-flight checks, chronological steps with exact commands, and per-step failure handling, then writes it to the one home for its scope and registers it. Use for "set up / create / add a workflow", "make this a workflow", "update / change the X workflow".
invocable: true
---

# create-workflow

Produces a workflow an agent can run exactly as written, with no judgement calls left open. Invoking a workflow is the owner's approval for every step in it (RULE-KIND-002), so the workflow itself carries the safety: pre-flight checks that stop the run, exact commands, expected results, and what to do on every failure. A vague workflow is a dangerous one — the interview exists to remove every "it depends".

## When to use

- The owner asks to set up, create or add a workflow, or says "every time I … I have to …".
- The owner asks to update, extend or fix an existing workflow ("add iOS to the build workflow", "the OTA workflow forgot expo-doctor").
- An existing procedure lives in the wrong place or shape (a `docs/*_WORKFLOW.md` guide, a free-form skill) and the owner approved migrating it.

## Procedure

### 1. Decide create or update, and the scope

1. Resolve the name: project `.agents/skills/<name>/SKILL.md`, then global `~/.thekiwidev/skills/<name>/SKILL.md`. Also search for the same topic under other names (`grep -ril` the key terms in `.agents/skills`, `docs/`, `docs/ai/workflows/`) — a second workflow for the same job is the failure this skill prevents.
2. Scope follows the folder you are opened in (`rules/kinds.md`, RULE-SCOPE-001): in a project, the project home; in `~/.thekiwidev`, the global home. A global workflow updated from a project becomes a project copy.
3. Update: read the whole workflow and its change history first; interview only for what changes (step 3), then continue at step 5.

### 2. Gather what the repository already answers

Before asking anything, read: `docs/ai/MEMORY.md`, `docs/ai/ENGINEERING.md`, `docs/ai/VERIFICATION.md`, relevant ADRs, config files the workflow touches (for example `app.json`, `eas.json`, `package.json`, `.env.example`, CI files), and any existing guide on the topic. Note every command, file, channel, profile and environment that already exists. Never ask the owner what a file can tell you; never invent a value a file does not contain.

### 3. Interview the owner

Ask in one message, grouped, lettered options where a choice exists, pre-filled with what step 2 found ("I found profiles `development`, `preview`, `production` in `eas.json` — are these the environments?"). Ask only what is still unknown. Cover:

1. **Outcome** — what is true when the run is done?
2. **Triggers** — the exact phrases you will use; situations that should run it; things it must not be used for.
3. **Parameters** — every choice that changes the run (platform, environment, channel, target), allowed values, defaults, and which are required.
4. **Variants** — for each parameter combination, which steps run and which are skipped.
5. **Values and their source of truth** — for every value the run sets (version, build number, API base URL, channel), where the correct value comes from and the exact rule (for example "build number = last *successful* build + 1; failed and cancelled builds do not count; read it with …").
6. **Pre-flight checks** — what must be true before anything changes (clean tool checks such as `expo-doctor`, correct environment URLs, logged-in CLI, no uncommitted unrelated changes), and how to check each.
7. **Steps in order** — the exact command or edit for each, what success looks like, and what it records for later steps.
8. **Failure handling, per step** — retry, fix and continue, or stop; what to report; what to revert. Ask explicitly about the steps that publish or cannot be undone: what happens if they fail halfway?
9. **Git** — does the run commit, tag or push? Git steps are included only when the owner states them here, word for word (the owner controls Git); otherwise the run ends with the changed files listed for the owner to commit.
10. **Secrets** — which credentials the run needs and where they already live (environment, CLI login). Secrets are never written into the workflow.
11. **Verification and report** — how to prove success, and what the owner wants to see at the end.

If an answer leaves a step ambiguous, ask again. Do not fill a gap with a guess.

### 4. Confirm the outline

Show the resolved outline back — triggers, parameter table, variant matrix, numbered step titles with their failure rule — and wait for the owner's yes. This is the only approval the workflow needs before it is written.

### 5. Write it

1. Start from `~/.thekiwidev/skills/_template-workflow/SKILL.md` (a project may vendor it). Keep every section: Purpose, Triggers, Parameters, Variants, Pre-flight checks, Steps, On failure (general), Verification, Report, Change history. Frontmatter: `name` (= directory, kebab-case), `description` (with the trigger words), `invocable: true`, `kind: workflow`, `version`, `last_reviewed`.
2. Home: project `.agents/skills/<name>/SKILL.md` plus a `.claude/skills/<name>` symlink to it (`kiwi new workflow <name>` makes both); global `skills/<name>/SKILL.md`.
3. Every step has **Do / Expect / On failure**, and **Records** where it produces a value. Commands are copy-pasteable, with placeholders named after parameters (`<platform>`). Every step appears in the variant matrix.
4. Update: change only what the owner asked, bump `version`, set `last_reviewed`, add a line to Change history.

### 6. Dry-walk it (read-only)

Walk every variant against the repository without running anything that changes state: every file the steps edit exists, every script and CLI named is installed or declared, every profile/channel/env named exists in config, every "Records" value is consumed by a later step. Report gaps and fix them with the owner before finishing.

### 7. Register and record

- Project: add or update the row in `docs/ai/workflows/INDEX.md` (`Workflow · Scope · Triggers · Parameters`); `kiwi doctor` must report it clean. Record the change in `CHANGELOG.md` per the project workflow.
- Global: `kiwi install`, then `kiwi doctor`.
- Superseded guides (for example `docs/EXPO_WORKFLOW.md`): list them; remove or reduce them to a pointer only with the owner's yes.

## Quality bar

A workflow is ready when a fresh agent, given only the owner's one-line request and this file, would run the same commands in the same order and stop at the same failures as the owner would. Example of the level of detail expected in one step:

```markdown
### 3. Set the build number

- **Do:** read the last successful build: `eas build:list --platform <platform> --status finished --limit 1 --json --non-interactive`; take its `appBuildVersion` (Android `versionCode` / iOS `buildNumber`) and set `app.json` → `expo.android.versionCode` or `expo.ios.buildNumber` to that value + 1.
- **Expect:** `app.json` shows the new number; nothing else in the file changed.
- **On failure:** no finished build found → stop and ask for the starting number; CLI not logged in → stop, report "run `eas login`".
- **Records:** `buildNumber` (old → new) for the report.
```

## Output

The workflow file, its index row, the dry-walk result, and a report: created or updated · path · version · variants covered · gaps found and how they were resolved · superseded files awaiting the owner's decision.
