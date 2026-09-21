---
doc: VERIFICATION
purpose: "The completion gates — the project's real commands, what else a change may require, and the definition of done"
authority: canonical
hosts_rules: [RULE-VERIF-001, RULE-VERIF-002]
mirrors_rules: []
last_reviewed: "{{DATE}}"
---

# VERIFICATION — {{PROJECT}}

## 1. The gates (RULE-VERIF-001)

<!-- Only commands that actually exist in the repository (package manifest scripts, Makefile, CI). Record preconditions (services, env). -->

| Gate | Command | Precondition |
| --- | --- | --- |
| Typecheck | `{{TYPECHECK_CMD}}` | |
| Lint | `{{LINT_CMD}}` | |
| Test | `{{TEST_CMD}}` | {{TEST_PRECONDITION}} |
| Build | `{{BUILD_CMD}}` | |

All gates run before any task is reported complete; the report shows each command and its actual result.

## 2. When the change calls for more *(if applicable)*

<!-- Migration validation, E2E, manual checks against the owner-run dev server, contract checks. -->

## 3. Tests ship with the logic

New behaviour arrives with its tests; a bug fix arrives with the regression test that failed before the fix.

## 4. Never weaken a gate (RULE-VERIF-002)

No test is skipped, deleted or loosened, no lint rule disabled, no type check relaxed, no threshold lowered, to make work appear complete. If a gate is wrong, that is a separate owner-approved change.

## 5. Definition of done — the checklist

```text
[ ] Requirement matches the authoritative product documentation
[ ] Acceptance criteria satisfied
[ ] Existing implementation searched for reuse; no unnecessary abstraction or dependency
[ ] Tests written/updated where required
[ ] All gates pass (actual output in the report)
[ ] Security requirements intact
[ ] Documentation impact review run against the diff; affected layers updated
[ ] Plan updated; changelog updated when required; handoff accurate or cleared
[ ] Derived context docs regenerated and stamped for every changed source (`kiwi ctx status` clean)
[ ] No unauthorised Git operation; owner told it is ready for commit
```
