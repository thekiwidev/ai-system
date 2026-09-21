# Changelog — thekiwidev AI system

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
