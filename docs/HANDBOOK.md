# Handbook — how the system works and how to change it

The reference for everything in `~/.thekiwidev`. Short recipes are in [EXTENDING.md](EXTENDING.md); the per-agent wiring is in [AGENT-MATRIX.md](AGENT-MATRIX.md); the per-project system is in [PROJECT-SYSTEM.md](PROJECT-SYSTEM.md). This page explains the *model*: the two layers, each kind of thing, its precedence, who reads it, and how to update it.

---

## 1. The two layers

```text
GLOBAL   ~/.thekiwidev            me — every project, every agent
PROJECT  <repo>/docs/ai + MEMORY.md   this repository — every agent that opens it
```

**Precedence when they disagree: the project wins.** The global layer fills gaps. In a project's source-of-truth hierarchy the global constitution and rules sit at 6a — below the PRD, plan, decisions, memory and the project's own engineering/workflow rules, above notes and history.

**How each layer reaches an agent**

| Layer | Path into the agent |
| --- | --- |
| Global | `kiwi install` links the folder into the agent's own global config (skills dirs, agents/rules dirs) and puts a managed block in its global instruction file (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md`) that points at `GLOBAL.md`. |
| Project | The agent reads `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `.github/copilot-instructions.md` at the repo root — all symlinks to `docs/ai/AGENT-CORE.md` — whose startup protocol says what else to read. |

Cloud agents (Jules, Copilot coding agent, Codex cloud) only see the repository; `kiwi vendor` copies the global skills and rules a project relies on into `.agents/` for them.

---

## 2. The things, one by one

### 2.1 GLOBAL.md — the constitution

**What:** my non-negotiables (YAGNI, never guess, never overwrite, owner controls Git, verification, documentation, security), the lifecycle, when to ask me, preferences, where everything lives, the two-layer rule.
**Who reads it:** every agent, every session, through its global instruction file.
**Update:** edit the file. Nothing to reinstall — agents import it by path. Keep it short; procedures belong in skills.

### 2.2 Skills (and workflows)

**What:** `skills/<name>/SKILL.md` — a procedure or a body of knowledge. A *workflow* is a skill whose body is a multi-step procedure (`invocable: true`). `SKILL.md` is the one format every agent reads natively.
**Where agents find them:** their own skills directory (symlinked by `kiwi install`): Claude `/name`, Codex `$name` or `/prompts:name`, Gemini `/name`, Antigravity and Copilot by description or when named.
**Precedence / resolution when named:** project vendored copy → `~/.thekiwidev/skills/<name>` → the agent's own installed copy. Unresolvable → the agent says so and continues; never invents it.
**Add:** `kiwi new skill <name>` (or `workflow`), edit, `kiwi install`. **Update:** edit the file; `kiwi install` refreshes generated wrappers (`kiwi doctor` shows them as stale until you do). **Remove:** delete the directory, `kiwi install`, then `kiwi doctor` lists any dangling links to remove.
**Project-specific skill:** put it in `<repo>/.agents/skills/<name>/SKILL.md` (Codex, Copilot, Antigravity read it; Claude reads `.claude/skills/`, so add a symlink there if needed) and list it in `docs/ai/workflows/INDEX.md`. It resolves first.

### 2.3 Agents

**What:** `agents/<name>.md` — a specialist sub-agent (planner, architect, code-reviewer, security-reviewer, tdd-guide, …) with `name`, `description` ("Use PROACTIVELY when …"), `tools`, `model`.
**Who uses them:** Claude Code natively (`~/.claude/agents`); Copilot via generated `.github/agents/*.agent.md` when a project vendors; Codex / Gemini / Antigravity adopt the role when the file is named (GLOBAL.md § 6).
**Add / update:** `kiwi new agent <name>`, edit, `kiwi install`.

### 2.4 Rules

**What:** always-on conventions. Three places, one precedence:

| Scope | Where | Precedence |
| --- | --- | --- |
| Global default | `~/.thekiwidev/rules/<name>.md` | lowest — applies where the project is silent |
| Project rule | `docs/ai/ENGINEERING.md` (conventions), `docs/ai/CONSTITUTION.md` (principles), each registered in `docs/ai/RULES.md` | wins |
| Project rule file for rule-directory agents | `<repo>/.agents/rules/<name>.md` (Antigravity; Copilot via `.github/instructions/`), registered in `RULES.md` with its canonical home | same as project |

**Who reads global rules:** Claude from `~/.claude/rules/`; everyone else through `GLOBAL.md` § 6, and Antigravity/Copilot from vendored copies in projects.
**Add a global rule:** `kiwi new rule <name>`, edit, `kiwi install`. Frontmatter: `name`, `description`, `applyTo` (Copilot glob).
**Add a project rule:** in a project, tell the agent *"AMEND: <rule>"* — it puts the rule in its canonical home, registers it in `RULES.md`, and cascades it to every mirror (checklists, gates, report format). Don't add rules to project files by hand without registering them; the registry is what makes later changes mechanical.
**Change a global rule that projects mirror:** edit it here, `kiwi install`, then *"AMEND: …"* in each project that mirrors it. The global never silently overrides a project.

### 2.5 Memory

| Scope | File | Holds | Never holds |
| --- | --- | --- | --- |
| Global | `~/.thekiwidev/MEMORY.md` | who I am, environment defaults, which projects carry a system, durable cross-project preferences | project facts, secrets |
| Project | `<repo>/MEMORY.md` | that project's current state: position, fixed decisions, architecture, features (incl. partial), environment, gotchas, deferred work, deviations, open questions | history (changelog), reasoning (ADRs), observations (notes) |

Both are **current state only** — rewritten when reality changes, never a diary. Agents read both at session start (project one via `AGENT-CORE.md` § 2, global one via `GLOBAL.md`). Agents update the project one as the project `WORKFLOW.md` requires; they **propose** global entries in their report and never write the global file silently.

### 2.6 Notes

| Scope | File | IDs | Holds |
| --- | --- | --- | --- |
| Global | `~/.thekiwidev/NOTES.md` | `G-###` | tool-level and cross-project gotchas, lessons, deliberate choices about the system |
| Project | `<repo>/docs/ai/NOTES.md` | `N-###` | open defects, deferred concerns, investigation notes, deliberate non-fixes, legacy patterns and their status |

Read before treating anything as new. Same write discipline as memory.

### 2.7 Decisions, plans, changelog, handoff (project only)

`docs/ai/decisions/` (ADRs — why durable choices were made), `docs/ai/plans/{active,completed}` (what and in what order), `CHANGELOG.md` (what changed), `docs/ai/HANDOFF.md` (the baton). Defined in INITIALIZER §9; the `WORKFLOW.md` decision matrix says which to touch after any change.

### 2.8 The manifest and the registry (project only)

`docs/ai/SYSTEM.md` describes the system itself: `kiwi_version`, modules present / pruned (with reasons) / not applicable, customizations (protected from upgrades), open confirmations, `prd_dir`, `vendored`. `docs/ai/RULES.md` lists every rule with its canonical home and mirrors. Neither is ever pruned — they are what makes upgrades and amendments safe.

### 2.9 Hooks (Claude Code only)

`hooks/hooks.json` + `scripts/hooks/*.js`: session memory, compaction suggestions, prettier / tsc / console.log checks. `kiwi install --hooks` merges them (tagged `[kiwi]`); tmux hooks need `config.json` → `hooks.tmux: true`.

### 2.10 config.json

Which agents to wire, hooks, wrappers, opt-in Cursor/Windsurf/Copilot-prompt bridges, default `prdDir`, the global `caveman.mode`, the default `contextDocs` set. CLI flags override.

### 2.11 Caveman — the output style

**What:** the [caveman](https://github.com/JuliusBrussee/caveman) skill (mirrored, MIT, pinned in `skills/caveman/UPSTREAM.json`; `node scripts/update-caveman.js` re-syncs; `kiwi doctor` warns when a newer tag exists). Agents answer terse — articles/filler/hedging gone, fragments, code/paths/errors untouched, full clear sentences again for security and irreversible actions. Levels `lite` / `full` / `ultra`. `rules/caveman.md` is the always-on digest with our boundaries.
**Always-on everywhere:** the global mode is baked into every agent's managed block by `kiwi install`; the project mode into `.agents/rules/01-caveman.md` and `AGENT-CORE.md § 11` by `kiwi link`. No upstream plugin or hook needed (their Claude plugin can coexist — it reads the same `.caveman.json` — but adds a duplicate `/caveman`; default: don't).
**The flags — precedence:** `CAVEMAN_DEFAULT_MODE` env → project `.caveman.json` (`{"defaultMode":"off|lite|full|ultra"}`) → global `config.json` (mirrored to `~/.config/caveman/config.json`, upstream's path) → `full`.

```bash
kiwi caveman status            # effective mode here and where it comes from
kiwi caveman off               # this project: off   (writes .caveman.json, regenerates pointers)
kiwi caveman lite              # this project: lite
kiwi caveman inherit           # this project: follow the global default
kiwi caveman full --global     # global default; re-installs the managed blocks
/caveman ultra · /caveman off · "normal mode"     # for one session, in any agent
```
**Boundaries (never caveman):** code, comments, commit messages, PR/issue text, `docs/ai/**`, `MEMORY.md`, `CHANGELOG.md`, `NOTES.md`, PRDs, plans, README — anything a human reads. Exception by design: derived context docs (next).
**Not included:** the proxy (input compression, BSL, separate layer) and upstream's `caveman-compress` (rewrites memory files in place — never on canonical docs).

### 2.12 Derived context docs — what you read vs what the agent reads

**What:** for `MEMORY.md`, `docs/ai/NOTES.md`, `CHANGELOG.md` (per project: `SYSTEM.md → context_docs`), an agent-facing copy in `docs/ai/context/<NAME>.md` written in the caveman-ultra register: same facts, every ID / path / version / number / error exact, section order kept, a third to a half of the tokens. You keep reading and editing the source; you never open the copy.
**How sync is enforced:** the copy's frontmatter records the source's `sha256`. `kiwi ctx status` (also inside `kiwi doctor` and `kiwi context`) reports `current` / `stale` / `missing`. Agents read the copy only when current, else the source; whenever a task changes a source, the agent regenerates the copy with the `context-docs` skill and runs `kiwi ctx stamp` — a stale copy is a failed completion gate (RULE-DOC-011). Hashes, not timestamps, so it is exact and works without the CLI (`shasum -a 256`).
**Turn on / off:** `context_docs: [MEMORY, NOTES, CHANGELOG]` (default for new projects; INIT/ADOPT ask) or `[]`. `kiwi ctx init` creates placeholders; the agent fills them. Upgrading an older project offers it as delta V3-9.
**Rules:** the source is never compressed or rewritten; the copy is never edited by hand; when they disagree the source wins and the copy is stale by definition.

Which agents to wire, hooks, wrappers, opt-in Cursor/Windsurf/Copilot-prompt bridges, default `prdDir`. CLI flags override.

---

## 3. The project lifecycle

```text
new or existing repo
  │
  ├─ in the agent: "set up this project's AI system"
  │     └─ the kiwi-system skill runs `kiwi agent` → brief → asks you → writes docs/ai → kiwi link → kiwi stamp → kiwi doctor
  │        (`kiwi init` from the terminal only prints that same sentence; it is optional)
  │
  ├─ daily work                       agent reads AGENT-CORE → MEMORY → HANDOFF → WORKFLOW → …; features via create-prd, bugs via bugfix-workflow
  │
  ├─ "AMEND: …" / "EXTEND: …"         rule changes cascade; pruned modules added
  │
  ├─ in the agent: "upgrade this project's AI system"
  │     └─ the skill runs `kiwi agent UPGRADE` → `kiwi link` → delta table → your approval → applies → kiwi stamp
  │
  └─ kiwi doctor                      any time; read-only
```

**Why `kiwi stamp`:** the CLI cannot audit a codebase or ask you questions, so writing `docs/ai/` is the agent's job. `kiwi stamp` is how the agent tells the CLI "the intelligent half landed" (it records `kiwi_version` in `SYSTEM.md`); until it runs, `kiwi doctor` keeps saying UPGRADE. If doctor says the links are fine but the project is still behind, the agent hasn't done it yet — say "upgrade this project's AI system" to it.

---

## 4. How the agent gets its context — `kiwi agent`

Tell any agent, in any project: **"set up / upgrade / audit this project's AI system."** The `kiwi-system` skill (installed in every agent by `kiwi install`, and named in `GLOBAL.md` § 6) makes the agent run `kiwi agent` itself. One command; the response is the whole brief:

1. **Tools** it may run (`context`, `spec`, `template`, `list`, `link`, `vendor`, `stamp`, `doctor`) — all safe, none touch Git.
2. **The global layer** — pointer to `GLOBAL.md` (already in its global instructions) and the global `MEMORY.md` / `NOTES.md` inline.
3. **Verified project context** — `kiwi context` inline: mode + evidence, git state, toolchain and real scripts, instruction files, `docs/ai` inventory, manifest, vendored skills.
4. **Shared steps** — intake, how to ask you (confirmation tables, numbered questions with lettered options), how to write, how to finish.
5. **The runbook for the mode** — the ordered checklist with STOP points.
6. **Templates** — the list; `kiwi template <NAME>` prints one.
7. **Finish** — `kiwi link` → `kiwi stamp` → `kiwi doctor --project` → the report format for that mode.

Depth on demand: `kiwi spec 22.3` prints one section of the specification; `kiwi spec --toc` lists them. The agent never has to read the 3,300-line INITIALIZER end to end. `AMEND` and `EXTEND` are passed explicitly (`kiwi agent AMEND`) because they come from your intent, not the filesystem.

The same brief works in Claude Code, Codex, Gemini CLI, Antigravity and Copilot CLI because each can run a shell command; in a chat without a shell, paste the output of `kiwi agent` yourself.

---

## 5. Keeping the system itself healthy

- After any change here: `kiwi install` → `kiwi doctor`. Stale wrappers and dangling links are reported, never silently left.
- `node tests/run-all.js` before publishing.
- Version: `package.json` → `version` is `kiwi_version`. Bump it when the initializer, templates or runbooks change in a way projects should pick up, describe the delta in `CHANGELOG.md` and in INITIALIZER §24.14 so UPGRADE mode has a fixed list.
- Publish: commit (you), `kiwi publish`. Other machines: `kiwi sync`.
- Memory hygiene: prune the global `MEMORY.md` project list when a project is archived; move a `G-###` note to `resolved` when the tool fixes it.

---

## 6. Overrides and updates — the cookbook

**Before the table — where you say it matters (RULE-SCOPE-001):** an agent writes only inside the folder it was opened in. Every "in `~/.thekiwidev`" cell below means *open the global folder in the agent first*; asked from inside a project, the agent makes the project-scoped change and proposes the global one instead — `kiwi new` scaffolds project files there, `--global` flags refuse, and Claude Code has a hook that physically blocks writes resolving into the global folder.

**The one idea:** projects *point* to global rules; they never copy them. Each project's `docs/ai/ENGINEERING.md § 0` is a table — one row per global rule — marked **adopted**, **overridden** (with the project statement) or **not applicable**. `docs/ai/RULES.md` registers the overrides. That table is what the initializer asks you to fill during INIT/ADOPT ("rules decision"), and what "amend rule" edits later.

| I want to… | Where | How (agent) | How (by hand) | Effect elsewhere |
| --- | --- | --- | --- | --- |
| **Override a global rule in one project** | that project | *"amend rule: in this project, X instead of the global performance rule"* → agent marks the row `overridden`, writes the statement in the right `ENGINEERING.md` section, registers `RULE-… overrides ~/.thekiwidev/rules/performance.md`, cascades, logs `AMENDMENTS.md` | edit the same row + section + registry entry | none — other projects unaffected |
| **Add a project-only rule** (e.g. custom security) | that project | *"amend rule: …"* (scope: this project) | add to `ENGINEERING.md`/`CONSTITUTION.md` + `RULES.md` | none |
| **Update a global rule** (e.g. performance) | `~/.thekiwidev/rules/performance.md` | open an agent *in* `~/.thekiwidev` and say *"update the performance rule to …"* (its `AGENTS.md` tells it how) | edit the markdown | **projects that adopted it are updated instantly** (pointer). Projects that overrode it keep their override — say "amend rule" there if you want the new global text to win. Nothing to reinstall for rules; `kiwi install` only if you add/rename a file. |
| **Add a global rule** | `~/.thekiwidev/rules/` | *"add a global rule for …"* in `~/.thekiwidev` | `kiwi new rule <name>`, edit | `kiwi install`; new rule is offered in the next INIT/ADOPT/UPGRADE rules decision of each project (`kiwi doctor`/UPGRADE flags a missing row) |
| **Change the constitution** (`GLOBAL.md`) | `~/.thekiwidev/GLOBAL.md` | *"change GLOBAL.md: …"* in `~/.thekiwidev` | edit | instant everywhere (imported by path); if a project mirrors the old text in `AGENT-CORE.md`, "amend rule" there |
| **Add / update a skill or workflow** | `~/.thekiwidev/skills/<name>/` | *"add a skill for …"* / *"update the create-prd skill to …"* in `~/.thekiwidev` | `kiwi new skill|workflow`, edit | `kiwi install` regenerates Codex/Gemini wrappers; projects reference skills by name so they get it instantly; vendored copies refresh on `kiwi upgrade` in that project |
| **Add / update an agent** | `~/.thekiwidev/agents/<name>.md` | same pattern | `kiwi new agent` | `kiwi install`; Copilot `.github/agents` copies refresh on `kiwi upgrade` when vendored |
| **Change the initializer itself** | `skills/kiwi-system/` | *"change how projects are initialized: …"* in `~/.thekiwidev` | edit INITIALIZER + runbooks + templates together, bump `package.json` version, note §24.14 | each project: *"upgrade this project's AI system"* |
| **Record something cross-project** | global `MEMORY.md` / `NOTES.md` | approve the entry an agent *proposed* in its report, or say *"remember globally: …"* in `~/.thekiwidev` | edit | read by every agent at session start |
| **Remove a rule/skill** | delete the file | *"remove …"* in `~/.thekiwidev` | delete, `kiwi install`, `kiwi doctor` lists dangling links to remove | projects that pointed to it: the row becomes stale → next AUDIT/UPGRADE flags it |

Precedence never changes: project override > project rule > global rule > nothing. An upgrade never reverts an override (they are protected customizations); an audit reports a row whose global file no longer exists.

## 7. FAQ

**Doctor keeps saying UPGRADE after I ran `kiwi upgrade`.** The agent half hasn't run, or it ran without `kiwi stamp`. Tell your agent "upgrade this project's AI system" and make sure it ends with `kiwi stamp`.

**I asked for a rule change in a project and the agent refused to touch the global rule. Correct?** Yes — RULE-SCOPE-001. It wrote the override in that project's `ENGINEERING.md § 0` and told you how to make it global. Open `~/.thekiwidev` in the agent and say it there if you want it everywhere.

**Do I ever need the terminal?** Only for the global folder (`kiwi install`, `kiwi doctor`, `kiwi new`, `kiwi publish`). Everything per project is done by the agent through the skill.

**An agent can't find a skill.** `kiwi doctor` — if the global install is clean, the agent's runtime may cache skill lists; restart it. Cloud agent? `kiwi vendor <name>`.

**I want a rule only in one project.** *"AMEND: …"* in that project. It lands in `docs/ai/`, registered in `RULES.md`, and outranks the global rule.

**I want a rule everywhere.** `kiwi new rule`, edit, `kiwi install`; then *"AMEND: …"* in projects that already mirror an older version.

**Where do I write something I learned?** Cross-project and durable → global `MEMORY.md` / `NOTES.md` (agents propose, you approve). About one project → that project's `MEMORY.md` / `docs/ai/NOTES.md` (agents write as the workflow requires). Reusable procedure → a skill.

**Why does an agent read `docs/ai/context/MEMORY.md` instead of `MEMORY.md`?** It is the derived, token-cheap copy (§ 2.12) and `kiwi ctx status` said it was current. If you edit `MEMORY.md`, the copy goes stale and the next agent reads your version and regenerates the copy.

**Can I still paste the initializer into a chat without the CLI?** Yes — `skills/kiwi-system/INITIALIZER.md` plus the runbook for the mode; the agent does the CLI's steps by hand and says so.
