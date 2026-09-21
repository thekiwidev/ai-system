# Runbooks

`kiwi agent [MODE]` prints the shared steps, the mode's runbook, the verified project context, the global memory/notes and the template list as one brief — that is the normal way to start. The files here are what it assembles.

One executable checklist per mode. Each runbook is the *order of operations*; the depth is in [`../INITIALIZER.md`](../INITIALIZER.md) at the sections it cites. Follow the runbook top to bottom; do not skip a numbered step; stop at every **STOP** for the owner.

| Runbook | Mode | Starts from |
| --- | --- | --- |
| [INIT.md](./INIT.md) | greenfield | `kiwi init` |
| [ADOPT.md](./ADOPT.md) | existing code, no coherent system | `kiwi init` |
| [UPGRADE.md](./UPGRADE.md) | existing system, older `kiwi_version` | `kiwi upgrade` |
| [AUDIT.md](./AUDIT.md) | check drift, change nothing | `kiwi init` (detected) or "run an AUDIT" |
| [AMEND.md](./AMEND.md) | owner states a new/changed rule | "AMEND: …" |
| [EXTEND.md](./EXTEND.md) | add a pruned module | "EXTEND: …" |

Shared conventions: `kiwi` is on the owner's PATH; if not, use `~/.thekiwidev/bin/kiwi`. All `kiwi` commands are safe to run (read-only or idempotent; none touches Git). Every runbook ends with `kiwi stamp` (INIT/ADOPT/UPGRADE) or a report (AUDIT/AMEND/EXTEND), then `kiwi doctor --project`.
