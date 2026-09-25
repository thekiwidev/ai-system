---
name: kiwi-author
description: Create or update any repeatable system document in its standard shape and home — workflow, skill, rule, agent, plan, decision (ADR) or PRD — for requests like "set up a new rule", "add a skill for …", "create a plan", "record this decision", "update the X workflow/rule/plan". Routes workflows to create-workflow and PRDs to create-prd; never invents a new format.
invocable: true
---

# kiwi-author

One procedure for every kind in `rules/kinds.md` (RULE-KIND-001). The table there is authoritative for homes, templates and indexes; this skill is how to use it.

## When to use

The owner asks to set up, create, add, record, change or update a workflow, skill, rule, instruction, agent, plan, decision or PRD — in a project or in `~/.thekiwidev`.

## Procedure

1. **Name the kind.** Map the request to one kind from `rules/kinds.md`. "Instruction" or "convention" is a rule. "Every time I do X, these steps" is a workflow. Unsure between two kinds: ask, with a one-line explanation of each.
2. **Route the specialised kinds.**
   - workflow → follow the `create-workflow` skill and stop here.
   - PRD → follow the `create-prd` skill (inside the project's feature workflow) and stop here.
   - rule, in a project → follow the `kiwi-system` AMEND runbook (`kiwi agent AMEND`): canonical home, `RULES.md` registration and cascade.
3. **Decide create or update.** Resolve the name project first, then global. Search for the same topic under other names; if one exists, it is an update, not a second file.
4. **Scope.** In a project: the project home. In `~/.thekiwidev`: the global home. Never write the global folder from a project (RULE-SCOPE-001); propose it in the report.
5. **Gather, then ask.** Read what the repository already records on the topic. Ask the owner only what the files cannot answer — at most the questions the template's sections need.
6. **Create** with `kiwi new <kind> <name>` (skill, agent, rule, plan, decision) so the file starts from the template in the right home, then fill every template section. Do not add sections the template does not have; do not drop sections it has (write "Not applicable — reason" instead).
7. **Update** in place: read the whole file first, change only what was asked, keep the template's structure, bump `version` / `last_reviewed` where the kind has them.
8. **Register** in the kind's index (`rules/kinds.md` → "Registered in"). A plan that completes moves from `plans/active/` to `plans/completed/` and changes index section. A superseded decision gets a new ADR; the old one is marked `Superseded by ADR-nnn`, never rewritten.
9. **Record and verify.** Changelog entry per the scope's workflow; `kiwi doctor` clean (and `kiwi install` in the global folder).

## Output

Report: kind · created or updated · path · index updated · what was asked of the owner · `kiwi doctor` result · anything proposed for the global folder.
