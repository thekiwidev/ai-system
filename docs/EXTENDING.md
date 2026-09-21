# Extending the system

Quick recipes. The model behind them — two layers, precedence, memory/notes/rules scopes — is in [HANDBOOK.md](HANDBOOK.md).

Everything reusable lives here once and reaches every agent through `kiwi install`. The loop is always: **create → validate → install → (publish) → upgrade projects that vendor it**.

## Add a skill or a workflow

A workflow is just a skill whose body is a multi-step procedure (`invocable: true` so Codex/Gemini get a slash command).

```bash
kiwi new skill my-thing --description "What it does and when to use it"
kiwi new workflow release-checklist --description "…"
# edit skills/<name>/SKILL.md
kiwi install          # links it into every agent
kiwi doctor           # frontmatter + links check
```

Frontmatter contract (`skills/_template/SKILL.md`):

```yaml
name: my-thing            # must equal the directory name, kebab-case
description: …            # agents match on this — include the trigger words
invocable: true|false     # true → /prompts:my-thing (Codex), /my-thing (Gemini), Copilot prompt when vendored
```

Keep one procedure or one body of knowledge per skill. Long reference material goes in sibling files (`references/`, `examples/`) that the skill links to, so agents load it only when needed. Never instruct a Git operation in a skill.

To promote a learned pattern: the `learn` skill writes drafts to `skills/learned/`; move the good ones to a proper `skills/<name>/` and run `kiwi install`.

## Add an agent

```bash
kiwi new agent rust-reviewer --description "…"
```

Frontmatter: `name`, `description` (say *Use PROACTIVELY when …* — Claude auto-delegates on it), `tools`, `model`. Claude Code loads it from `~/.claude/agents/`; Copilot gets `.github/agents/<name>.agent.md` when a project runs `kiwi vendor`; Codex/Gemini/Antigravity have no sub-agent file format — agents there adopt the role when the file is named, per `GLOBAL.md` § 6.

## Add or change a rule

```bash
kiwi new rule naming --description "…"
```

Rules are always-on: short, imperative, verifiable. Claude reads `~/.claude/rules/`; Antigravity and Copilot get copies in projects via `kiwi vendor`; every other agent reaches them through `GLOBAL.md` § 6. A project's `ENGINEERING.md` overrides a global rule on the same topic.

**Changing a global rule that projects already mirror** is an amendment: change it here, run `kiwi install`, then in each affected project say *"AMEND: <the rule>"* — the agent cascades it into that project's `RULES.md`, `ENGINEERING.md` and mirrors (INITIALIZER §25). Global rules never silently override a project.

## Global memory and notes

`MEMORY.md` (cross-project current state) and `NOTES.md` (`G-###` cross-project gotchas) at the global root. Edit them yourself, or approve an agent's proposed entry. Project facts never go there — see HANDBOOK § 2.5–2.6.

## Change `GLOBAL.md`

Edit it. Nothing to install — every agent imports the file by path. Keep it short: principles, git policy, lifecycle, where things live. Detailed procedures belong in skills.

## Hooks (Claude Code only)

Edit `hooks/hooks.json` (paths use `${CLAUDE_PLUGIN_ROOT}`, replaced with the global root at install) and `scripts/hooks/*.js`. `kiwi install --hooks` re-merges; entries are tagged `[kiwi]` so re-runs replace rather than duplicate. Hooks whose description mentions tmux are skipped unless `config.json` → `hooks.tmux` is true.

## Support a new agent

Add `lib/adapters/<agent>.js` exporting `{ id, name, global(ctx), project(ctx, dir, opts) }` returning ops (`symlink` / `managed` / `file` / `copy` / `json` — see `lib/ops.js`), register it in `lib/adapters/index.js`, add it to `config.json` → `agents`, document it in `docs/AGENT-MATRIX.md`, add a test in `tests/lib/adapters.test.js`.

## Change the initializer

`skills/kiwi-system/INITIALIZER.md`, the `runbooks/` and `templates/` are subject to the initializer's own rules (its §30): bump `version` in `package.json` (this is `kiwi_version`), describe the delta in a new `§24.x` so UPGRADE mode knows exactly what to add, update `templates/docs-ai/` in the same change, note it in `CHANGELOG.md`. Projects pick it up with `kiwi upgrade`.

## Publish

```bash
node tests/run-all.js
git add -A && git commit -m "feat: add release-checklist workflow"   # you commit — kiwi never does
kiwi publish                                                          # git push, asks first
```

On another machine: `kiwi sync` (pull + re-install).

## Config

`config.json` at the global root: which agents to wire (`agents`), `hooks.install` / `hooks.tmux`, `wrappers.codex` / `wrappers.gemini`, `bridges.cursor` / `bridges.windsurf` / `bridges.copilotPrompts`, `prdDir`. CLI flags override it.
