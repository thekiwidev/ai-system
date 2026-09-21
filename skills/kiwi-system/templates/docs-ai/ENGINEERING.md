---
doc: ENGINEERING
purpose: "Code-writing standards that actually apply in this repository: language, types, naming, boundaries, validation, errors, security, data, dependencies, testing, review"
authority: canonical
hosts_rules: []
mirrors_rules: [RULE-GIT-001]
last_reviewed: "{{DATE}}"
---

# ENGINEERING — {{PROJECT}}

> Only standards that are real project requirements. Where this document is silent, the global rules in `~/.thekiwidev/rules/` apply (coding-style, testing, security, patterns, performance, git-workflow); where it speaks, it wins. Competing conventions found in the code are resolved here (canonical pattern) and recorded in `NOTES.md` (legacy pattern, status: `legacy, do not extend` / `migration in progress` / `tolerated`).

## 0. Global rules in force

The owner's global rules live in `~/.thekiwidev/rules/` and are **pointed to, never copied**. Adopted rules update themselves when the global file changes; overrides stay until amended here. To change a row, say "amend rule: …" in this project.

| Global rule | Status | Project statement / reason |
| --- | --- | --- |
| `~/.thekiwidev/rules/coding-style.md` | adopted \| overridden \| n/a | <!-- override text or reason, else "—" --> |
| `~/.thekiwidev/rules/testing.md` | | |
| `~/.thekiwidev/rules/security.md` | | |
| `~/.thekiwidev/rules/git-workflow.md` | adopted | RULE-GIT-001 is canonical in AGENT-CORE.md § 5 |
| `~/.thekiwidev/rules/performance.md` | | |
| `~/.thekiwidev/rules/patterns.md` | | |
| `~/.thekiwidev/rules/agents.md` | | |
| `~/.thekiwidev/rules/hooks.md` | | |

<!-- One row per global rule that exists at the time of writing (kiwi list). Project-only rules go in the sections below and are registered in RULES.md with origin owner. -->

## 1. Language and type posture

## 2. Naming

## 3. Module boundaries

## 4. Validation and errors

## 5. Security and data handling

## 6. Dependencies

## 7. Testing expectations

## 8. Review expectations

## 9. Git conventions

Owner-controlled (RULE-GIT-001, `AGENT-CORE.md` § 5). Commit message format and PR conventions for when the owner authorises: see the global `git-workflow` rule unless overridden here.
