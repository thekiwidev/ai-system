# MEMORY — global (cross-project) current state

> What is true about **me and my environment across every project**. Project facts never go here — they live in that project's `MEMORY.md`. Rewritten when reality changes; never a diary; no secrets. Agents: read at session start (via `GLOBAL.md`); propose an addition only for a durable, cross-project fact, and never write here silently.

## Who I am

- Solo developer (`thekiwidev`); I switch between Claude Code, Codex, Gemini CLI, Antigravity and GitHub Copilot on the same repositories.
- The global AI system is this folder (`~/.thekiwidev`, a symlink to `~/work/me/ai-system`); the `kiwi` CLI is on my PATH.

## Environment defaults

- macOS, zsh. Node ≥ 18 available. Bun is my default JS package manager and script runner unless a project's lockfile says otherwise.
- Long-running dev servers are mine to run from my own terminal; agents check reachability and ask me to start them.
- Git history is mine; agents never commit, branch or push without an explicit per-interaction authorisation.

## Projects with a `docs/ai/` system

<!-- One line per project: path · state (kiwi_version) · one-phrase description. Keep current. -->
- `~/work/<client>/crm` — a client CRM with a v2-built system; UPGRADE to kiwi pending.
- `~/work/mgnx/shopping` — MigranX Shopping App (`procustomer`); kiwi 3.2.0.

## Preferences agents keep getting wrong

<!-- Only durable, cross-project corrections. Project-specific ones belong in that project's ENGINEERING.md or NOTES.md. -->
