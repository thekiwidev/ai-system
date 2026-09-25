# AGENTS.md — maintaining the global AI system (this repository)

You are working **inside `~/.thekiwidev`**, the owner's global AI system — not inside a project. This file is for that case only; projects have their own `docs/ai/AGENT-CORE.md`. `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` here are symlinks to this file.

## What lives here

`GLOBAL.md` (constitution) · `MEMORY.md` / `NOTES.md` (cross-project) · `skills/<name>/SKILL.md` · `agents/<name>.md` · `rules/<name>.md` · `skills/kiwi-system/` (the project initializer: `INITIALIZER.md`, `runbooks/`, `templates/`) · `bin/`, `lib/` (the `kiwi` CLI) · `docs/` (`HANDBOOK.md` explains the whole model). Read `docs/HANDBOOK.md` before changing anything structural.

## Typical requests and what to do

| Owner says | Do |
| --- | --- |
| "Update the performance rule to …" | Edit `rules/performance.md` (keep the frontmatter; keep it short, imperative, verifiable). Tell the owner which projects override it (grep their `ENGINEERING.md § 0` if they are on this machine) — those keep their override until amended there; adopted-as-pointer projects pick the change up automatically. |
| "Add a rule / skill / workflow / agent" | Follow `rules/kinds.md`: workflows through the `create-workflow` skill (template `skills/_template-workflow/`), everything else through `kiwi-author`; `kiwi new rule|skill|workflow|agent <name>` scaffolds from the template, then `kiwi install` so every agent links it; `kiwi doctor` must be clean (it checks workflow shape). |
| "Change GLOBAL.md" | Edit it; nothing to install. Keep procedures in skills, not here. |
| "Remember that … (cross-project)" | Add to `MEMORY.md` (state) or `NOTES.md` (`G-###` gotcha). Project facts do not belong here. |
| "Change how projects are initialized" | Edit `skills/kiwi-system/INITIALIZER.md` / `runbooks/` / `templates/` together; bump `version` in `package.json`; describe the delta in `CHANGELOG.md` and INITIALIZER §24.14 so UPGRADE mode has a fixed list; run `node tests/run-all.js`. |
| "Support agent X" | `lib/adapters/<x>.js` (+ `index.js`, `config.json`, `docs/AGENT-MATRIX.md`, a test). |

## Rules of this repository

- **Scope (RULE-SCOPE-001):** opened here, you edit the global system — and nothing else. If the owner names a project ("fix the CRM override"), do not edit that project's files from here; tell them to open the project and say it there. The mirror rule applies in projects: agents there never edit this folder.

- Frontmatter contract: skills `name` (= directory), `description`, `invocable`; agents `name`, `description`, `tools`, `model`; rules `name`, `description`, `applyTo`. `kiwi doctor` validates it.
- Never put secrets, machine paths (other than `~/.thekiwidev`), or project facts in committed files.
- After any change: `kiwi install` (relinks, regenerates wrappers) → `kiwi doctor` → `node tests/run-all.js`.
- **No Git operations without the owner's explicit authorisation** (GLOBAL.md § 2.4). Finish with "ready for your review and commit"; the owner runs `kiwi publish`.
