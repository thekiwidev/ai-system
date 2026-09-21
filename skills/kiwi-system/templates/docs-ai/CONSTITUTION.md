---
doc: CONSTITUTION
purpose: "Enduring engineering principles that do not change with the task"
authority: canonical
hosts_rules: [RULE-YAGNI-001]
mirrors_rules: [RULE-GIT-001, RULE-VERIF-002]
last_reviewed: "{{DATE}}"
---

# CONSTITUTION — {{PROJECT}}

## 1. YAGNI governs (RULE-YAGNI-001)

Create only what has a real purpose now. The ladder — stop at the first rung that works:

1. Does this need to exist?
2. Does something already do it?
3. Can an existing thing be reorganised instead of duplicated?
4. Can a smaller structure satisfy it?
5. Only then create the new file, abstraction, or dependency.

YAGNI forbids: speculative abstraction, "future-proofing", configuration for flexibility nobody asked for, service/repository layers by default, documents for their own sake. YAGNI does **not** excuse: skipping validation, skipping tests, skipping security, or skipping documentation of what was actually built.

<!-- Add the project's concrete YAGNI examples: things that must not be generalised, abstractions that require owner approval. -->

## 2. Reuse over creation; smallest correct change

Search the codebase before writing. The smallest change that is correct beats the most elegant one that is larger. Correctness before cleverness.

## 3. Mandatory, always

- Security: no secrets in code or docs; validate every input; authorise at every boundary, server-side.
- Tests accompany the logic they test.
- Fixed decisions are not relitigated (RULE-AUTON-002).
- Documentation describes reality; when reality changes, the documentation changes in the same task.
- The owner controls Git (RULE-GIT-001, canonical in `AGENT-CORE.md` § 5).
- No gate is ever weakened to pass (RULE-VERIF-002, canonical in `VERIFICATION.md`).

## 4. Project-specific principles *(if applicable)*

<!-- Only principles the owner actually holds for this project, each with its reason. -->
