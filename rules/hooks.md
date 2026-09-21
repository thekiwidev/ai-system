---
name: hooks
description: What the installed Claude Code hooks do (session memory, compaction suggestions, formatting and lint checks) and how to keep task tracking honest with a todo list.
---

# Hooks

Hooks are Claude Code automations declared in `~/.thekiwidev/hooks/hooks.json`. `kiwi install --hooks` merges them into `~/.claude/settings.json` (tagged `[kiwi]`, backup written). Other agents have no hook system; the same expectations apply to them as rules.

## Installed hooks

### SessionStart / SessionEnd / PreCompact
- **session-start** — loads recent session context and detects the package manager.
- **session-end** — persists session state to `~/.claude/sessions/`; **evaluate-session** extracts reusable patterns (see the `continuous-learning` skill).
- **pre-compact** — saves state before context compaction.

### PreToolUse
- **suggest-compact** — suggests `/compact` at logical intervals after many edits (see `strategic-compact`).
- **tmux reminders** — opt-in (`hooks.tmux` in `config.json`); suggests running long commands in tmux. Off by default because long-running dev servers are owner-run.
- **git push reminder** — prints a review reminder; it never blocks and never pushes for you.

### PostToolUse
- **PR URL** — logs the PR URL and a review command after `gh pr create` (only ever run with owner authorisation).
- **prettier** — formats JS/TS files after edits when prettier is available.
- **tsc** — reports TypeScript errors touching the edited file.
- **console.log warning** — warns about leftover `console.log`.

### Stop
- **console.log audit** — checks modified files for `console.log` before the response ends.

Removed on purpose: the "block creation of .md files" hook — it fights the `docs/ai/` documentation system.

## Permissions

Prefer an explicit allow-list of routine commands over broad auto-accept. Never run with permission checks disabled.

## Todo list discipline

Use the runtime's todo/task tool for multi-step work: it exposes wrong ordering, missing steps, wrong granularity and misread requirements early, and lets the owner steer in real time.
