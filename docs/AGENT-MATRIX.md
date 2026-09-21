# Agent matrix — who reads what

What `kiwi install` (global) and `kiwi link` / `kiwi vendor` (project) create for each agent. Paths come from each vendor's current docs; they live in `lib/adapters/*.js`, one file per agent, so a vendor change is a one-line fix.

| Agent | Global (`kiwi install`) | Project (`kiwi link`) | Project (`kiwi vendor`, extra) |
| --- | --- | --- | --- |
| **Claude Code** | `~/.claude/skills/<n>` → symlink per skill · `~/.claude/agents/<n>.md` · `~/.claude/rules/<n>.md` · managed block in `~/.claude/CLAUDE.md` importing `@~/.thekiwidev/GLOBAL.md` · hooks into `~/.claude/settings.json` with `--hooks` | `CLAUDE.md` → `docs/ai/AGENT-CORE.md` | `.agents/skills/<n>` copies (Claude also reads `.claude/skills`; `.agents` is the cross-vendor spot) |
| **OpenAI Codex** | `~/.agents/skills/<n>` symlinks (Codex's user-level skills path) · `~/.codex/prompts/<n>.md` generated per invocable skill (`/prompts:<n>`) · managed block in `~/.codex/AGENTS.md` | `AGENTS.md` → `docs/ai/AGENT-CORE.md` | `.agents/skills/<n>` copies |
| **Gemini CLI** | `~/.gemini/skills/<n>` symlinks · `~/.gemini/commands/<n>.toml` generated (`/<n>`) · managed block in `~/.gemini/GEMINI.md` | `GEMINI.md` → `docs/ai/AGENT-CORE.md` | `.agents/skills`, `.agents/rules` copies |
| **Antigravity** | `~/.gemini/config/skills/<n>` symlinks (+ `~/.gemini/antigravity-cli/skills` when present) · shares `~/.gemini/GEMINI.md` | `.agents/rules/00-agent-core.md` pointer (Antigravity's workspace-rules dir) + `GEMINI.md` | `.agents/rules/<n>.md` copies of global rules, `.agents/skills` copies |
| **GitHub Copilot** | `~/.copilot/skills/<n>` symlinks (`~/.agents/skills` also read) | `.github/copilot-instructions.md` → `../docs/ai/AGENT-CORE.md` | `.github/instructions/<rule>.instructions.md` (`applyTo: "**"`) · `.github/agents/<n>.agent.md` from `agents/` · `.github/prompts/<n>.prompt.md` when `bridges.copilotPrompts` |
| **Jules · Cursor · Windsurf · Cline · Zed …** | — | `AGENTS.md` (symlink, always). Opt-in in `config.json`: `.cursor/rules/kiwi-agent-core.mdc`, `.windsurfrules` pointers | `.agents/skills`, `.agents/rules` |

## Caveman (output style)

Global mode → every agent's managed block (`kiwi install`). Project mode → `.caveman.json` (upstream-compatible), stated in `AGENT-CORE.md § 11`, `.agents/rules/01-caveman.md` (Antigravity) and, when vendored, `.github/instructions/caveman.instructions.md` (Copilot). `/caveman` is the mirrored skill in every skills dir.

## Slash commands

Claude Code exposes every installed skill as `/<name>` on its own, so no wrappers are generated for it. Codex (`/prompts:<name>`) and Gemini (`/<name>`) get generated wrappers for skills with `invocable: true`; both can also activate skills by description. Copilot prompt files are project-level and opt-in.

## Managed blocks

Global instruction files are user-owned; kiwi only rewrites the region between `<!-- kiwi:start … -->` and `<!-- kiwi:end -->`, creating the file if absent. Everything outside is never touched.

## Cloud agents

Jules, the Copilot coding agent and Codex cloud only see the repository. `kiwi vendor` copies the global skills a project relies on (default: every invocable skill except `kiwi-system`) and all rules into `.agents/`, marks them with `.kiwi-vendored`, and records them in `docs/ai/SYSTEM.md` → `vendored`. `kiwi upgrade` refreshes them. Without vendoring, the project's `AGENT-CORE.md` references skills by name and says what to do when they cannot be resolved.

## Removed on purpose

Claude plugin packaging (symlink install replaces it), the ECC "block .md creation" hook (fights `docs/ai/`), Antigravity workflows (`~/.gemini/config/global_workflows` — deprecated by Google in favour of skills; the existing `create-prd` there was ported to `skills/create-prd` and the old folder is left untouched).
