# Changelog — thekiwidev AI system

## v3.5.0 — 2026-09-26 — "One shape per kind: standard, runnable workflows; no AI attribution"

Owner feedback: two agents asked to create the same Expo release workflow produced two different documents in two different places (`.agents/skills/expo-workflow/SKILL.md` and `docs/EXPO_WORKFLOW.md` in one project), and neither encoded the steps the owner actually repeats — version matching, build number = last successful build + 1, production API check, `expo-doctor`. The system had two homes for project workflows (`kiwi new workflow` wrote `.agents/skills/`, the initializer and `workflows/INDEX.md` template said `docs/ai/workflows/<NAME>.md`) and no required structure. This release gives every repeatable kind one home, one template and one index, makes workflows a fixed, runnable shape that agents pick up from their triggers, and adds the skills that create and update them. It also makes "no AI attribution in Git metadata" a standing global rule: harness defaults (Claude Code's `Co-Authored-By` trailer and "Generated with" PR footer) were adding it to commits.

### v3.5.0 — Added

- **RULE-KIND-001 / RULE-KIND-002** (`rules/kinds.md`). Workflow, skill, rule, agent, plan, decision and PRD each have one home per scope, one template, one index and one create/update path. Before classifying a task, an agent matches it against workflow triggers (project first, then global) and runs a match as written; invoking a workflow approves every step in it, including Git or publishing steps the owner wrote into it. A situation the workflow does not cover stops the run.
- **Workflow template** `skills/_template-workflow/SKILL.md`: frontmatter `kind: workflow`, `version`, `last_reviewed`; fixed sections Purpose · Triggers · Parameters · Variants · Pre-flight checks · Steps (each Do / Expect / On failure / Records) · On failure (general) · Verification · Report · Change history.
- **`create-workflow` skill** — creates or updates a workflow: reads the repository first, interviews the owner only for what files cannot answer (triggers, parameters, variants, value sources, pre-flight checks, ordered steps, per-step failure handling, Git, secrets, verification), confirms the outline, writes it, dry-walks every variant read-only, registers it.
- **`kiwi-author` skill** — the create/update procedure for every other kind; routes workflows to `create-workflow`, PRDs to `create-prd`, project rules to AMEND.
- **`kiwi new plan|decision <name>`** (project only): plan into `docs/ai/plans/active/`, decision as the next `ADR-NNN-<name>.md`, each registered in its index. `kiwi new prd` refuses and points to `create-prd`.
- **RULE-GIT-002 — no AI attribution** (`rules/git-workflow.md`, `GLOBAL.md § 2.4`). Commit and tag messages, PR and issue text and release notes never carry an AI/model/tool `Co-Authored-By` or other trailer, a "Generated with" line, robot emoji, a model or tool name, or an AI author/committer identity — however the commit is made. Overrides tool and harness defaults.
- **Upgrade delta V3-14**: register `RULE-GIT-002` in `RULES.md`, add the "No AI attribution" paragraph to `AGENT-CORE.md § 5`, list project instructions that add AI trailers for removal on the owner's yes.
- **Upgrade delta V3-13** (INITIALIZER §24.14, `runbooks/UPGRADE.md`): register the rules, update `AGENT-CORE.md § 8`, `WORKFLOW.md § 2`, `workflows/INDEX.md`, `INDEX.md`; then one owner-approved row per existing workflow outside its home, redrafted by `create-workflow`, duplicates merged.

### v3.5.0 — Changed

- **`kiwi new workflow|skill` in a project** now also links `.claude/skills/<name>` to `.agents/skills/<name>` so Claude Code finds it; a workflow uses the workflow template and gets its row in `docs/ai/workflows/INDEX.md`.
- **`kiwi install`** writes `includeCoAuthoredBy: false` and `attribution: { commit: "", pr: "" }` into `~/.claude/settings.json` on every install (other `attribution` keys and settings are kept).
- **`kiwi doctor`** flags a project `AGENT-CORE.md` without the RULE-GIT-002 paragraph. Global workflows are checked for the required frontmatter and sections; in a project, every workflow is checked for shape, index registration and its `.claude/skills` link, and any file in `docs/ai/workflows/` other than `INDEX.md` is flagged.
- **Project templates**: `workflows/INDEX.md` is a registry only (`Workflow · Scope · Triggers · Parameters`, lifecycle skills, project skills); `AGENT-CORE.md § 8` gains "Workflows run as written" and "One shape per kind"; `WORKFLOW.md § 2` matches a workflow before classifying; `RULES.md` registers RULE-KIND-001/002 (`KIND` namespace); the `INDEX.md` workflows row says when to read it.
- **INITIALIZER** 3.5.0: §6 tree and §17 no longer place workflow files in `docs/ai/workflows/`; §11.1 and the tier-2 list point at `.agents/skills/`. `INIT`, `ADOPT`, `AMEND` and `AUDIT` runbooks route workflows through `create-workflow`.
- **`GLOBAL.md`**: lifecycle starts with "workflow first"; § 6 lists workflows; § 7 states one shape per kind. `docs/HANDBOOK.md` § 2.2 updated and § 2.13 added. Repository `AGENTS.md` "Add a rule / skill / workflow / agent" row points at the kinds rule.

### v3.5.0 — How it works

A workflow is a skill with `kind: workflow`, so every agent discovers it natively by its description and `/name`, while `docs/ai/workflows/INDEX.md` gives agents without skill discovery the same triggers to match. Safety moves from per-step confirmation into the workflow itself: pre-flight checks stop the run before anything changes, and every step says what success looks like and what to do when it fails. `lib/kinds.js` holds the shared checks (`workflowProblems`, `projectWorkflows`, `strayWorkflowDocs`) and the index-row insertion used by `kiwi new`.

### v3.5.0 — Files changed

`rules/{kinds,git-workflow}.md`, `skills/{_template-workflow,create-workflow,kiwi-author}/SKILL.md`, `lib/kinds.js`, `lib/registry.js`, `lib/commands/{new,doctor}.js`, `lib/adapters/claude.js`, `skills/kiwi-system/INITIALIZER.md`, `skills/kiwi-system/runbooks/{UPGRADE,ADOPT,INIT,AMEND,AUDIT}.md`, `skills/kiwi-system/templates/docs-ai/{AGENT-CORE,WORKFLOW,RULES,INDEX}.md`, `skills/kiwi-system/templates/docs-ai/workflows/INDEX.md`, `GLOBAL.md`, `AGENTS.md`, `docs/HANDBOOK.md`, `package.json`, `tests/lib/kiwi.test.js`, `CHANGELOG.md`.

### v3.5.0 — Verification

- `node tests/lib/kiwi.test.js`: 58 passed, 0 failed, including five new kinds tests (template conformity, project workflow scaffold with link and index row, plan/decision scaffolds and refusals, doctor findings, rule and delta registration) and one RULE-GIT-002 test (settings merge keeps other keys and forces attribution off; rule, template and delta registration).
- `node tests/run-all.js`: 119 of 120 passed. The failure (`hooks.test.js` › session-end › "creates or updates session file") fails identically on the committed HEAD and is unrelated to this change.
- `kiwi install` and `kiwi doctor`: see the release report.
- Not run: an end-to-end run of `create-workflow` with an agent in a real project, and the V3-13 upgrade on an existing project — both need the owner in a project session.

## v3.4.0 — 2026-09-23 — "Do what was asked, caveman that sticks, versioned changelog and notes"

Owner feedback from a project session: an agent asked to fix one blocking style also fixed eleven other sites, audited every React Native import, edited release notes and a QA checklist, and republished a shared page — none of it requested. The same session ignored the project's `.caveman.json` (`ultra`) and reported in long prose. This release makes task scope a rule, makes the project caveman level reach the agent at runtime, and fixes the shape of changelog and notes entries so each version or note has unique, verifiable sub-sections.

### v3.4.0 — Added

- **RULE-SCOPE-002 — do what was asked** (`rules/task-scope.md`, `GLOBAL.md § 2.9`). The instruction defines the deliverable; its workflow obligations (root cause, regression test, gates, changelog, memory, handoff, notes, context docs) stay in scope. The same bug at other sites, audits, refactors, team documents, published or shared pages, and files with unrelated uncommitted edits are *stop and ask*, reported under "Found, not touched".
- **RULE-DOC-012 / RULE-DOC-013** (`rules/docs-format.md`). Changelog entries are `## vX.Y.Z — date — "title"` with `### vX.Y.Z — <section>` sub-sections (Added, Changed, Fixed, Removed, Security, How it works, Notes, Files changed, Verification — the last mandatory). Notes are `## N-### — title` with `### N-### — Context / Decision / Resolution`. New entries only.
- **`scripts/hooks/caveman-mode.js`** — Claude Code SessionStart hook states the effective caveman level for the working directory; UserPromptSubmit repeats it in one line per prompt. Silent when the level is `off`; never blocks.
- **`rules/caveman.md` § Reports** — at full/ultra the end-of-task report is labelled one-liners (`Done`, `Found, not touched`, `Verified`, `Not verified`, `Docs`, `Next`, `Git`); no narration before or between tool calls.
- `kiwi doctor` flags an `AGENT-CORE.md` whose frozen caveman level disagrees with the effective one.

### v3.4.0 — Changed

- The global caveman statement in every agent's managed block now leads with "read `.caveman.json` first; it wins over the global default" instead of "**full** by default".
- `AGENT-CORE.md` template: startup step 0 reads `.caveman.json`; § 11 no longer freezes a level (`{{CAVEMAN_SETTING}}` removed); § 4 carries the task-scope paragraph; § 7 points at the doc formats.
- `WORKFLOW.md`, `RULES.md`, `NOTES.md`, `INDEX.md` templates: task-scope line, "Found, not touched" in the report, out-of-scope row in the decision matrix, three new registered rules, the coded notes shape, format pointers.
- `bugfix-workflow`: fix the site the owner named; list other occurrences and ask; adjacent behaviour is verified, never edited without approval. `feature-workflow`: same guard; both reports gain "Found, not touched" and the caveman report form.
- `rules/security.md`: similar issues are reported, fixed beyond scope only with approval. `rules/git-workflow.md`: the closing text collapses to the report's `Git:` line under caveman.
- INITIALIZER §9.18 defines the changelog format instead of "use the existing style"; version 3.4.0.

### v3.4.0 — How it works

Claude Code adds a SessionStart or UserPromptSubmit hook's stdout to the model's context. `caveman-mode.js` resolves the level with the same `lib/caveman.js` `effective()` the CLI uses (env, then `.caveman.json` walking up, then the global config, then `full`) and prints `statement()` for it, so the project level arrives in context as an instruction rather than depending on the agent finding one line near the end of `AGENT-CORE.md`. `lib/adapters/claude.js` installs the scope guard and both caveman entries even when `hooks.install` is false (`ALWAYS` filter), because they enforce rules rather than add conveniences. Agents without hooks (Codex, Gemini, Copilot) get the same effect from the reworded managed block and the step-0 instruction in `AGENT-CORE.md`.

Every changelog and notes sub-heading carries its version or ID, so markdownlint MD024 (no duplicate headings) passes however many versions carry a "How it works" section.

### v3.4.0 — Notes

- Projects pick up the change through UPGRADE: `kiwi doctor` reports them behind 3.4.0; saying "upgrade this project's AI system" applies deltas V3-10 (task scope), V3-11 (caveman step 0, frozen level removed) and V3-12 (doc formats), listed in INITIALIZER §24.14. No existing changelog or notes entry is reformatted; a project with its own changelog style is asked once whether new entries adopt RULE-DOC-012.
- No separate CHANGELOG template file: the entry shape lives once, in `rules/docs-format.md`.
- Older entries in this file keep their original shape by design.

### v3.4.0 — Files changed

`rules/{task-scope,docs-format}.md` (new) · `rules/{caveman,security,git-workflow}.md` · `GLOBAL.md` · `scripts/hooks/caveman-mode.js` (new) · `hooks/hooks.json` · `lib/caveman.js` · `lib/adapters/claude.js` · `lib/commands/doctor.js` · `skills/{bugfix-workflow,feature-workflow}/SKILL.md` · `skills/kiwi-system/{INITIALIZER.md,runbooks/UPGRADE.md}` · `skills/kiwi-system/templates/docs-ai/{AGENT-CORE,RULES,WORKFLOW,NOTES,INDEX}.md` · `docs/HANDBOOK.md` · `tests/lib/kiwi.test.js` · `package.json`.

### v3.4.0 — Verification

- `node tests/run-all.js`: 114 passed, 0 failed. New tests cover the caveman hook (project level stated, one-line prompt reminder, silent when `off`, bad input never blocks), the always-installed hook set with `hooks.install: false`, frozen-level detection and the frozen-free template, registration of the three rules, and no duplicate headings in this file. The tests were written alongside the code, not run red first.
- `kiwi install`: new rules linked into every agent, managed blocks and `~/.claude/settings.json` updated. `kiwi doctor`: all clear.
- Hook run against a real project with `.caveman.json` = `ultra`: prints `Caveman: ultra (.caveman.json).` `kiwi doctor` there reports the project behind 3.4.0 and its Antigravity caveman pointer stale (the rule body changed) — both cleared by that project's upgrade.
- **Not verified:** a fresh Claude Code session in a project replying at the project level (needs a new session); Codex, Gemini and Copilot behaviour with the reworded managed block.

## 3.3.0 — 2026-09-21 — publishable

- New: `bin/setup.js` + `setup.sh` / `setup.ps1` — one-line bootstrap for macOS, Linux, WSL and Windows; asks handle, folder name and caveman default; rebrands the checkout; writes fresh personal memory/notes; links the home folder; runs install. `--mine` for the owner's own new machine.
- New: `kiwi rebrand --home .<name> [--owner <handle>]` and `kiwi uninstall`.
- New: Windows support — `bin/kiwi.cmd`, junctions for directory links, clear EPERM guidance, PATH instructions.
- New: `LICENSE` (MIT) with third-party notices; `docs/INSTALL.md`.

## 3.2.0 — 2026-09-21 — caveman + derived context docs + write-scope guard

- New: **RULE-SCOPE-001** — write scope is the folder the agent was opened in; the global folder is read-only from any project. Stated in GLOBAL.md § 2.8, AGENT-CORE § 8, runbooks, INITIALIZER §0.0.7, RULES template; AMEND from a project writes the project override and *proposes* the global change. Enforced: `kiwi new` is scope-aware (project files inside a project; `--global --yes` owner-only), `kiwi caveman --global` / `setup-pm --global` refuse from a project without `--yes`, learned skills go to `<project>/.agents/skills/learned`, and `kiwi install` adds a Claude Code PreToolUse scope guard that blocks Edit/Write resolving into `~/.thekiwidev` (through `~/.claude/rules` etc.) from a project session. Generated headers and vendored markers reworded so they never read as "edit the global source".

- New: **caveman** output style as a first-class component — `skills/caveman`, `caveman-commit`, `caveman-review` mirrored from JuliusBrussee/caveman v2.7.0 (MIT; `scripts/update-caveman.js` re-syncs, `kiwi doctor` flags a newer tag), `rules/caveman.md` always-on digest with boundaries. Always-on in every agent via the managed block; per-project via `.caveman.json` (upstream-compatible). `kiwi caveman <mode> [--global|inherit|status]`. Precedence env → project → global → full. `caveman-compress` deliberately not mirrored; proxy out of scope.
- New: **derived context docs** — `docs/ai/context/<NAME>.md`, caveman-ultra copies of `MEMORY.md` / `NOTES.md` / `CHANGELOG.md` for agents; source sha256 recorded in the copy; `kiwi ctx status|stamp|init`; `context-docs` skill (regenerate + read protocol); `RULE-DOC-011`; `SYSTEM.md → context_docs`; WORKFLOW § 8.4, VERIFICATION checklist, INDEX § Derived, AGENT-CORE § 12. Sources are never compressed.
- New: INIT/ADOPT ask the project's caveman level and context-docs set; UPGRADE offers V3-8/V3-9; INITIALIZER §0.0.5–0.0.6.
- Fixed: frontmatter parser handles folded/literal block scalars (`description: >`).

## 3.1.0 — 2026-09-21 — runbooks, context, stamp, global memory

- Changed: **the agent is the interface.** In any agent, "set up / upgrade / audit this project's AI system" triggers the `kiwi-system` skill, which runs `kiwi agent` (and `kiwi link`) itself; `kiwi init` / `kiwi upgrade` from the terminal are optional and only print that sentence. No launcher flags.
- Fixed: the `kiwi doctor` → `kiwi upgrade` loop. Doctor now says the agent step is pending and what to say; the agent's new last step `kiwi stamp` records `kiwi_version` / `global_system` / `prd_dir` / `vendored` in `SYSTEM.md`, which is what clears doctor.
- New: **`kiwi agent [MODE]`** — the one command an agent runs: prints the complete brief (tools, global memory/notes, verified context, shared steps, the mode's runbook, templates, finish). `kiwi spec <n>` and `kiwi template [name]` give depth on demand. `kiwi init` / `kiwi upgrade` now hand over with "run `kiwi agent MODE`".
- New: `kiwi context` — a verified project brief (mode, git state, toolchain and real scripts, instruction files, `docs/ai` inventory, manifest, vendored skills, global offerings) the agent reads first.
- New: `skills/kiwi-system/runbooks/` — one executable checklist per mode (INIT, ADOPT, UPGRADE, AUDIT, AMEND, EXTEND) with STOP points, the questions to ask, and the `kiwi` commands to run; `SKILL.md` now lists the CLI as tools.
- New: global `MEMORY.md` and `NOTES.md` (cross-project only) beside the project ones; GLOBAL.md § 7 and INITIALIZER §0.0.4 define the two layers and precedence for rules, memory and notes.
- New: the **rules decision** in INIT/ADOPT (adopt / override / not applicable per global rule; project-only rules) recorded in `ENGINEERING.md § 0 Global rules in force` as pointers, with overrides registered in `RULES.md`; AMEND distinguishes global vs project-override vs project-only scope. The skill works without the CLI (documented path). The global repo has its own `AGENTS.md` for maintenance requests ("update the performance rule to …").
- New: `docs/HANDBOOK.md` — how every part works and how to update it (global vs project rules, memory, notes, skills, agents; lifecycle; FAQ).
- Fixed: `kiwi context`/detect no longer report symlinked entry points as hand-written legacy files.

## 3.0.0 — 2026-09-21 — the universal global system

- New: `~/.thekiwidev` as the single home for skills, agents, rules, workflows, hooks and the project initializer, wired into Claude Code, Codex, Gemini CLI, Antigravity and GitHub Copilot by `kiwi install`.
- New: `kiwi` CLI — `install`, `doctor`, `list`, `new`, `init`, `link`, `vendor`, `upgrade`, `sync`, `publish`. Zero dependencies.
- New: `GLOBAL.md`, the personal constitution loaded by every agent globally.
- New: initializer v3 (`skills/kiwi-system`) — v2 plus global-system awareness (§0.0), the mandatory "Global system" section in `AGENT-CORE.md`, `kiwi_version` / `global_system` / `prd_dir` / `vendored` in `SYSTEM.md`, `create-prd` as the default PRD workflow, the fixed v2→v3 upgrade delta (§24.14), and `docs/ai` templates.
- New skills: `create-prd` (ported from the Antigravity global workflow), `feature-workflow`, `bugfix-workflow`; every former slash command is now a skill (`plan`, `tdd`, `code-review`, `verify`, `build-fix`, `e2e`, `refactor-clean`, `checkpoint`, `learn`, `orchestrate`, `update-docs`, `update-codemaps`, `test-coverage`, `eval`, `setup-pm`).
- Changed: everything ported from everything-claude-code is agent-agnostic and follows the owner-controls-Git rule; the "block .md creation" hook was removed; tmux hooks are opt-in.
- Removed: Claude plugin packaging, ECC branding, WorldFlowAI guide, shell hook duplicates.
- Archived: initializer v1 and v2, the Antigravity-authored implementation plan.
