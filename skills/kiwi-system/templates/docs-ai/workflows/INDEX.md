---
doc: workflows/INDEX
purpose: "Reusable, repeatable procedures beyond the general task workflow — project-specific ones here, global ones by name"
authority: reference
hosts_rules: []
mirrors_rules: [RULE-CORE-004]
last_reviewed: "{{DATE}}"
---

# Workflows — index

Resolved per `AGENT-CORE.md` § 8 (vendored copy → `~/.thekiwidev/skills/<name>` → your installed copy).

| Workflow | Where | Use it when |
| --- | --- | --- |
| `create-prd` | global skill · vendored: {{yes/no}} | defining a new product capability (writes to `{{PRD_DIR}}`) |
| `feature-workflow` | global skill · vendored: {{yes/no}} | any request that introduces new product behaviour |
| `bugfix-workflow` | global skill · vendored: {{yes/no}} | any defect or regression |
| `kiwi-system` | global skill | initializing / upgrading / auditing / amending this system |

<!-- Project-specific workflows (e.g. E2E-WALKTHROUGH.md) as extra rows, files in this directory. -->
