# NOTES — global (cross-project) observations

> Gotchas, workarounds and lessons that apply across projects or to the tools themselves — not to one codebase (those go in that project's `docs/ai/NOTES.md`). Each note: ID (`G-###`, never reused), date, status (`open` · `deferred` · `deliberate` · `resolved`), context. Agents: read during intake; propose additions, never write silently.

### G-001 — Antigravity workflows are deprecated in favour of skills
**Date:** 2026-09-21 · **Status:** deliberate
**Context:** Google is retiring Antigravity "workflows" (Nov 2026) for Agent Skills. The old `~/.gemini/config/global_workflows/create-prd.md` was ported to `skills/create-prd`; the old folder is left untouched and is not read by this system.

### G-002 — Symlinks out of a repository break on clone
**Date:** 2026-09-21 · **Status:** deliberate
**Context:** Project entry points symlink *inside* the repo (`docs/ai/AGENT-CORE.md`) and are safe to commit. Global skills are never symlinked into a repo; cloud agents and teammates get copies via `kiwi vendor` instead.
