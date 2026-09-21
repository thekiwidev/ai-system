# thekiwidev AI system

One personal folder — **`~/.thekiwidev`** — that holds my skills, agents, rules, workflows and the project initializer, wired into **every** coding agent I use: Claude Code, OpenAI Codex, Gemini CLI, Google Antigravity, GitHub Copilot (and anything that reads `AGENTS.md`: Jules, Cursor, Windsurf…). Plus the `kiwi` CLI that sets up any project so whichever agent I open it with follows the same operating system.

```text
~/.thekiwidev/                      this repo, cloned or symlinked
├── GLOBAL.md                       my constitution — loaded by every agent, globally
├── MEMORY.md · NOTES.md            cross-project state and gotchas (project ones live in each repo)
├── skills/<name>/SKILL.md          procedures, workflows, domain knowledge (the universal format)
├── agents/<name>.md                specialist sub-agents (planner, architect, code-reviewer, …)
├── rules/<name>.md                 always-on conventions (git, coding style, testing, security, …)
├── skills/kiwi-system/             the project initializer: INIT · ADOPT · UPGRADE · AMEND · AUDIT · EXTEND
│   ├── INITIALIZER.md · runbooks/  the spec, and the per-mode checklists the agent follows
│   └── templates/docs-ai/          skeleton of every project document
├── skills/caveman/, rules/caveman.md   terse output style (mirrored upstream skill + our always-on rule)
├── skills/context-docs/            derived agent-facing copies of memory/notes/changelog
├── hooks/ · scripts/hooks/         Claude Code automations (session memory, compaction, lint checks)
├── bin/kiwi.js · lib/              the CLI (Node ≥ 18, zero dependencies)
├── config.json                     which agents to wire, hooks on/off, opt-in bridges
└── docs/                           how it all fits, and how to extend it
```

## How it works

1. **Skills are the universal currency.** `SKILL.md` (name + description frontmatter) is read natively by all five agents, so every reusable thing — workflows, `create-prd`, the initializer itself — is a skill. Per-agent slash-command wrappers are generated from the frontmatter, never hand-written.
2. **One physical source, many links.** `kiwi install` symlinks this folder into each agent's own global config (`~/.claude/skills`, `~/.agents/skills`, `~/.gemini/skills`, `~/.gemini/config/skills`, `~/.copilot/skills`, …) and adds a managed block to `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and `~/.gemini/GEMINI.md` that points at `GLOBAL.md`. Edit here once; every agent sees it.
3. **Each project gets a repository-native operating system** in `docs/ai/` (`AGENT-CORE.md`, `MEMORY.md`, `WORKFLOW.md`, `VERIFICATION.md`, decisions, plans, …) with `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `.github/copilot-instructions.md` all symlinked to the one canonical file. The project system points back at the global one and wins on conflict.
4. **The agent is the interface.** In any project, in any agent, say *"set up this project's AI system"* (or *upgrade* / *audit* it). The `kiwi-system` skill fires, the agent runs `kiwi agent` itself, and The brief it gets back contains the tools, the verified project context, the steps, the runbook for the mode and the templates; the agent asks only what the repo cannot answer, writes `docs/ai/`, and finishes with `kiwi stamp`. The CLI never invents project facts; you never have to drive it from the terminal.

How it all fits and how to change any part of it: [docs/HANDBOOK.md](docs/HANDBOOK.md) — including the [overrides & updates cookbook](docs/HANDBOOK.md#6-overrides-and-updates--the-cookbook) (per-project rule overrides, updating a global rule, what propagates where). Full matrix of who reads what: [docs/AGENT-MATRIX.md](docs/AGENT-MATRIX.md). The project system: [docs/PROJECT-SYSTEM.md](docs/PROJECT-SYSTEM.md). Adding things: [docs/EXTENDING.md](docs/EXTENDING.md).

## Install

**Anyone** — it becomes yours (your folder name, your handle, empty memory), on macOS / Linux / WSL:

```bash
curl -fsSL https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.sh | bash
```

Windows (PowerShell, Developer Mode on for symlinks):

```powershell
irm https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.ps1 | iex
```

Or clone anywhere and run `node bin/setup.js`. Details, per-agent footprint, uninstall: [docs/INSTALL.md](docs/INSTALL.md).

**Me, on a new machine:** `git clone git@github.com:thekiwidev/ai-system.git ~/.thekiwidev && node ~/.thekiwidev/bin/setup.js --mine --yes`.

## Daily use

| Command | What |
| --- | --- |
| `kiwi install` | (re)link the global folder into every agent — run after any change here |
| `kiwi doctor` | read-only health check of the global install and, in a repo, the project |
| `kiwi list` | every skill (● = invocable), agent and rule |
| `kiwi new skill\|workflow\|agent\|rule <name>` | scaffold a component from its template |
| `kiwi init` | in a project: detect INIT/ADOPT/UPGRADE/AUDIT and print what to tell your agent (optional — saying it in the agent does the same) |
| `kiwi agent [MODE]` | **for the agent**: in a project, the complete brief for the mode — tools, context, steps, runbook, templates. The agent runs this one command and follows the output |
| `kiwi context` · `kiwi spec <n>` · `kiwi template [name]` | the pieces of that brief on their own (read-only) |
| `kiwi stamp` | in a project: the agent's last step — records `kiwi_version` etc. in `docs/ai/SYSTEM.md` |
| `kiwi link` | in a project: create/repair the entry-point symlinks and adapters (after `docs/ai/AGENT-CORE.md` exists) |
| `kiwi vendor [a,b]` | copy global skills/rules into the repo for cloud agents / teammates without `~/.thekiwidev` |
| `kiwi upgrade` | in a project: repair links and vendored copies, then print what to tell your agent (optional — the agent runs `kiwi link` itself) |
| `kiwi caveman <off\|lite\|full\|ultra\|inherit\|status> [--global]` | the caveman output-style flag: global default or per project (`.caveman.json`) |
| `kiwi ctx status\|stamp\|init` | in a project: derived agent-facing context docs (`docs/ai/context/`) — current/stale by source hash |
| `kiwi rebrand --home .<name> [--owner <handle>]` | make the checkout yours (setup does this for you) |
| `kiwi uninstall` | remove everything `install` put into the agents' config |
| `kiwi sync` / `kiwi publish` | `git pull` / `git push` this folder — asks first, never commits |

In any agent, in any project: *"set up / upgrade / audit this project's AI system"* (Claude: also `/kiwi-system`); *"use the create-prd skill"*, *"run the feature-workflow"*, `/plan`, `$tdd` for daily work — same files everywhere.

## Fewer tokens, same knowledge

- **Caveman** ([JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman), MIT skill, mirrored) is on by default in every agent: terse answers, code/errors/paths untouched, clear sentences for anything risky. Global flag + per-project `.caveman.json`; never applied to docs, commits or anything you read.
- **Derived context docs**: agents read a caveman-ultra copy of `MEMORY.md` / `NOTES.md` / `CHANGELOG.md` (`docs/ai/context/`), kept honest by the source's sha256 — stale copies are a failed gate, you keep reading the real files. [HANDBOOK § 2.11–2.12](docs/HANDBOOK.md).

## Principles baked in

YAGNI · never guess project facts · never silently overwrite existing knowledge · **the owner controls Git** (no autonomous branch/commit/push, ever) · verification gates are never weakened · documentation is part of the implementation · the repository, not the chat, is the durable source of truth. See [GLOBAL.md](GLOBAL.md).

## Tests

```bash
node tests/run-all.js
```

## Credits

The agents, many skills, the hooks and the cross-platform scripts started life in [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) (MIT) and were rewritten for this system: made agent-agnostic, rebranded, and brought under the Git and documentation rules above. The project initializer is my own (v1 → v2 → v3; earlier versions in [docs/archive](docs/archive)).

MIT — see [LICENSE](LICENSE) for third-party notices.
