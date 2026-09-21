---
doc: decisions/INDEX
purpose: "Index of accepted architecture, product and engineering decisions"
authority: reference
hosts_rules: []
mirrors_rules: [RULE-AUTON-002]
last_reviewed: "{{DATE}}"
---

# Decisions — index

Durable decisions with their reasoning. An agent proposing to reverse one of these is proposing to reverse an owner decision — ask first (RULE-AUTON-002).

| ID | Decision | Status |
| --- | --- | --- |

**Create a new ADR** only when a decision materially shapes the architecture, is meant to stay fixed, could plausibly be revisited by a future agent, and would be expensive to reverse. Never fabricate the alternatives that were considered — "not recorded" is a valid entry. Superseding = a new ADR marking the old one `Superseded by ADR-nnn`, never an edit in place.
