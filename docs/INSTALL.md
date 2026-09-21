# Install

Works on macOS, Linux, WSL and Windows. Needs **git** and **Node.js 18+** (no npm packages are installed). Nothing here runs Git on your behalf after the clone.

## For anyone — make it yours

The system is personal: it installs into *your* home folder under a name you choose, with your handle in the constitution, and fresh (empty) memory/notes. Nothing of the original owner's projects comes along.

**macOS / Linux / WSL / Git Bash**

```bash
curl -fsSL https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.sh | bash
```

**Windows (PowerShell)** — enable *Developer Mode* first (Settings → For developers) so symlinks work without admin, or run from an elevated terminal.

```powershell
irm https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.ps1 | iex
```

Non-interactive: append `-- --owner jane --home .jane --caveman full --yes` (bash) or `-Owner jane -Home .jane -Yes` (PowerShell).

Prefer to read before you run? Clone, then run the setup locally:

```bash
git clone https://github.com/thekiwidev/ai-system.git ~/.jane     # any folder name
node ~/.jane/bin/setup.js                                          # asks: handle, folder, caveman default
```

### What setup does

1. Checks Node ≥ 18 and that the folder is a checkout.
2. Asks your handle and the global folder name (default `.<handle>`).
3. **Rebrands** the checkout (`kiwi rebrand`): every `~/.thekiwidev` becomes `~/.<yours>`, the owner handle in `GLOBAL.md` / `README` / `package.json` becomes yours. Credits are kept.
4. Writes fresh `MEMORY.md` and `NOTES.md` for you and records your caveman default in `config.json`.
5. Links `~/.<yours>` → the checkout (junction on Windows).
6. Runs `kiwi install`: symlinks skills/agents/rules into every agent's own config, generates Codex/Gemini command wrappers, adds a managed block to `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md`, and installs the Claude Code scope-guard hook. `--shell` adds `bin/` to your PATH on macOS/Linux; on Windows it prints the one-line PATH command.

Then: open a new terminal, edit `~/.<yours>/GLOBAL.md` to taste, and in any project tell your agent *"set up this project's AI system"*.

### Keep it in your own Git

The clone still points at the original repository. Make it yours:

```bash
cd ~/.jane
git remote set-url origin git@github.com:jane/ai-system.git   # your empty repo
git add -A && git commit -m "chore: make the AI system mine" && git push -u origin main
```

`kiwi sync` (pull + re-install) and `kiwi publish` (push) work from then on; `kiwi` never commits.

## For the owner — a new machine

```bash
git clone git@github.com:thekiwidev/ai-system.git ~/.thekiwidev
node ~/.thekiwidev/bin/setup.js --mine --yes     # no rebrand, no fresh memory; just link + install
```

## What gets touched, per agent

| Agent | Created by `kiwi install` |
| --- | --- |
| Claude Code | `~/.claude/skills/*`, `~/.claude/agents/*`, `~/.claude/rules/*` (symlinks) · managed block in `~/.claude/CLAUDE.md` · `[kiwi]` scope-guard hook in `~/.claude/settings.json` (backup written) |
| Codex | `~/.agents/skills/*` (symlinks) · `~/.codex/prompts/*.md` (generated) · managed block in `~/.codex/AGENTS.md` |
| Gemini CLI | `~/.gemini/skills/*` · `~/.gemini/commands/*.toml` (generated) · managed block in `~/.gemini/GEMINI.md` |
| Antigravity | `~/.gemini/config/skills/*` (+ `~/.gemini/antigravity-cli/skills/*` if present) |
| GitHub Copilot | `~/.copilot/skills/*` |

Everything is idempotent (`kiwi install` again changes nothing), inspectable (`kiwi doctor`) and reversible (`kiwi uninstall`). Agents you don't use can be switched off in `config.json` → `agents`.

## Uninstall

```bash
kiwi uninstall          # removes the links, wrappers, managed blocks and hooks from the agents' config
rm ~/.jane              # the link (or the folder, if you cloned straight into it)
```

Projects keep their `docs/ai/` — it is theirs, and it works without the global folder (agents are told what to do when it is absent).

## Troubleshooting

- **`kiwi: command not found`** — open a new terminal; on Windows add `<folder>\bin` to PATH (`kiwi install --shell` prints the command).
- **Windows: `EPERM` creating symlinks** — enable Developer Mode or run `kiwi install` once from an elevated terminal.
- **An agent doesn't see a skill** — `kiwi doctor`; if clean, restart the agent (some cache their skill list).
- **Custom location** — set `THEKIWIDEV_AI_HOME=/path/to/checkout` (the env var name does not change with rebrand).
